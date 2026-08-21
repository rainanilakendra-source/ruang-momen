"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "../../lib/prisma";
import { storage } from "../../lib/storage";
import { MAX_UPLOAD_BYTES } from "../../lib/upload";
import { normalizePhotoSource } from "../../lib/photo-source";
import { validateGuestName } from "../../lib/guest-name";

const MIME_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export type UploadPhotoState =
  | { status: "idle"; message: null }
  | { status: "success" | "error"; message: string };

function selectedPhoto(formData: FormData): File | null {
  for (const field of ["cameraPhoto", "galleryPhoto"]) {
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

export async function uploadGuestPhoto(slug: string, source: string | null, _previousState: UploadPhotoState, formData: FormData): Promise<UploadPhotoState> {
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return { status: "error", message: "Ruang acara tidak ditemukan." };

  const guestName = validateGuestName(formData.get("guestName"));
  if (!guestName.ok) return { status: "error", message: guestName.message };

  const photo = selectedPhoto(formData);
  if (!photo) return { status: "error", message: "Pilih satu foto untuk dikirim." };
  if (photo.size > MAX_UPLOAD_BYTES) return { status: "error", message: "Ukuran foto maksimal 25 MB." };

  const mimeType = photo.type as keyof typeof MIME_EXTENSIONS;
  const extension = MIME_EXTENSIONS[mimeType];
  if (!extension) return { status: "error", message: "Gunakan foto berformat JPEG, PNG, atau WebP." };

  const bytes = new Uint8Array(await photo.arrayBuffer());
  if (!hasMatchingSignature(bytes, mimeType)) return { status: "error", message: "File ini bukan foto JPEG, PNG, atau WebP yang valid." };

  // TODO: Add image optimization, thumbnail generation, EXIF orientation handling,
  // and Object Storage without modifying the original upload in this version.

  const now = new Date();
  const storageKey = `events/${event.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${extension}`;
  try {
    await storage.save(storageKey, bytes);
  } catch {
    return { status: "error", message: "Foto belum berhasil disimpan. Silakan coba lagi." };
  }

  try {
    await prisma.photo.create({ data: { eventId: event.id, storageKey, originalName: safeOriginalName(photo.name), mimeType, sizeBytes: photo.size, source: normalizePhotoSource(source), guestName: guestName.value } });
  } catch {
    await storage.delete(storageKey).catch(() => undefined);
    return { status: "error", message: "Foto belum berhasil dicatat. Silakan coba lagi." };
  }
  return { status: "success", message: "Momen berhasil dikirim ke ruang ini." };
}
