"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getGuestFrameClass, type FrameKey } from "../../../lib/event-appearance";

export type GuestGalleryPhoto = {
  id: string;
  uploadedAt: string;
  guestName: string | null;
  sourceLabel: string | null;
  reactionCount: number;
  reacted: boolean;
};

type ReactionButtonProps = {
  photo: GuestGalleryPhoto;
  pending: boolean;
  onToggle: (photoId: string) => void;
  compact?: boolean;
};

function ReactionButton({ photo, pending, onToggle, compact = false }: ReactionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(photo.id)}
      disabled={pending}
      aria-pressed={photo.reacted}
      aria-label={`${photo.reacted ? "Batalkan suka" : "Suka"}. ${photo.reactionCount} suka`}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--guest-accent)] disabled:cursor-wait disabled:opacity-60 ${compact ? "px-3 text-xs" : "px-5 text-sm"} ${photo.reacted ? "border-rose-300/30 bg-rose-400/10 text-rose-500" : "border-[var(--guest-border)] text-[var(--guest-text)]"}`}
    >
      <span aria-hidden="true" className="text-lg leading-none">{photo.reacted ? "♥" : "♡"}</span>
      <span>{photo.reactionCount}</span>
    </button>
  );
}

export function GuestGalleryViewer({ slug, eventName, photos, downloadEnabled, reactionEnabled, frameKey }: { slug: string; eventName: string; photos: GuestGalleryPhoto[]; downloadEnabled: boolean; reactionEnabled: boolean; frameKey: FrameKey }) {
  const [galleryPhotos, setGalleryPhotos] = useState(photos);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pendingPhotoIds, setPendingPhotoIds] = useState<Set<string>>(() => new Set());
  const [reactionError, setReactionError] = useState<string | null>(null);
  const pendingRef = useRef(new Set<string>());
  const reactionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const current = selectedIndex === null ? null : galleryPhotos[selectedIndex];
  const activeIndex = selectedIndex ?? 0;
  const mediaUrl = (photoId: string) => `/api/public/ruang/${encodeURIComponent(slug)}/media/${encodeURIComponent(photoId)}`;

  const closeViewer = () => {
    setSelectedIndex(null);
    previousFocus.current?.focus();
  };

  const toggleReaction = async (photoId: string) => {
    if (pendingRef.current.has(photoId)) return;
    const previous = galleryPhotos.find((photo) => photo.id === photoId);
    if (!previous) return;

    pendingRef.current.add(photoId);
    setPendingPhotoIds(new Set(pendingRef.current));
    setReactionError(null);
    setGalleryPhotos((currentPhotos) => currentPhotos.map((photo) => photo.id === photoId ? { ...photo, reacted: !photo.reacted, reactionCount: Math.max(0, photo.reactionCount + (photo.reacted ? -1 : 1)) } : photo));

    try {
      const request = reactionQueueRef.current.then(() => fetch(`/api/public/ruang/${encodeURIComponent(slug)}/reactions/${encodeURIComponent(photoId)}`, { method: "POST" }));
      reactionQueueRef.current = request.then(() => undefined, () => undefined);
      const response = await request;
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("liked" in result) || typeof result.liked !== "boolean" || !("count" in result) || typeof result.count !== "number" || !Number.isInteger(result.count) || result.count < 0) throw new Error("Invalid reaction response");
      const reaction = result as { liked: boolean; count: number };
      setGalleryPhotos((currentPhotos) => currentPhotos.map((photo) => photo.id === photoId ? { ...photo, reacted: reaction.liked, reactionCount: reaction.count } : photo));
    } catch {
      setGalleryPhotos((currentPhotos) => currentPhotos.map((photo) => photo.id === photoId ? previous : photo));
      setReactionError("Reaction belum berhasil disimpan. Silakan coba lagi.");
    } finally {
      pendingRef.current.delete(photoId);
      setPendingPhotoIds(new Set(pendingRef.current));
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [selectedIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") setSelectedIndex((index) => index === null ? null : (index - 1 + galleryPhotos.length) % galleryPhotos.length);
      if (event.key === "ArrowRight") setSelectedIndex((index) => index === null ? null : (index + 1) % galleryPhotos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const openViewer = (index: number) => {
    previousFocus.current = document.activeElement as HTMLElement;
    setSelectedIndex(index);
  };

  return <>
    {reactionError && <p role="status" className="mb-3 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{reactionError}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {galleryPhotos.map((photo, index) => <article key={photo.id} className={`group overflow-hidden transition hover:-translate-y-0.5 ${getGuestFrameClass(frameKey)}`}>
        <button type="button" onClick={() => openViewer(index)} aria-label={`Buka momen ${index + 1} dari ${eventName}`} className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D6B56F]">
          <span className="relative block aspect-square overflow-hidden"><Image src={mediaUrl(photo.id)} alt={`Momen ${eventName}`} fill sizes="(min-width:1280px) 19vw, (min-width:1024px) 24vw, (min-width:640px) 32vw, 49vw" unoptimized className="object-cover transition duration-300 group-hover:scale-[1.02]" /></span>
          {(photo.guestName || photo.sourceLabel) && <span className="flex flex-col gap-1 px-3 pt-2.5 text-[11px]">{photo.guestName && <span className="font-semibold text-[var(--guest-accent-soft)]">Dikirim oleh {photo.guestName}</span>}{photo.sourceLabel && <span className="text-[var(--guest-accent)]">Sudut: {photo.sourceLabel}</span>}</span>}
        </button>
        {reactionEnabled && <div className="px-3 py-2.5"><ReactionButton photo={photo} pending={pendingPhotoIds.has(photo.id)} onToggle={(id) => { void toggleReaction(id); }} compact /></div>}
      </article>)}
    </div>

    {current && <div role="dialog" aria-modal="true" aria-label="Momen bersama" className="fixed inset-0 z-[90] flex flex-col bg-[#03101C]/97 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] text-[#F5F0E7] sm:p-6">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm text-[#AEB8BE]">{current.uploadedAt}</p>{current.guestName && <p className="mt-1 text-xs font-semibold text-[#F1DDA7]">Dikirim oleh {current.guestName}</p>}{current.sourceLabel && <p className="mt-1 text-xs font-semibold text-[#D6B56F]">Sudut: {current.sourceLabel}</p>}</div><button ref={closeRef} type="button" onClick={closeViewer} aria-label="Tutup viewer" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#F5F0E7]/15 text-2xl focus-visible:outline-2 focus-visible:outline-[#D6B56F]">×</button></div>
      <div className="relative my-3 min-h-0 flex-1"><Image src={mediaUrl(current.id)} alt={`Momen ${eventName}`} fill sizes="100vw" unoptimized priority className="object-contain" /></div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {galleryPhotos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex - 1 + galleryPhotos.length) % galleryPhotos.length)} className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 text-sm font-semibold">← Sebelumnya</button>}
        {reactionEnabled && <ReactionButton photo={current} pending={pendingPhotoIds.has(current.id)} onToggle={(id) => { void toggleReaction(id); }} />}
        {galleryPhotos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex + 1) % galleryPhotos.length)} className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 text-sm font-semibold">Berikutnya →</button>}
        {downloadEnabled && <a href={`${mediaUrl(current.id)}?download=1`} download className="inline-flex min-h-11 items-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727]">Unduh Foto</a>}
      </div>
    </div>}
  </>;
}
