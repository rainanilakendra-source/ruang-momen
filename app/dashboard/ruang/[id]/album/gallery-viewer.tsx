"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deletePhoto } from "./actions";

export type GalleryPhoto = { id: string; originalName: string; sizeLabel: string; uploadedAt: string; sourceLabel: string | null };

export function GalleryViewer({ eventName, photos }: { eventName: string; photos: GalleryPhoto[] }) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeViewer = () => {
    setSelectedIndex(null);
    setConfirmDelete(false);
    setError(null);
    previousFocus.current?.focus();
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [selectedIndex]);

  useEffect(() => {
    if (confirmDelete) cancelRef.current?.focus();
  }, [confirmDelete]);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (event.key === "Escape") {
        if (confirmDelete) setConfirmDelete(false);
        else closeViewer();
      }
      if (!confirmDelete && event.key === "ArrowLeft") setSelectedIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
      if (!confirmDelete && event.key === "ArrowRight") setSelectedIndex((index) => index === null ? null : (index + 1) % photos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const openViewer = (index: number) => {
    previousFocus.current = document.activeElement as HTMLElement;
    setSelectedIndex(index);
  };

  const current = selectedIndex === null ? null : photos[selectedIndex];
  const activeIndex = selectedIndex ?? 0;
  const removeCurrent = () => {
    if (!current) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePhoto(current.id);
      if (!result.ok) { setError(result.message); return; }
      setFeedback("Momen berhasil dihapus.");
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
      closeViewer();
      router.refresh();
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => openViewer(index)} aria-label={`Buka momen ${index + 1} dari ${eventName}`} className="group overflow-hidden rounded-xl border border-[#F5F0E7]/[.08] bg-[#0A1D30] text-left transition hover:-translate-y-0.5 hover:border-[#D6B56F]/25 hover:shadow-[0_14px_30px_rgba(0,0,0,.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">
          <span className="relative block aspect-square overflow-hidden"><Image src={`/api/media/${photo.id}`} alt={`Momen ${eventName}`} fill sizes="(min-width:1536px) 18vw, (min-width:1024px) 23vw, (min-width:640px) 31vw, 48vw" unoptimized className="object-cover transition duration-300 group-hover:scale-[1.02]" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071727]/90 to-transparent px-3 pt-8 pb-3 text-[11px] text-[#F5F0E7] opacity-90 sm:opacity-0 sm:transition sm:group-hover:opacity-100">Lihat momen</span></span>
          <span className="flex flex-col gap-1 px-3 py-3 text-xs"><span className="font-semibold text-[#F5F0E7]">{photo.uploadedAt}</span><span className="text-[#AEB8BE]">{photo.sizeLabel}</span>{photo.sourceLabel && <span className="font-semibold text-[#D6B56F]">Dari {photo.sourceLabel}</span>}</span>
        </button>)}
      </div>

      {feedback && <p role="status" className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[80] rounded-xl border border-[#D6B56F]/25 bg-[#0A1D30] px-4 py-3 text-sm font-semibold text-[#F1DDA7] shadow-xl lg:bottom-5">{feedback}</p>}

      {current && <div role="dialog" aria-modal="true" aria-label="Viewer momen" className="fixed inset-0 z-[70] flex flex-col bg-[#03101C]/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] sm:p-6">
        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm text-[#AEB8BE]">{current.uploadedAt} · {current.sizeLabel}</p>{current.sourceLabel && <p className="mt-1 text-xs font-semibold text-[#D6B56F]">Sudut: {current.sourceLabel}</p>}</div><button ref={closeRef} type="button" onClick={closeViewer} aria-label="Tutup viewer" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#F5F0E7]/15 text-xl text-[#F5F0E7] focus-visible:outline-2 focus-visible:outline-[#D6B56F]">×</button></div>
        <div className="relative my-3 min-h-0 flex-1"><Image src={`/api/media/${current.id}`} alt={`Momen ${eventName}`} fill sizes="100vw" unoptimized priority className="object-contain" /></div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {photos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex - 1 + photos.length) % photos.length)} aria-label="Momen sebelumnya" className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 font-semibold">← Sebelumnya</button>}
          {photos.length > 1 && <button type="button" onClick={() => setSelectedIndex((activeIndex + 1) % photos.length)} aria-label="Momen berikutnya" className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-4 font-semibold">Berikutnya →</button>}
          <a href={`/api/media/${current.id}?download=1`} download className="inline-flex min-h-11 items-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727]">Unduh</a>
          <button type="button" onClick={() => setConfirmDelete(true)} className="min-h-11 rounded-xl border border-red-300/30 px-5 text-sm font-bold text-red-200">Hapus Momen</button>
        </div>

        {confirmDelete && <div className="absolute inset-0 grid place-items-center bg-[#03101C]/75 p-5"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" className="w-full max-w-md rounded-2xl border border-[#D6B56F]/20 bg-[#0A1D30] p-6 shadow-2xl"><h2 id="delete-title" className="text-xl font-bold">Hapus momen ini?</h2><p id="delete-description" className="mt-3 text-sm leading-6 text-[#AEB8BE]">Foto yang dihapus tidak dapat dipulihkan.</p>{error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button ref={cancelRef} type="button" disabled={pending} onClick={() => setConfirmDelete(false)} className="min-h-11 rounded-xl border border-[#F5F0E7]/15 px-5 text-sm font-semibold">Batal</button><button type="button" disabled={pending} onClick={removeCurrent} className="min-h-11 rounded-xl bg-red-200 px-5 text-sm font-bold text-[#071727] disabled:opacity-60">{pending ? "Menghapus..." : "Hapus"}</button></div></div></div>}
      </div>}
    </>
  );
}
