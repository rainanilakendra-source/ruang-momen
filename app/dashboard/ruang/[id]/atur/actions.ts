"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { EventType } from "../../../../generated/prisma/enums";
import { requireUser } from "../../../../lib/auth";
import { EVENT_TYPES } from "../../../../lib/event";
import { resolveFrameKey, resolveThemeKey } from "../../../../lib/event-appearance";
import { prisma } from "../../../../lib/prisma";
import { storage } from "../../../../lib/storage";
import { getUserActivePlan, hasPlanFeature } from "../../../../lib/plan-limits";
import { PLAN_FEATURES } from "../../../../lib/plans";

const MAX_COVER_BYTES = 10 * 1024 * 1024;
const COVER_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export type RoomSettingsState = { status: "idle" | "success" | "error"; message: string | null };
export type RemoveCoverResult = { ok: true } | { ok: false; message: string };

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseEventDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function parseLocalDateTime(value: string, timezoneOffset: number): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match || !Number.isInteger(timezoneOffset) || timezoneOffset < -840 || timezoneOffset > 840) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const localParts = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (localParts.getUTCFullYear() !== year || localParts.getUTCMonth() !== month - 1 || localParts.getUTCDate() !== day || localParts.getUTCHours() !== hour || localParts.getUTCMinutes() !== minute) return null;
  const timestamp = Date.UTC(year, month - 1, day, hour, minute) + timezoneOffset * 60_000;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasMatchingSignature(bytes: Uint8Array, mimeType: keyof typeof COVER_EXTENSIONS): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

export async function saveRoomSettings(eventId: string, _previousState: RoomSettingsState, formData: FormData): Promise<RoomSettingsState> {
  const user = await requireUser();
  const event = await prisma.event.findFirst({ where: { id: eventId, ownerId: user.id }, select: { slug: true, coverStorageKey: true, themeKey: true, frameKey: true, guestGalleryEnabled: true, guestDownloadEnabled: true } });
  if (!event) return { status: "error", message: "Pengaturan gagal disimpan. Silakan coba lagi." };

  const name = stringValue(formData, "eventName").trim();
  const type = stringValue(formData, "eventType");
  const eventDate = parseEventDate(stringValue(formData, "eventDate"));
  const timezoneOffset = Number(stringValue(formData, "timezoneOffset"));
  const startsValue = stringValue(formData, "uploadStartsAt");
  const endsValue = stringValue(formData, "uploadEndsAt");
  const themeKey = resolveThemeKey(stringValue(formData, "themeKey"));
  const frameKey = resolveFrameKey(stringValue(formData, "frameKey"));
  const uploadStartsAt = parseLocalDateTime(startsValue, timezoneOffset);
  const uploadEndsAt = parseLocalDateTime(endsValue, timezoneOffset);

  if (!name || Array.from(name).length < 3) return { status: "error", message: "Nama acara minimal 3 karakter." };
  if (Array.from(name).length > 100) return { status: "error", message: "Nama acara maksimal 100 karakter." };
  if (!EVENT_TYPES.includes(type as EventType)) return { status: "error", message: "Pilih jenis acara yang valid." };
  if (!eventDate) return { status: "error", message: "Masukkan tanggal acara yang valid." };
  if ((startsValue && !uploadStartsAt) || (endsValue && !uploadEndsAt)) return { status: "error", message: "Masukkan waktu masa aktif yang valid." };
  if (uploadStartsAt && uploadEndsAt && uploadEndsAt <= uploadStartsAt) return { status: "error", message: "Waktu berakhir harus setelah waktu mulai." };
  const [activePlan, galleryAllowed, downloadAllowed, appearanceAllowed] = await Promise.all([getUserActivePlan(user.id), hasPlanFeature(user.id, PLAN_FEATURES.GALLERY), hasPlanFeature(user.id, PLAN_FEATURES.DOWNLOAD_ORIGINAL), hasPlanFeature(user.id, PLAN_FEATURES.CUSTOM_BRANDING)]);
  if (!activePlan?.plan.limit) return { status: "error", message: "Paket aktif dengan limit yang valid diperlukan untuk mengatur ruang." };
  if (uploadStartsAt && uploadEndsAt) {
    const activeDays = Math.ceil((uploadEndsAt.getTime() - uploadStartsAt.getTime()) / 86_400_000);
    if (activeDays > activePlan.plan.limit.maxActiveDays) return { status: "error", message: `Masa aktif maksimal paket ini adalah ${activePlan.plan.limit.maxActiveDays} hari.` };
  }

  const coverValue = formData.get("cover");
  const cover = coverValue instanceof File && coverValue.size > 0 ? coverValue : null;
  let newCoverKey: string | null = null;
  if (cover) {
    if (cover.size > MAX_COVER_BYTES) return { status: "error", message: "Ukuran sampul maksimal 10 MB." };
    const mimeType = cover.type as keyof typeof COVER_EXTENSIONS;
    const extension = COVER_EXTENSIONS[mimeType];
    if (!extension) return { status: "error", message: "Gunakan sampul berformat JPEG, PNG, atau WebP." };
    const bytes = new Uint8Array(await cover.arrayBuffer());
    if (!hasMatchingSignature(bytes, mimeType)) return { status: "error", message: "File sampul tidak valid." };
    newCoverKey = `events/${eventId}/cover/${randomUUID()}.${extension}`;
    try {
      await storage.save(newCoverKey, bytes);
    } catch {
      return { status: "error", message: "Pengaturan gagal disimpan. Silakan coba lagi." };
    }
  }

  try {
    await prisma.event.update({
      where: { id: eventId, ownerId: user.id },
      data: {
        name,
        type: type as EventType,
        eventDate,
        themeKey: appearanceAllowed ? themeKey : event.themeKey,
        frameKey: appearanceAllowed ? frameKey : event.frameKey,
        guestUploadEnabled: formData.get("guestUploadEnabled") === "on",
        guestGalleryEnabled: galleryAllowed ? formData.get("guestGalleryEnabled") === "on" : event.guestGalleryEnabled,
        guestDownloadEnabled: downloadAllowed ? formData.get("guestDownloadEnabled") === "on" : event.guestDownloadEnabled,
        uploadStartsAt,
        uploadEndsAt,
        ...(newCoverKey ? { coverStorageKey: newCoverKey } : {}),
      },
    });
  } catch {
    if (newCoverKey) await storage.delete(newCoverKey).catch(() => undefined);
    return { status: "error", message: "Pengaturan gagal disimpan. Silakan coba lagi." };
  }

  if (newCoverKey && event.coverStorageKey) await storage.delete(event.coverStorageKey).catch(() => undefined);
  revalidatePath(`/dashboard/ruang/${eventId}`);
  revalidatePath(`/dashboard/ruang/${eventId}/atur`);
  revalidatePath(`/r/${event.slug}`);
  revalidatePath(`/r/${event.slug}/album`);
  return { status: "success", message: "Pengaturan ruang tersimpan." };
}

export async function removeRoomCover(eventId: string): Promise<RemoveCoverResult> {
  const user = await requireUser();
  const event = await prisma.event.findFirst({ where: { id: eventId, ownerId: user.id }, select: { slug: true, coverStorageKey: true } });
  if (!event) return { ok: false, message: "Sampul gagal dihapus. Silakan coba lagi." };
  if (!event.coverStorageKey) return { ok: true };

  try {
    await prisma.event.update({ where: { id: eventId, ownerId: user.id }, data: { coverStorageKey: null } });
    await storage.delete(event.coverStorageKey);
  } catch {
    return { ok: false, message: "Sampul gagal dihapus. Silakan coba lagi." };
  }

  revalidatePath(`/dashboard/ruang/${eventId}`);
  revalidatePath(`/dashboard/ruang/${eventId}/atur`);
  revalidatePath(`/r/${event.slug}`);
  return { ok: true };
}
