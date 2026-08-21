"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "../../lib/auth";
import { ORDER_STATUSES, orderProofStorageKey } from "../../lib/orders";
import { prisma } from "../../lib/prisma";
import { storage } from "../../lib/storage";
export type ProofState = { error: string | null; success: boolean };
const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
function hasValidImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}
export async function uploadPaymentProof(orderId: string, _state: ProofState, formData: FormData): Promise<ProofState> {
  const user = await requireUser();
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id, status: { in: [ORDER_STATUSES.WAITING_PAYMENT, ORDER_STATUSES.WAITING_CONFIRMATION, ORDER_STATUSES.REJECTED] } }, select: { paymentProof: { select: { fileUrl: true } } } });
  if (!order) return { error: "orders.errors.notUploadable", success: false };
  const file = formData.get("proof"); const noteValue = formData.get("note"); const note = typeof noteValue === "string" ? noteValue.trim().slice(0, 1000) : null;
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) return { error: "orders.errors.fileSize", success: false };
  const ext = extensions[file.type as keyof typeof extensions]; if (!ext) return { error: "orders.errors.fileType", success: false };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, file.type)) return { error: "orders.errors.fileContent", success: false };
  const filename = `${randomUUID()}.${ext}`; const key = `orders/${orderId}/proof/${filename}`; const fileUrl = `/api/orders/${orderId}/proof/${filename}`;
  try { await storage.save(key, bytes); } catch { return { error: "orders.errors.storage", success: false }; }
  try {
    await prisma.$transaction(async (tx) => {
      const accepted = await tx.order.updateMany({
        where: { id: orderId, userId: user.id, status: { in: [ORDER_STATUSES.WAITING_PAYMENT, ORDER_STATUSES.WAITING_CONFIRMATION, ORDER_STATUSES.REJECTED] } },
        data: { status: ORDER_STATUSES.WAITING_CONFIRMATION },
      });
      if (accepted.count !== 1) throw new Error("Order status changed");
      await tx.paymentProof.upsert({ where: { orderId }, create: { orderId, fileUrl, note }, update: { fileUrl, note, uploadedAt: new Date() } });
    });
  } catch { await storage.delete(key).catch(() => undefined); return { error: "orders.errors.record", success: false }; }
  const oldKey = order.paymentProof?.fileUrl ? orderProofStorageKey(orderId, order.paymentProof.fileUrl) : null; if (oldKey) await storage.delete(oldKey).catch(() => undefined);
  revalidatePath(`/dashboard/orders/${orderId}`); revalidatePath("/dashboard/orders"); return { error: null, success: true };
}
