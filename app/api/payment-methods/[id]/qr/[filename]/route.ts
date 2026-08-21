import { paymentQrStorageKey } from "../../../../../lib/payment-methods";
import { prisma } from "../../../../../lib/prisma";
import { storage } from "../../../../../lib/storage";

const MIME_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; filename: string }> }) {
  const { id, filename } = await params;
  const method = await prisma.paymentMethod.findUnique({ where: { id }, select: { qrImageUrl: true } });
  if (!method?.qrImageUrl || !method.qrImageUrl.endsWith(`/${filename}`)) return new Response("Not found", { status: 404 });
  const key = paymentQrStorageKey(id, method.qrImageUrl);
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_TYPES[extension];
  if (!key || !mimeType) return new Response("Not found", { status: 404 });
  try {
    const bytes = await storage.read(key);
    return new Response(Uint8Array.from(bytes).buffer, { headers: { "Content-Type": mimeType, "Content-Length": String(bytes.byteLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
