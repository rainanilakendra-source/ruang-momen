"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import {
  createGuestReactionIdentifier,
  GUEST_REACTION_COOKIE,
  GUEST_REACTION_COOKIE_MAX_AGE,
  parseGuestReactionIdentifier,
} from "../../lib/guest-reaction";
import { prisma } from "../../lib/prisma";
import { storage } from "../../lib/storage";
import { MAX_UPLOAD_BYTES } from "../../lib/upload";
import { normalizePhotoSource } from "../../lib/photo-source";
import { validateGuestName } from "../../lib/guest-name";
import { EVENT_UPLOAD_STATUS_DETAILS, getEventUploadStatus } from "../../lib/event-upload";
import { isLanguage } from "../../lib/i18n";
import { checkPlanLimit, hasPlanFeature, PLAN_LIMIT_TYPES, PlanLimitExceededError } from "../../lib/plan-limits";
import { PLAN_FEATURES } from "../../lib/plans";
import { Prisma } from "../../generated/prisma/client";
import { createBrowserPreview, hasHeicExtension, isHeicMimeType } from "../../lib/photo-preview";
import { consumeRateLimit, requestRateLimitKey } from "../../lib/rate-limit";

const MIME_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" } as const;

export type UploadPhotoResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string; retryable: boolean };

export type GuestbookState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

const CLIENT_UPLOAD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GUESTBOOK_MAX_MESSAGE_LENGTH = 500;
const GUESTBOOK_COOLDOWN_MS = 10_000;

function normalizeGuestbookMessage(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/gu, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "")
    .trim();
}

export async function submitGuestbookEntry(
  slug: string,
  _previousState: GuestbookState,
  formData: FormData,
): Promise<GuestbookState> {
  if (!slug || slug.length > 120) {
    return { status: "error", message: "Ruang acara tidak ditemukan." };
  }
  const rateLimit = consumeRateLimit(requestRateLimitKey("guestbook", await headers(), slug), 20, 10 * 60 * 1000);
  if (!rateLimit.allowed) return { status: "error", message: "Tunggu beberapa detik sebelum mengirim pesan lagi." };

  const guestName = validateGuestName(formData.get("guestName"));
  if (!guestName.ok) return { status: "error", message: guestName.message };

  const message = normalizeGuestbookMessage(formData.get("message"));
  const messageLength = Array.from(message).length;
  if (!messageLength) {
    return { status: "error", message: "Pesan tidak boleh kosong." };
  }
  if (messageLength > GUESTBOOK_MAX_MESSAGE_LENGTH) {
    return { status: "error", message: "Pesan maksimal 500 karakter." };
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!event) {
    return { status: "error", message: "Ruang acara tidak ditemukan." };
  }
  if (!(await hasPlanFeature(event.ownerId, PLAN_FEATURES.GUESTBOOK))) return { status: "error", message: "Fitur Buku Cerita tidak tersedia pada paket ruang ini." };

  const cookieStore = await cookies();
  const storedIdentifier = parseGuestReactionIdentifier(
    cookieStore.get(GUEST_REACTION_COOKIE)?.value,
  );
  const guestIdentifier =
    storedIdentifier ?? createGuestReactionIdentifier();

  const recentEntry = await prisma.guestbookEntry.findFirst({
    where: {
      eventId: event.id,
      guestIdentifier,
      createdAt: { gte: new Date(Date.now() - GUESTBOOK_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recentEntry) {
    return {
      status: "error",
      message: "Tunggu beberapa detik sebelum mengirim pesan lagi.",
    };
  }

  try {
    await prisma.guestbookEntry.create({
      data: {
        eventId: event.id,
        guestIdentifier,
        guestName: guestName.value ?? "Tamu",
        message,
      },
      select: { id: true },
    });
  } catch {
    return {
      status: "error",
      message: "Pesan belum berhasil dikirim. Silakan coba lagi.",
    };
  }

  if (!storedIdentifier) {
    cookieStore.set(GUEST_REACTION_COOKIE, guestIdentifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: GUEST_REACTION_COOKIE_MAX_AGE,
    });
  }

  revalidatePath(`/r/${slug}`);
  revalidatePath(`/dashboard/ruang/${event.id}`);
  return { status: "success", message: "Pesan berhasil dikirim." };
}

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
  if (mimeType === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (bytes.length < 16 || String.fromCharCode(...bytes.slice(4, 8)) !== "ftyp") return false;
  const boxSize = Math.min(bytes.length, new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false));
  const brands = new Set<string>();
  for (let offset = 8; offset + 4 <= boxSize; offset += 4) brands.add(String.fromCharCode(...bytes.slice(offset, offset + 4)));
  return ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].some((brand) => brands.has(brand));
}

function safeOriginalName(name: string): string {
  const baseName = path.basename(name).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (baseName || "momen").slice(0, 255);
}

export async function uploadGuestPhoto(slug: string, formData: FormData): Promise<UploadPhotoResult> {
  const rateLimit = consumeRateLimit(requestRateLimitKey("guest-upload", await headers(), slug), 20, 10 * 60 * 1000);
  if (!rateLimit.allowed) return { status: "error", message: "Foto belum berhasil disimpan. Silakan coba lagi.", retryable: true };
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
  if (!extension) return { status: "error", message: "Gunakan foto berformat JPEG, PNG, WebP, HEIC, atau HEIF.", retryable: false };
  if (isHeicMimeType(mimeType) && !hasHeicExtension(photo.name)) return { status: "error", message: "Nama dan tipe file HEIC/HEIF tidak sesuai.", retryable: false };

  const bytes = new Uint8Array(await photo.arrayBuffer());
  if (!hasMatchingSignature(bytes, mimeType)) return { status: "error", message: "File ini bukan foto JPEG, PNG, WebP, HEIC, atau HEIF yang valid.", retryable: false };

  let previewBytes: Uint8Array | null = null;
  if (isHeicMimeType(mimeType)) {
    try {
      previewBytes = await createBrowserPreview(bytes);
    } catch {
      return { status: "error", message: "Foto HEIC/HEIF tidak valid atau tidak dapat diproses.", retryable: false };
    }
  }

  const existingPhoto = await prisma.photo.findUnique({ where: { clientUploadId }, select: { eventId: true } });
  if (existingPhoto) {
    if (existingPhoto.eventId === event.id) return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
    return { status: "error", message: "Foto tidak dapat dikirim.", retryable: false };
  }

  const proposedLimits = await Promise.all([
    checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.PHOTO, { additional: 1, language }),
    checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.STORAGE, { additional: photo.size, language }),
  ]);
  if (!(await hasPlanFeature(event.ownerId, PLAN_FEATURES.GUEST_UPLOAD))) return { status: "error", message: "Pengiriman momen tidak tersedia pada paket ruang ini.", retryable: false };
  const blocked = proposedLimits.find((result) => !result.allowed);
  if (blocked) return { status: "error", message: blocked.message, retryable: false };

  const now = new Date();
  const storageKey = `events/${event.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${extension}`;
  const previewStorageKey = previewBytes ? `events/${event.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-preview.jpg` : null;
  try {
    await storage.save(storageKey, bytes);
    if (previewStorageKey && previewBytes) await storage.save(previewStorageKey, previewBytes);
  } catch {
    await storage.delete(storageKey).catch(() => undefined);
    if (previewStorageKey) await storage.delete(previewStorageKey).catch(() => undefined);
    return { status: "error", message: "Foto belum berhasil disimpan. Silakan coba lagi.", retryable: true };
  }

  try {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await prisma.$transaction(async (tx) => {
      const limits = await Promise.all([
        checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.PHOTO, { additional: 1, language, client: tx }),
        checkPlanLimit(event.ownerId, PLAN_LIMIT_TYPES.STORAGE, { additional: photo.size, language, client: tx }),
      ]);
      const exceeded = limits.find((result) => !result.allowed);
      if (exceeded) throw new PlanLimitExceededError(exceeded);
      await tx.photo.create({ data: { eventId: event.id, storageKey, previewStorageKey, originalName: safeOriginalName(photo.name), mimeType, sizeBytes: photo.size, source, guestName: guestName.value, clientUploadId } });
        }, { isolationLevel: "Serializable" });
        break;
      } catch (error) {
        if (attempt < 3 && error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") continue;
        throw error;
      }
    }
  } catch (error) {
    await storage.delete(storageKey).catch(() => undefined);
    if (previewStorageKey) await storage.delete(previewStorageKey).catch(() => undefined);
    if (error instanceof PlanLimitExceededError) return { status: "error", message: error.result.message, retryable: false };
    const racedPhoto = await prisma.photo.findUnique({ where: { clientUploadId }, select: { eventId: true } }).catch(() => null);
    if (racedPhoto?.eventId === event.id) return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
    if (racedPhoto) return { status: "error", message: "Foto tidak dapat dikirim.", retryable: false };
    return { status: "error", message: "Foto belum berhasil dicatat. Silakan coba lagi.", retryable: true };
  }
  return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
}
