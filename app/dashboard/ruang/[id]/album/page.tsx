import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../../_components/dashboard-shell";
import { requireUser } from "../../../../lib/auth";
import { formatBytes } from "../../../../lib/format";
import { prisma } from "../../../../lib/prisma";
import { formatPhotoSource } from "../../../../lib/photo-source";
import { GalleryViewer } from "./gallery-viewer";

export const metadata: Metadata = { title: "Album Ruang — Ruang Momen" };

export default async function RoomAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: { name: true, photos: { orderBy: { createdAt: "desc" }, select: { id: true, originalName: true, sizeBytes: true, source: true, guestName: true, createdAt: true } } },
  });
  if (!event) notFound();

  const totalBytes = event.photos.reduce((total, photo) => total + photo.sizeBytes, 0);
  const photos = event.photos.map((photo) => ({ id: photo.id, originalName: photo.originalName, sizeLabel: formatBytes(photo.sizeBytes), guestName: photo.guestName, sourceLabel: photo.source ? formatPhotoSource(photo.source) : null, uploadedAt: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(photo.createdAt) }));

  return <>
    <DashboardHeader title={event.name} description="Semua momen yang terkumpul dari tamumu ada di sini." />
    <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">Album Ruang</p>
    <section className="mt-4 grid grid-cols-2 gap-3 sm:max-w-lg"><article className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-4"><p className="text-xs text-[#AEB8BE]">Total Momen</p><p className="mt-2 text-2xl font-bold">{photos.length}</p></article><article className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-4"><p className="text-xs text-[#AEB8BE]">Penyimpanan</p><p className="mt-2 text-2xl font-bold">{formatBytes(totalBytes)}</p></article></section>
    {photos.length ? <section className="mt-7" aria-label="Galeri momen"><GalleryViewer eventName={event.name} photos={photos} /></section> : <section className="mt-7 rounded-2xl border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-8 text-center"><h2 className="text-xl font-bold">Belum ada momen di ruang ini.</h2><p className="mt-2 text-sm text-[#AEB8BE]">Bagikan QR agar tamu dapat mengirim foto mereka.</p><Link href={`/dashboard/ruang/${id}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#D6B56F]/25 px-5 text-sm font-bold text-[#F1DDA7]">Kembali ke Ruang</Link></section>}
  </>;
}
