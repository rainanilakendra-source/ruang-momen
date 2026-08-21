import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../lib/event";
import { prisma } from "../../lib/prisma";
import { parseQrMode } from "../../lib/qr";
import { formatPhotoSource, normalizePhotoSource } from "../../lib/photo-source";
import { GuestPhotoUploader } from "./guest-photo-uploader";
import { EVENT_UPLOAD_STATUS_DETAILS, getEventUploadStatus } from "../../lib/event-upload";

export const metadata: Metadata = { title: "Ruang Acara — Ruang Momen" };

export default async function GuestRoomPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ mode?: string | string[]; source?: string | string[] }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const mode = parseQrMode(query.mode);
  const source = normalizePhotoSource(query.source);
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { name: true, slug: true, type: true, eventDate: true, coverStorageKey: true, guestUploadEnabled: true, guestGalleryEnabled: true, uploadStartsAt: true, uploadEndsAt: true },
  });

  if (!event) notFound();
  const uploadStatus = getEventUploadStatus(event);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071727] px-5 py-10 text-[#F5F0E7] sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#D6B56F]/[.06] blur-[110px]" />
      <section className="relative w-full max-w-2xl rounded-[2rem] border border-[#D6B56F]/20 bg-[#0A1D30]/95 p-7 text-center shadow-[inset_0_1px_0_rgba(245,240,231,.03),0_28px_80px_rgba(0,0,0,.24)] sm:p-12">
        <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="mx-auto h-14 w-auto object-contain sm:h-16" priority />
        {event.coverStorageKey && <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-2xl border border-[#D6B56F]/20"><Image src={`/api/ruang/${encodeURIComponent(event.slug)}/cover`} alt={`Sampul ${event.name}`} fill sizes="(min-width:640px) 576px, 90vw" unoptimized className="object-cover" /></div>}
        <p className="mt-9 text-xs font-bold uppercase tracking-[.22em] text-[#D6B56F]">Ruang Acara</p>
        <h1 className="mx-auto mt-4 max-w-xl text-3xl leading-tight font-extrabold tracking-[-.045em] sm:text-5xl">{event.name}</h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[#AEB8BE]"><span>{EVENT_TYPE_LABELS[event.type]}</span><span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D6B56F]" /><span>{formatEventDate(event.eventDate)}</span></div>
        {source && <p className="mx-auto mt-4 w-fit rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] px-3 py-1.5 text-xs font-semibold text-[#F1DDA7]">Sudut: {formatPhotoSource(source)}</p>}
        <div className="mx-auto mt-9 max-w-lg border-t border-[#F5F0E7]/[.08] pt-8"><h2 className="font-serif text-2xl italic text-[#F1DDA7] sm:text-3xl">{mode === "camera" ? "Jepret momennya dari sudutmu." : mode === "gallery" ? "Pilih momen dari galerimu." : "Setiap sudut punya cerita."}</h2><p className="mt-4 text-sm leading-7 text-[#AEB8BE] sm:text-base">{mode === "camera" ? "Foto akan langsung dikirim ke ruang setelah kamu memilih hasil jepretan." : mode === "gallery" ? "Pilih foto yang ingin kamu bagikan ke ruang ini." : "Bagikan momen yang kamu lihat dan bantu isi ruang ini bersama."}</p></div>
        {uploadStatus === "OPEN" ? <GuestPhotoUploader slug={event.slug} mode={mode} source={source} /> : <div className="mt-8 rounded-2xl border border-[#D6B56F]/15 bg-[#071727]/45 px-5 py-6"><h3 className="text-lg font-bold text-[#F1DDA7]">{uploadStatus === "DISABLED" ? "Pengiriman momen sedang ditutup." : EVENT_UPLOAD_STATUS_DETAILS[uploadStatus].message}</h3><p className="mt-2 text-sm leading-6 text-[#AEB8BE]">{uploadStatus === "DISABLED" ? "Kamu masih bisa membuka ruang ini, tetapi pemilik ruang sedang tidak menerima foto baru." : "Kamu masih bisa membuka ruang ini dan kembali lagi saat pengiriman momen tersedia."}</p></div>}
        {event.guestGalleryEnabled && <Link href={`/r/${encodeURIComponent(event.slug)}/album`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D6B56F]/30 px-5 text-sm font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">Lihat Momen Bersama</Link>}
        <p className="mt-5 text-xs font-semibold text-[#D6B56F]">Tanpa install aplikasi</p>
      </section>
    </main>
  );
}
