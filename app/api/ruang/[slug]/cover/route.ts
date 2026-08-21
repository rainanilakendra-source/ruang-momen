import { prisma } from "../../../../lib/prisma";
import { storage } from "../../../../lib/storage";

const MIME_BY_EXTENSION: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { coverStorageKey: true } });
  if (!event?.coverStorageKey) return new Response("Not found", { status: 404 });

  const extension = event.coverStorageKey.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) return new Response("Not found", { status: 404 });

  try {
    const bytes = await storage.read(event.coverStorageKey);
    return new Response(Uint8Array.from(bytes).buffer, { headers: { "Content-Type": mimeType, "Content-Length": String(bytes.byteLength), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
