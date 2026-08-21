import { prisma } from "./prisma";

export const PAYMENT_TYPES = {
  BANK_TRANSFER: "BANK_TRANSFER",
  QRIS: "QRIS",
  EWALLET: "EWALLET",
} as const;

export const PAYMENT_MODES = {
  STATIC: "STATIC",
  DYNAMIC: "DYNAMIC",
} as const;

export function getActivePaymentMethods() {
  return prisma.paymentMethod.findMany({
    where: { active: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: { id: true, name: true, type: true, mode: true, description: true, bankName: true, accountName: true, accountNumber: true, qrImageUrl: true, provider: true, instructions: true },
  });
}

export function paymentQrStorageKey(paymentMethodId: string, qrImageUrl: string): string | null {
  const prefix = `/api/payment-methods/${paymentMethodId}/qr/`;
  if (!qrImageUrl.startsWith(prefix)) return null;
  const filename = qrImageUrl.slice(prefix.length);
  return /^[a-f0-9-]+\.(?:jpg|png|webp)$/u.test(filename) ? `payment-methods/${paymentMethodId}/qr/${filename}` : null;
}
