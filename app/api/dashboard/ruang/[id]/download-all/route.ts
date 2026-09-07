import path from "node:path";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { storage } from "../../../../../lib/storage";
import { createZipStream, type ZipEntry } from "../../../../../lib/zip";
import { hasPlanFeature } from "../../../../../lib/plan-limits";
import { PLAN_FEATURES } from "../../../../../lib/plans";

export const runtime = "nodejs";

const MAX_ZIP32_SIZE = 0xffffffff;

function safePart(value: string, fallback: string): string {
  const base = path.basename(value.replaceAll("\\", "/"));
  const safe = base.replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "_").replace(/[. ]+$/g, "").trim();
  return (safe || fallback).slice(0, 180);
}

function uniquePhotoNames(photos: Array<{ id: string; originalName: string }>): Map<string, string> {
  const used = new Set<string>();
  const names = new Map<string, string>();

  for (const photo of photos) {
    const safe = safePart(photo.originalName, `momen-${photo.id}.jpg`);
    const extension = path.extname(safe);
    const stem = safe.slice(0, safe.length - extension.length) || `momen-${photo.id}`;
    let candidate = safe;
    let suffix = 2;
    while (used.has(candidate.toLocaleLowerCase("en-US"))) {
      candidate = `${stem}-${suffix}${extension}`;
      suffix += 1;
    }
    used.add(candidate.toLocaleLowerCase("en-US"));
    names.set(photo.id, candidate);
  }

  return names;
}

function archiveName(eventName: string, eventId: string): string {
  const slug = eventName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return `ruang-momen-${slug || eventId}.zip`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });

  const { id } = await params;
  const [event, zipAllowed] = await Promise.all([
    prisma.event.findFirst({
      where: { id, ownerId: user.id },
      select: {
        name: true,
        photos: {
          orderBy: { createdAt: "asc" },
          select: { id: true, originalName: true, storageKey: true, sizeBytes: true, createdAt: true },
        },
      },
    }),
    hasPlanFeature(user.id, PLAN_FEATURES.ZIP_EXPORT),
  ]);
  if (!event) return new Response("Not found", { status: 404 });
  if (!zipAllowed) return new Response("Fitur ZIP tidak tersedia pada paket aktif.", { status: 403 });
  if (event.photos.length === 0) return new Response("Belum ada foto untuk diunduh.", { status: 409 });

  const estimatedSize = event.photos.reduce((total, photo) => total + photo.sizeBytes + 256, 22);
  if (event.photos.length > 65535 || estimatedSize > MAX_ZIP32_SIZE) {
    return new Response("Album terlalu besar untuk diunduh sebagai satu ZIP.", { status: 413 });
  }

  const names = uniquePhotoNames(event.photos);
  let firstAvailable: { id: string; bytes: Uint8Array } | null = null;
  for (const photo of event.photos) {
    try {
      firstAvailable = { id: photo.id, bytes: await storage.read(photo.storageKey) };
      break;
    } catch {
      console.warn(`[download-all] Skipping unavailable photo ${photo.id}`);
    }
  }
  if (!firstAvailable) return new Response("File foto tidak tersedia untuk diunduh.", { status: 404 });
  const cachedPhoto = firstAvailable;

  const entries: ZipEntry[] = event.photos.map((photo) => ({
    name: names.get(photo.id) ?? `momen-${photo.id}.jpg`,
    modifiedAt: photo.createdAt,
    load: async () => {
      if (photo.id === cachedPhoto.id) return cachedPhoto.bytes;
      try {
        return await storage.read(photo.storageKey);
      } catch {
        console.warn(`[download-all] Skipping unavailable photo ${photo.id}`);
        return null;
      }
    },
  }));
  const filename = archiveName(event.name, id);

  return new Response(createZipStream(entries), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
