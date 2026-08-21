export const ORDER_STATUSES = {
  PENDING: "PENDING", WAITING_PAYMENT: "WAITING_PAYMENT", WAITING_CONFIRMATION: "WAITING_CONFIRMATION",
  PAID: "PAID", REJECTED: "REJECTED", CANCELLED: "CANCELLED",
} as const;

export function orderProofStorageKey(orderId: string, fileUrl: string): string | null {
  const prefix = `/api/orders/${orderId}/proof/`;
  if (!fileUrl.startsWith(prefix)) return null;
  const filename = fileUrl.slice(prefix.length);
  return /^[a-f0-9-]+\.(?:jpg|png|webp)$/u.test(filename) ? `orders/${orderId}/proof/${filename}` : null;
}
