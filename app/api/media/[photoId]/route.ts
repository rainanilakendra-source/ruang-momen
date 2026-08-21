import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { storage } from "../../../lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });

  const { photoId } = await params;
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, event: { ownerId: user.id } },
    select: { storageKey: true, originalName: true, mimeType: true, sizeBytes: true },
  });
  if (!photo) return new Response("Not found", { status: 404 });
  try {
    const bytes = await storage.read(photo.storageKey);
    const headers: Record<string, string> = { "Content-Type": photo.mimeType, "Content-Length": String(photo.sizeBytes), "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" };
    if (new URL(request.url).searchParams.get("download") === "1") {
      const fallback = `ruang-momen-${photoId}.${photo.mimeType.split("/")[1] === "jpeg" ? "jpg" : photo.mimeType.split("/")[1]}`;
      const safeName = photo.originalName.replace(/["\\]/g, "_");
      headers["Content-Disposition"] = `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(safeName)}`;
    }
    return new Response(Uint8Array.from(bytes).buffer, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
