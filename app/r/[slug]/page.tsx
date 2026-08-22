import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../lib/event";
import { prisma } from "../../lib/prisma";
import { parseQrMode } from "../../lib/qr";
import { formatPhotoSource, normalizePhotoSource } from "../../lib/photo-source";
import { GuestPhotoUploader } from "./guest-photo-uploader";
import { GuestbookSection } from "./guestbook-section";
import { EVENT_UPLOAD_STATUS_DETAILS, getEventUploadStatus } from "../../lib/event-upload";
import { getGuestThemeStyle } from "../../lib/event-appearance";
import { hasPlanFeature } from "../../lib/plan-limits";
import { PLAN_FEATURES } from "../../lib/plans";

export const metadata: Metadata = { title: "Ruang Acara — Ruang Momen" };

export default async function GuestRoomPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ mode?: string | string[]; source?: string | string[] }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const mode = parseQrMode(query.mode);
  const source = normalizePhotoSource(query.source);
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { ownerId: true, name: true, slug: true, type: true, eventDate: true, coverStorageKey: true, themeKey: true, guestUploadEnabled: true, guestGalleryEnabled: true, uploadStartsAt: true, uploadEndsAt: true, _count: { select: { photos: true } }, guestbookEntries: { orderBy: { createdAt: "desc" }, take: 50, select: { id: true, guestName: true, message: true, createdAt: true } } },
  });

  if (!event) notFound();
  const uploadStatus = getEventUploadStatus(event);
  const [galleryAllowed, guestbookAllowed, appearanceAllowed] = await Promise.all([hasPlanFeature(event.ownerId, PLAN_FEATURES.GALLERY), hasPlanFeature(event.ownerId, PLAN_FEATURES.GUESTBOOK), hasPlanFeature(event.ownerId, PLAN_FEATURES.CUSTOM_BRANDING)]);
  const guestbookEntries = event.guestbookEntries.map((entry) => ({ ...entry, createdAt: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(entry.createdAt) }));

  return (
    <main style={getGuestThemeStyle(appearanceAllowed ? event.themeKey : "MIDNIGHT")} className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--guest-bg)] px-5 py-10 text-[var(--guest-text)] sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--guest-accent)] opacity-[.06] blur-[110px]" />
      <section className="relative w-full max-w-2xl rounded-[2rem] border border-[var(--guest-border)] bg-[var(--guest-surface)] p-7 text-center shadow-[inset_0_1px_0_rgba(245,240,231,.03),0_28px_80px_rgba(0,0,0,.24)] sm:p-12">
        <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="mx-auto h-14 w-auto object-contain sm:h-16" priority />
        {event.coverStorageKey && <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-2xl border border-[#D6B56F]/20"><Image src={`/api/ruang/${encodeURIComponent(event.slug)}/cover`} alt={`Sampul ${event.name}`} fill sizes="(min-width:640px) 576px, 90vw" unoptimized className="object-cover" /></div>}
        <p className="mt-9 text-xs font-bold uppercase tracking-[.22em] text-[var(--guest-accent)]">Ruang Acara</p>
        <h1 className="mx-auto mt-4 max-w-xl text-3xl leading-tight font-extrabold tracking-[-.045em] sm:text-5xl">{event.name}</h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[var(--guest-muted)]"><span>{EVENT_TYPE_LABELS[event.type]}</span><span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--guest-accent)]" /><span>{formatEventDate(event.eventDate)}</span></div>
        {source && <p className="mx-auto mt-4 w-fit rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] px-3 py-1.5 text-xs font-semibold text-[#F1DDA7]">Sudut: {formatPhotoSource(source)}</p>}
        <div className="mx-auto mt-9 max-w-lg border-t border-[var(--guest-border)] pt-8"><h2 className="font-serif text-2xl italic text-[var(--guest-accent-soft)] sm:text-3xl">{mode === "camera" ? "Jepret momennya dari sudutmu." : mode === "gallery" ? "Pilih momen dari galerimu." : "Setiap sudut punya cerita."}</h2><p className="mt-4 text-sm leading-7 text-[var(--guest-muted)] sm:text-base">{mode === "camera" ? "Foto akan langsung dikirim ke ruang setelah kamu memilih hasil jepretan." : mode === "gallery" ? "Pilih foto yang ingin kamu bagikan ke ruang ini." : "Bagikan momen yang kamu lihat dan bantu isi ruang ini bersama."}</p></div>
        {uploadStatus === "OPEN" ? <GuestPhotoUploader slug={event.slug} mode={mode} source={source} /> : <div className="mt-8 rounded-2xl border border-[#D6B56F]/15 bg-[#071727]/45 px-5 py-6"><h3 className="text-lg font-bold text-[#F1DDA7]">{uploadStatus === "DISABLED" ? "Pengiriman momen sedang ditutup." : EVENT_UPLOAD_STATUS_DETAILS[uploadStatus].message}</h3><p className="mt-2 text-sm leading-6 text-[#AEB8BE]">{uploadStatus === "DISABLED" ? "Kamu masih bisa membuka ruang ini, tetapi pemilik ruang sedang tidak menerima foto baru." : "Kamu masih bisa membuka ruang ini dan kembali lagi saat pengiriman momen tersedia."}</p></div>}
        {guestbookAllowed && <GuestbookSection slug={event.slug} entries={guestbookEntries} />}
        {galleryAllowed && event.guestGalleryEnabled && <section className="mt-8 border-t border-[var(--guest-border)] pt-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--guest-accent)]">Galeri Tamu</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.03em]">Momen dari semua sudut</h2><p className="mt-3 text-sm leading-6 text-[var(--guest-muted)]">{event._count.photos > 0 ? `${event._count.photos} momen sudah terkumpul di galeri bersama.` : "Belum ada momen di galeri."}</p><Link href={`/r/${encodeURIComponent(event.slug)}/album`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--guest-border)] px-5 text-sm font-bold text-[var(--guest-accent-soft)] transition hover:bg-[var(--guest-accent-wash)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--guest-accent)]">Lihat Galeri</Link></section>}
        <p className="mt-5 text-xs font-semibold text-[#D6B56F]">Tanpa install aplikasi</p>
      </section>
    </main>
  );
}
