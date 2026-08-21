"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "../../lib/prisma";
import { storage } from "../../lib/storage";
import { MAX_UPLOAD_BYTES } from "../../lib/upload";
import { normalizePhotoSource } from "../../lib/photo-source";
import { validateGuestName } from "../../lib/guest-name";
import { EVENT_UPLOAD_STATUS_DETAILS, getEventUploadStatus } from "../../lib/event-upload";
import { isLanguage } from "../../lib/i18n";
import { checkPlanLimit, PLAN_LIMIT_TYPES, PlanLimitExceededError } from "../../lib/plan-limits";

const MIME_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export type UploadPhotoResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string; retryable: boolean };

const CLIENT_UPLOAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function selectedPhoto(formData: FormData): File | null {
  for (const field of ["queuePhoto", "cameraPhoto", "galleryPhoto"]) {
    const value = formData.get(field);
    if (value instanceof File && value.size > 0) return value;
  }
  return null;
}

function hasMatchingSignature(bytes: Uint8Array, mimeType: keyof typeof MIME_EXTENSIONS): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

function safeOriginalName(name: string): string {
  const baseName = path.basename(name).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (baseName || "momen").slice(0, 255);
}

export async function uploadGuestPhoto(slug: string, formData: FormData): Promise<UploadPhotoResult> {
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, ownerId: true, guestUploadEnabled: true, uploadStartsAt: true, uploadEndsAt: true } });
  if (!event) return { status: "error", message: "Ruang acara tidak ditemukan.", retryable: false };
  const uploadStatus = getEventUploadStatus(event);
  if (uploadStatus !== "OPEN") return { status: "error", message: EVENT_UPLOAD_STATUS_DETAILS[uploadStatus].message, retryable: false };

  const guestName = validateGuestName(formData.get("guestName"));
  if (!guestName.ok) return { status: "error", message: guestName.message, retryable: false };
  const languageValue = formData.get("language");
  const language = isLanguage(languageValue) ? languageValue : "id";

  const sourceValue = formData.get("source");
  const source = normalizePhotoSource(typeof sourceValue === "string" ? sourceValue : null);
  const clientUploadIdValue = formData.get("clientUploadId");
  const clientUploadId = typeof clientUploadIdValue === "string" ? clientUploadIdValue : "";
  if (!CLIENT_UPLOAD_ID_PATTERN.test(clientUploadId)) return { status: "error", message: "Identitas upload tidak valid.", retryable: false };

  const photo = selectedPhoto(formData);
  if (!photo) return { status: "error", message: "Pilih satu foto untuk dikirim.", retryable: false };
  if (photo.size > MAX_UPLOAD_BYTES) return { status: "error", message: "Ukuran foto maksimal 25 MB.", retryable: false };

  const mimeType = photo.type as keyof typeof MIME_EXTENSIONS;
  const extension = MIME_EXTENSIONS[mimeType];
  if (!extension) return { status: "error", message: "Gunakan foto berformat JPEG, PNG, atau WebP.", retryable: false };

  const bytes = new Uint8Array(await photo.arrayBuffer());
  if (!hasMatchingSignature(bytes, mimeType)) return { status: "error", message: "File ini bukan foto JPEG, PNG, atau WebP yang valid.", retryable: false };

  const existingPhoto = await prisma.photo.findUnique({ where: { clientUploadId }, select: { eventId: true } });
  if (existingPhoto) {
    if (existingPhoto.eventId === event.id) return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
    return { status: "error", message: "Foto tidak dapat dikirim.", retryable: false };
  }

  const proposedLimits = await Promise.all([
    checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.GUEST, { guestName: guestName.value, language }),
    checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.PHOTO, { additional: 1, language }),
    checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.STORAGE, { additional: photo.size, language }),
  ]);
  const blocked = proposedLimits.find((result) => !result.allowed);
  if (blocked) return { status: "error", message: blocked.message, retryable: false };

  // TODO: Add image optimization, thumbnail generation, EXIF orientation handling,
  // and Object Storage without modifying the original upload in this version.

  const now = new Date();
  const storageKey = `events/${event.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${extension}`;
  try {
    await storage.save(storageKey, bytes);
  } catch {
    return { status: "error", message: "Foto belum berhasil disimpan. Silakan coba lagi.", retryable: true };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const limits = await Promise.all([
        checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.GUEST, { guestName: guestName.value, language, client: tx }),
        checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.PHOTO, { additional: 1, language, client: tx }),
        checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.STORAGE, { additional: photo.size, language, client: tx }),
      ]);
      const exceeded = limits.find((result) => !result.allowed);
      if (exceeded) throw new PlanLimitExceededError(exceeded);
      await tx.photo.create({ data: { eventId: event.id, storageKey, originalName: safeOriginalName(photo.name), mimeType, sizeBytes: photo.size, source, guestName: guestName.value, clientUploadId } });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    await storage.delete(storageKey).catch(() => undefined);
    if (error instanceof PlanLimitExceededError) return { status: "error", message: error.result.message, retryable: false };
    const racedPhoto = await prisma.photo.findUnique({ where: { clientUploadId }, select: { eventId: true } }).catch(() => null);
    if (racedPhoto?.eventId === event.id) return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
    if (racedPhoto) return { status: "error", message: "Foto tidak dapat dikirim.", retryable: false };
    return { status: "error", message: "Foto belum berhasil dicatat. Silakan coba lagi.", retryable: true };
  }
  return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
}
