"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ShareRoomActions({
  guestUrl,
  qrDataUrl,
  eventSlug,
  printHref,
}: {
  guestUrl: string;
  qrDataUrl: string;
  eventSlug: string;
  printHref: string;
}) {
  const [copyFeedback, setCopyFeedback] = useState("Salin Tautan");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const copyLink = async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(guestUrl);
        copied = true;
      }
    } catch {}

    if (!copied) {
      const textarea = document.createElement("textarea");
      textarea.value = guestUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      } finally {
        textarea.remove();
      }
    }

    setCopyFeedback(copied ? "Tautan tersalin" : "Tidak dapat menyalin otomatis. Salin tautan secara manual.");

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setCopyFeedback("Salin Tautan"), 1800);
  };

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <button type="button" onClick={copyLink} className="min-h-11 rounded-xl border border-[#F5F0E7]/12 px-4 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/30 hover:bg-[#F5F0E7]/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]" aria-live="polite">{copyFeedback}</button>
      <a href={qrDataUrl} download={`ruang-momen-${eventSlug}-qr.png`} className="flex min-h-11 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-4 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/30 hover:bg-[#F5F0E7]/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">Unduh QR</a>
      <Link href={printHref} className="flex min-h-12 items-center justify-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] sm:col-span-2">Cetak QR</Link>
    </div>
  );
}
