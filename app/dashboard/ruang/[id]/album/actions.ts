"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { storage } from "../../../../lib/storage";

export async function deletePhoto(photoId: string): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  const photo = await prisma.photo.findFirst({ where: { id: photoId, event: { ownerId: user.id } }, select: { id: true, eventId: true, storageKey: true, previewStorageKey: true } });
  if (!photo) return { ok: false, message: "Momen tidak ditemukan." };

  try {
    await storage.delete(photo.storageKey);
    if (photo.previewStorageKey) await storage.delete(photo.previewStorageKey);
    await prisma.photo.delete({ where: { id: photo.id } });
  } catch {
    return { ok: false, message: "Momen gagal dihapus. Silakan coba lagi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/album");
  revalidatePath(`/dashboard/ruang/${photo.eventId}`);
  revalidatePath(`/dashboard/ruang/${photo.eventId}/album`);
  return { ok: true, message: "Momen berhasil dihapus." };
}
