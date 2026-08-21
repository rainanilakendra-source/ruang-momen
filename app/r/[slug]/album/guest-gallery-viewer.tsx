"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type GuestGalleryPhoto = {
  id: string;
  uploadedAt: string;
  guestName: string | null;
  sourceLabel: string | null;
};

export function GuestGalleryViewer({ slug, eventName, photos, downloadEnabled }: { slug: string; eventName: string; photos: GuestGalleryPhoto[]; downloadEnabled: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const current = selectedIndex === null ? null : photos[selectedIndex];
  const activeIndex = selectedIndex ?? 0;
  const mediaUrl = (photoId: string) => `/api/public/ruang/${encodeURIComponent(slug)}/media/${encodeURIComponent(photoId)}`;

  const closeViewer = () => {
    setSelectedIndex(null);
    previousFocus.current?.focus();
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
      if (event.key === "ArrowLeft") setSelectedIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") setSelectedIndex((index) => index === null ? null : (index + 1) % photos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const openViewer = (index: number) => {
    previousFocus.current = document.activeElement as HTMLElement;
    setSelectedIndex(index);
  };

  return <>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => openViewer(index)} aria-label={`Buka momen ${index + 1} dari ${eventName}`} className="group overflow-hidden rounded-xl border border-[#F5F0E7]/[.08] bg-[#0A1D30] text-left transition hover:-translate-y-0.5 hover:border-[#D6B56F]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">
        <span className="relative block aspect-square overflow-hidden"><Image src={mediaUrl(photo.id)} alt={`Momen ${eventName}`} fill sizes="(min-width:1280px) 19vw, (min-width:1024px) 24vw, (min-width:640px) 32vw, 49vw" unoptimized className="object-cover transition duration-300 group-hover:scale-[1.02]" /></span>
        {(photo.guestName || photo.sourceLabel) && <span className="flex flex-col gap-1 px-3 py-2.5 text-[11px]">{photo.guestName && <span className="font-semibold text-[#F1DDA7]">Dikirim oleh {photo.guestName}</span>}{photo.sourceLabel && <span className="text-[#D6B56F]">Sudut: {photo.sourceLabel}</span>}</span>}
      </button>)}
    </div>

    {current && <div role="dialog" aria-modal="true" aria-label="Momen bersama" className="fixed inset-0 z-[90] flex flex-col bg-[#03101C]/97 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] text-[#F5F0E7] sm:p-6">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm text-[#AEB8BE]">{current.uploadedAt}</p>{current.guestName && <p className="mt-1 text-xs font-semibold text-[#F1DDA7]">Dikirim oleh {current.guestName}</p>}{current.sourceLabel && <p className="mt-1 text-xs font-semibold text-[#D6B56F]">Sudut: {current.sourceLabel}</p>}</div><button ref={closeRef} type="button" onClick={closeViewer} aria-label="Tutup viewer" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#F5F0E7]/15 text-2xl focus-visible:outline-2 focus-visible:outline-[#D6B56F]">×</button></div>
      <div className="relative my-3 min-h-0 flex-1"><Image src={mediaUrl(current.id)} alt={`Momen ${eventName}`} fill sizes="100vw" unoptimized priority className="object-contain" /></div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {photos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex - 1 + photos.length) % photos.length)} className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 text-sm font-semibold">← Sebelumnya</button>}
        {photos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex + 1) % photos.length)} className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 text-sm font-semibold">Berikutnya →</button>}
        {downloadEnabled && <a href={`${mediaUrl(current.id)}?download=1`} download className="inline-flex min-h-11 items-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727]">Unduh Foto</a>}
      </div>
    </div>}
  </>;
}
