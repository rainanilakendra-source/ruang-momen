import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppIcon } from "../../../_components/app-icons";
import { DashboardHeader } from "../../../_components/dashboard-shell";
import { ShareRoomActions } from "../../../_components/share-room-actions";
import { requireUser } from "../../../lib/auth";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../../lib/event";
import { prisma } from "../../../lib/prisma";
import { buildGuestUrl, generateQrDataUrl } from "../../../lib/qr";

export const metadata: Metadata = { title: "Detail Ruang — Ruang Momen" };

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: { name: true, slug: true, type: true, eventDate: true },
  });

  if (!event) notFound();

  const guestUrl = buildGuestUrl(event.slug);
  const qrDataUrl = await generateQrDataUrl(guestUrl);

  return (
    <>
      <DashboardHeader title={event.name} description="Detail dasar ruang acaramu." />
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[1.75rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-9">
          <div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F]"><AppIcon name="spaces" className="h-6 w-6" /></span><span className="rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] px-3 py-1.5 text-xs font-bold text-[#F1DDA7]">Ruang siap</span></div>
          <dl className="mt-8 space-y-5"><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Nama acara</dt><dd className="mt-2 text-xl font-bold">{event.name}</dd></div><div className="grid gap-5 border-t border-[#F5F0E7]/[.08] pt-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Jenis acara</dt><dd className="mt-2 text-sm font-semibold">{EVENT_TYPE_LABELS[event.type]}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#AEB8BE]">Tanggal acara</dt><dd className="mt-2 text-sm font-semibold">{formatEventDate(event.eventDate)}</dd></div></div></dl>
          <p className="mt-7 border-t border-[#F5F0E7]/[.08] pt-5 text-xs text-[#AEB8BE]/70">Slug: {event.slug}</p>
        </article>
        <aside className="rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Bagikan Ruang</p>
          <h2 className="mt-3 text-xl font-bold">Bagikan Ruang</h2>
          <p className="mt-3 text-sm leading-6 text-[#AEB8BE]">Bagikan satu QR agar setiap tamu bisa masuk ke ruang ini dari browser mereka.</p>
          <div className="mx-auto mt-6 w-full max-w-64 rounded-[1.4rem] border border-[#D6B56F]/25 bg-[#FFFDF7] p-4 shadow-[0_16px_38px_rgba(0,0,0,.2)]"><Image src={qrDataUrl} alt={`QR untuk ruang ${event.name}`} width={1024} height={1024} unoptimized className="h-auto w-full" /></div>
          <p className="mt-4 break-all rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 px-3 py-2.5 text-xs leading-5 text-[#AEB8BE] select-all">{guestUrl}</p>
          <ShareRoomActions guestUrl={guestUrl} qrDataUrl={qrDataUrl} eventSlug={event.slug} printHref={`/dashboard/ruang/${id}/qr`} />
          <p className="mt-4 text-center text-xs font-semibold text-[#D6B56F]">Tanpa install aplikasi.</p>
        </aside>
      </section>
    </>
  );
}
