import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppIcon } from "../../../_components/app-icons";
import { DashboardHeader } from "../../../_components/dashboard-shell";
import { ShareRoomActions } from "../../../_components/share-room-actions";
import { requireUser } from "../../../lib/auth";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../../lib/event";
import { prisma } from "../../../lib/prisma";
import { formatBytes } from "../../../lib/format";
import { buildGuestUrl, generateQrDataUrl, getAppBaseUrl, QR_MODE_DETAILS, QR_MODES, type QrMode } from "../../../lib/qr";
import { EVENT_UPLOAD_STATUS_DETAILS, getEventUploadStatus } from "../../../lib/event-upload";

export const metadata: Metadata = { title: "Detail Ruang — Ruang Momen" };

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: { name: true, slug: true, type: true, eventDate: true, coverStorageKey: true, guestUploadEnabled: true, uploadStartsAt: true, uploadEndsAt: true, photos: { orderBy: { createdAt: "desc" }, take: 6, select: { id: true } } },
  });

  if (!event) notFound();
  const uploadStatus = getEventUploadStatus(event);

  const baseUrl = getAppBaseUrl();
  const [qrVariants, photoStats] = await Promise.all([
    Promise.all(QR_MODES.map(async (mode) => {
      const guestUrl = buildGuestUrl({ baseUrl, slug: event.slug, mode });
      return [mode, { guestUrl, qrDataUrl: await generateQrDataUrl(guestUrl), printHref: `/dashboard/ruang/${id}/qr${mode === "general" ? "" : `?mode=${mode}`}`, downloadName: `ruang-momen-${event.slug}-${QR_MODE_DETAILS[mode].filename}.png` }] as const;
    })).then((entries) => Object.fromEntries(entries) as Record<QrMode, { guestUrl: string; qrDataUrl: string; printHref: string; downloadName: string }>),
    prisma.photo.aggregate({ where: { eventId: id }, _count: { _all: true }, _sum: { sizeBytes: true } }),
  ]);

  return (
    <>
      <DashboardHeader title={event.name} description="Detail dasar ruang acaramu." />
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[1.75rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-9">
          <div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F]"><AppIcon name="spaces" className="h-6 w-6" /></span><Link href={`/dashboard/ruang/${id}/atur`} className="inline-flex min-h-10 items-center rounded-xl border border-[#D6B56F]/25 px-4 text-xs font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">Atur Ruang</Link></div>
          <dl className="mt-8 space-y-5"><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Nama acara</dt><dd className="mt-2 text-xl font-bold">{event.name}</dd></div><div className="grid gap-5 border-t border-[#F5F0E7]/[.08] pt-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Jenis acara</dt><dd className="mt-2 text-sm font-semibold">{EVENT_TYPE_LABELS[event.type]}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Tanggal acara</dt><dd className="mt-2 text-sm font-semibold">{formatEventDate(event.eventDate)}</dd></div></div></dl>
          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-[#F5F0E7]/[.08] pt-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Total momen</p><p className="mt-2 text-lg font-bold">{photoStats._count._all}</p></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Penyimpanan</p><p className="mt-2 text-lg font-bold">{formatBytes(photoStats._sum.sizeBytes ?? 0)}</p></div></div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F5F0E7]/[.08] pt-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Status Pengiriman</p><p className="mt-2 text-sm font-semibold text-[#F1DDA7]">{EVENT_UPLOAD_STATUS_DETAILS[uploadStatus].label}</p></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Sampul</p><p className="mt-2 text-sm font-semibold">{event.coverStorageKey ? "Ada" : "Belum"}</p></div></div>
          <p className="mt-5 text-xs text-[#AEB8BE]/70">Slug: {event.slug}</p>
        </article>
        <aside className="rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Bagikan Ruang</p>
          <h2 className="mt-3 text-xl font-bold">Bagikan Ruang</h2>
          <p className="mt-3 text-sm leading-6 text-[#AEB8BE]">Bagikan satu QR agar setiap tamu bisa masuk ke ruang ini dari browser mereka.</p>
          <ShareRoomActions eventName={event.name} eventId={id} eventSlug={event.slug} baseUrl={baseUrl} variants={qrVariants} />
          <p className="mt-4 text-center text-xs font-semibold text-[#D6B56F]">Tanpa install aplikasi.</p>
        </aside>
      </section>
      <section className="mt-6 rounded-[1.75rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8" aria-labelledby="recent-moments-title">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Album Ruang</p><h2 id="recent-moments-title" className="mt-2 text-xl font-bold">Momen Terbaru</h2></div><Link href={`/dashboard/ruang/${id}/album`} className="inline-flex min-h-11 items-center rounded-xl border border-[#D6B56F]/25 px-5 text-sm font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">Lihat Semua Momen</Link></div>
        {event.photos.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{event.photos.map((photo) => <Link key={photo.id} href={`/dashboard/ruang/${id}/album`} className="relative aspect-square overflow-hidden rounded-xl border border-[#F5F0E7]/[.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]"><Image src={`/api/media/${photo.id}`} alt={`Momen terbaru ${event.name}`} fill sizes="(min-width:1024px) 15vw, (min-width:640px) 30vw, 48vw" unoptimized className="object-cover transition hover:scale-[1.02]" /></Link>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-[#F5F0E7]/10 px-5 py-8 text-center text-sm text-[#AEB8BE]">Belum ada momen yang terkumpul.</p>}
      </section>
    </>
  );
}
