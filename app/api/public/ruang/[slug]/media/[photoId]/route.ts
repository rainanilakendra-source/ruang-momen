import { prisma } from "../../../../../../lib/prisma";
import { storage } from "../../../../../../lib/storage";

function encodeDispositionFilename(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; photoId: string }> }) {
  const { slug, photoId } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, guestGalleryEnabled: true, guestDownloadEnabled: true } });
  if (!event?.guestGalleryEnabled) return new Response("Not found", { status: 404 });

  const download = new URL(request.url).searchParams.get("download") === "1";
  if (download && !event.guestDownloadEnabled) return new Response("Not found", { status: 404 });

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, eventId: event.id },
    select: { storageKey: true, originalName: true, mimeType: true, sizeBytes: true },
  });
  if (!photo) return new Response("Not found", { status: 404 });

  try {
    const bytes = await storage.read(photo.storageKey);
    const extension = photo.mimeType === "image/jpeg" ? "jpg" : photo.mimeType.split("/")[1];
    const fallback = `ruang-momen-${photoId}.${extension}`;
    const safeName = photo.originalName.replace(/["\\\r\n]/g, "_").slice(0, 255) || fallback;
    const disposition = download
      ? `attachment; filename="${fallback}"; filename*=UTF-8''${encodeDispositionFilename(safeName)}`
      : `inline; filename="${fallback}"`;
    return new Response(Uint8Array.from(bytes).buffer, {
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Length": String(photo.sizeBytes),
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
