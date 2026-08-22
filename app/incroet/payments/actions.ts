"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "../../lib/auth";
import { PAYMENT_MODES, PAYMENT_TYPES, paymentQrStorageKey } from "../../lib/payment-methods";
import { prisma } from "../../lib/prisma";
import { ROLES } from "../../lib/roles";
import { storage } from "../../lib/storage";

export type PaymentFormState = { error: string | null };
const MAX_QR_BYTES = 5 * 1024 * 1024;
const QR_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validImageSignature(bytes: Uint8Array, mime: keyof typeof QR_EXTENSIONS): boolean {
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

async function prepareQrFile(paymentMethodId: string, formData: FormData) {
  const value = formData.get("qrImage");
  if (!(value instanceof File) || value.size === 0) return { success: true, data: null } as const;
  if (value.size > MAX_QR_BYTES) return { success: false, error: "Ukuran QR maksimal 5 MB." } as const;
  const mime = value.type as keyof typeof QR_EXTENSIONS;
  const extension = QR_EXTENSIONS[mime];
  if (!extension) return { success: false, error: "QR harus berformat JPEG, PNG, atau WebP." } as const;
  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!validImageSignature(bytes, mime)) return { success: false, error: "File QR tidak valid." } as const;
  const filename = `${randomUUID()}.${extension}`;
  return { success: true, data: { bytes, key: `payment-methods/${paymentMethodId}/qr/${filename}`, url: `/api/payment-methods/${paymentMethodId}/qr/${filename}` } } as const;
}

function parseForm(formData: FormData) {
  const name = text(formData, "name");
  const type = text(formData, "type");
  const mode = text(formData, "mode");
  const description = text(formData, "description");
  const bankName = text(formData, "bankName");
  const accountName = text(formData, "accountName");
  const accountNumber = text(formData, "accountNumber");
  const instructions = text(formData, "instructions");
  if (!name || name.length > 100) return { success: false, error: "Nama wajib diisi dan maksimal 100 karakter." } as const;
  if (!Object.values(PAYMENT_TYPES).includes(type as (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES])) return { success: false, error: "Tipe pembayaran tidak valid." } as const;
  if (mode !== PAYMENT_MODES.STATIC) return { success: false, error: "V1 hanya mendukung mode STATIC." } as const;
  if ([description, instructions].some((value) => value.length > 2000) || [bankName, accountName, accountNumber].some((value) => value.length > 150)) return { success: false, error: "Data pembayaran terlalu panjang." } as const;
  return { success: true, data: { name, type, mode, description: description || null, bankName: bankName || null, accountName: accountName || null, accountNumber: accountNumber || null, instructions: instructions || null } } as const;
}

export async function createPaymentMethod(_state: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error };
  const id = randomUUID();
  const qr = await prepareQrFile(id, formData);
  if (!qr.success) return { error: qr.error };
  if (qr.data) {
    try { await storage.save(qr.data.key, qr.data.bytes); } catch { return { error: "QR gagal disimpan." }; }
  }
  try {
    await prisma.paymentMethod.create({ data: { id, ...parsed.data, qrImageUrl: qr.data?.url }, select: { id: true } });
  } catch {
    if (qr.data) await storage.delete(qr.data.key).catch(() => undefined);
    return { error: "Metode pembayaran gagal dibuat." };
  }
  revalidatePath("/incroet/payments");
  redirect("/incroet/payments");
}

export async function updatePaymentMethod(paymentMethodId: string, _state: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const existing = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId }, select: { qrImageUrl: true } });
  if (!existing) return { error: "Metode pembayaran tidak ditemukan." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error };
  const qr = await prepareQrFile(paymentMethodId, formData);
  if (!qr.success) return { error: qr.error };
  if (qr.data) {
    try { await storage.save(qr.data.key, qr.data.bytes); } catch { return { error: "QR gagal disimpan." }; }
  }
  try {
    await prisma.paymentMethod.update({ where: { id: paymentMethodId }, data: { ...parsed.data, ...(qr.data ? { qrImageUrl: qr.data.url } : {}) }, select: { id: true } });
  } catch {
    if (qr.data) await storage.delete(qr.data.key).catch(() => undefined);
    return { error: "Metode pembayaran gagal diperbarui." };
  }
  const oldKey = existing.qrImageUrl ? paymentQrStorageKey(paymentMethodId, existing.qrImageUrl) : null;
  if (qr.data && oldKey) await storage.delete(oldKey).catch(() => undefined);
  revalidatePath("/incroet/payments");
  redirect("/incroet/payments");
}

export async function togglePaymentMethod(paymentMethodId: string): Promise<void> {
  await requireRole(ROLES.SUPER_ADMIN);
  const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId }, select: { active: true } });
  if (!method) return;
  await prisma.paymentMethod.update({ where: { id: paymentMethodId }, data: { active: !method.active }, select: { id: true } });
  revalidatePath("/incroet/payments");
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  await requireRole(ROLES.SUPER_ADMIN);
  const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId }, select: { qrImageUrl: true } });
  if (!method) return;
  await prisma.paymentMethod.delete({ where: { id: paymentMethodId } });
  const key = method.qrImageUrl ? paymentQrStorageKey(paymentMethodId, method.qrImageUrl) : null;
  if (key) await storage.delete(key).catch(() => undefined);
  revalidatePath("/incroet/payments");
}
