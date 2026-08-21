import { prisma } from "../../../lib/prisma";
import { storage } from "../../../lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({ where: { id: photoId }, select: { storageKey: true, mimeType: true, sizeBytes: true } });
  if (!photo) return new Response("Not found", { status: 404 });
  try {
    const bytes = await storage.read(photo.storageKey);
    return new Response(Uint8Array.from(bytes).buffer, { headers: { "Content-Type": photo.mimeType, "Content-Length": String(photo.sizeBytes), "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
