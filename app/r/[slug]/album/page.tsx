import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../../lib/event";
import { getGuestThemeStyle, resolveFrameKey } from "../../../lib/event-appearance";
import { GUEST_REACTION_COOKIE, parseGuestReactionIdentifier } from "../../../lib/guest-reaction";
import { formatPhotoSource } from "../../../lib/photo-source";
import { prisma } from "../../../lib/prisma";
import { hasPlanFeature } from "../../../lib/plan-limits";
import { PLAN_FEATURES } from "../../../lib/plans";
import { GuestGalleryViewer } from "./guest-gallery-viewer";

export const metadata: Metadata = { title: "Momen Bersama — Ruang Momen", robots: { index: false, follow: false } };

export default async function GuestAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, ownerId: true, slug: true, name: true, type: true, eventDate: true, coverStorageKey: true, themeKey: true, frameKey: true, guestGalleryEnabled: true, guestDownloadEnabled: true },
  });
  if (!event) notFound();

  const [galleryAllowed, downloadAllowed, reactionAllowed, appearanceAllowed] = await Promise.all([hasPlanFeature(event.ownerId, PLAN_FEATURES.GALLERY), hasPlanFeature(event.ownerId, PLAN_FEATURES.DOWNLOAD_ORIGINAL), hasPlanFeature(event.ownerId, PLAN_FEATURES.REACTION), hasPlanFeature(event.ownerId, PLAN_FEATURES.CUSTOM_BRANDING)]);
  if (!event.guestGalleryEnabled || !galleryAllowed) notFound();

  const guestIdentifier = parseGuestReactionIdentifier((await cookies()).get(GUEST_REACTION_COOKIE)?.value);
  // TODO: Add pagination or infinite loading when albums need more than the latest 100 photos.
  const records = await prisma.photo.findMany({ where: { eventId: event.id }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, guestName: true, source: true, createdAt: true, _count: { select: { reactions: true } }, reactions: { where: { guestIdentifier: guestIdentifier ?? "" }, take: 1, select: { id: true } } } });
  const photos = records.map((photo) => ({ id: photo.id, guestName: photo.guestName, sourceLabel: photo.source ? formatPhotoSource(photo.source) : null, uploadedAt: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(photo.createdAt), reactionCount: photo._count.reactions, reacted: photo.reactions.length > 0 }));

  return <main style={getGuestThemeStyle(appearanceAllowed ? event.themeKey : "MIDNIGHT")} className="min-h-screen overflow-hidden bg-[var(--guest-bg)] px-4 py-7 text-[var(--guest-text)] sm:px-7 sm:py-10"><div className="mx-auto w-full max-w-7xl">
    <header className="overflow-hidden rounded-[2rem] border border-[var(--guest-border)] bg-[var(--guest-surface)] shadow-[0_24px_70px_rgba(0,0,0,.2)]"><div className="grid md:grid-cols-[.9fr_1.1fr]">{event.coverStorageKey && <div className="relative min-h-56 md:min-h-80"><Image src={`/api/ruang/${encodeURIComponent(event.slug)}/cover`} alt={`Sampul ${event.name}`} fill sizes="(min-width:768px) 45vw, 100vw" unoptimized priority className="object-cover" /></div>}<div className={`p-7 sm:p-10 ${event.coverStorageKey ? "" : "md:col-span-2 md:text-center"}`}><Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className={`h-12 w-auto object-contain ${event.coverStorageKey ? "" : "mx-auto"}`} priority /><p className="mt-8 text-xs font-bold uppercase tracking-[.22em] text-[var(--guest-accent)]">Momen Bersama</p><h1 className="mt-3 text-3xl font-extrabold tracking-[-.04em] sm:text-5xl">{event.name}</h1><p className="mt-5 font-serif text-2xl italic text-[var(--guest-accent-soft)]">Setiap sudut punya cerita.</p><p className="mt-3 text-sm leading-6 text-[var(--guest-muted)]">Momen yang dibagikan dari berbagai sudut acara ini.</p><div className={`mt-5 flex flex-wrap gap-2 text-xs text-[var(--guest-muted)] ${event.coverStorageKey ? "" : "justify-center"}`}><span>{EVENT_TYPE_LABELS[event.type]}</span><span aria-hidden="true">·</span><span>{formatEventDate(event.eventDate)}</span></div><Link href={`/r/${encodeURIComponent(event.slug)}`} className="mt-7 inline-flex min-h-11 items-center rounded-xl border border-[var(--guest-border)] px-5 text-sm font-bold text-[var(--guest-accent-soft)]">Kembali ke Ruang</Link></div></div></header>
    {photos.length ? <section className="mt-7" aria-label="Momen bersama"><GuestGalleryViewer slug={event.slug} eventName={event.name} photos={photos} downloadEnabled={event.guestDownloadEnabled && downloadAllowed} reactionEnabled={reactionAllowed} frameKey={resolveFrameKey(appearanceAllowed ? event.frameKey : "NONE")} /></section> : <section className="mt-7 rounded-2xl border border-[var(--guest-border)] bg-[var(--guest-surface)] p-8 text-center"><h2 className="text-xl font-bold">Belum ada momen di ruang ini.</h2><p className="mt-2 text-sm text-[var(--guest-muted)]">Jadilah salah satu yang pertama membagikan momen.</p><Link href={`/r/${encodeURIComponent(event.slug)}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--guest-accent)] px-5 text-sm font-bold text-[var(--guest-bg)]">Kirim Momen</Link></section>}
  </div></main>;
}
