"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QR_MODE_DETAILS, QR_MODES, type QrMode } from "../lib/qr";

export type QrVariant = { guestUrl: string; qrDataUrl: string; printHref: string; downloadName: string };

export function ShareRoomActions({ eventName, variants }: { eventName: string; variants: Record<QrMode, QrVariant> }) {
  const [mode, setMode] = useState<QrMode>("general");
  const [copyFeedback, setCopyFeedback] = useState("Salin Tautan");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selected = variants[mode];

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  const selectMode = (nextMode: QrMode) => {
    setMode(nextMode);
    setCopyFeedback("Salin Tautan");
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  };

  const copyLink = async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(selected.guestUrl); copied = true; }
    } catch {}
    if (!copied) {
      const textarea = document.createElement("textarea");
      textarea.value = selected.guestUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      try { copied = document.execCommand("copy"); } catch { copied = false; } finally { textarea.remove(); }
    }
    setCopyFeedback(copied ? "Tautan tersalin" : "Tidak dapat menyalin otomatis. Salin tautan secara manual.");
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setCopyFeedback("Salin Tautan"), 1800);
  };

  return <>
    <fieldset className="mt-5"><legend className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Jenis QR</legend><div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 p-1">{QR_MODES.map((item) => <button key={item} type="button" onClick={() => selectMode(item)} aria-pressed={mode === item} className={`min-h-10 rounded-lg px-2 text-[11px] font-bold transition sm:text-xs ${mode === item ? "bg-[#D6B56F] text-[#071727]" : "text-[#AEB8BE] hover:text-[#F5F0E7]"}`}>{QR_MODE_DETAILS[item].label}</button>)}</div></fieldset>
    <div className="mx-auto mt-6 w-full max-w-64 rounded-[1.4rem] border border-[#D6B56F]/25 bg-[#FFFDF7] p-4 shadow-[0_16px_38px_rgba(0,0,0,.2)]"><Image src={selected.qrDataUrl} alt={`QR ${QR_MODE_DETAILS[mode].label} untuk ruang ${eventName}`} width={1024} height={1024} unoptimized className="h-auto w-full" /></div>
    <p className="mt-4 break-all rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 px-3 py-2.5 text-xs leading-5 text-[#AEB8BE] select-all">{selected.guestUrl}</p>
    <div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" onClick={copyLink} className="min-h-11 rounded-xl border border-[#F5F0E7]/12 px-4 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/30 hover:bg-[#F5F0E7]/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]" aria-live="polite">{copyFeedback}</button><a href={selected.qrDataUrl} download={selected.downloadName} className="flex min-h-11 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-4 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/30 hover:bg-[#F5F0E7]/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">Unduh QR</a><Link href={selected.printHref} className="flex min-h-12 items-center justify-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] sm:col-span-2">Cetak QR</Link></div>
  </>;
}
