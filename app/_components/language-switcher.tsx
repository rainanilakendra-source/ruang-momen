"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n-provider";

function FlagIcon({ language }: { language: "id" | "en" }) {
  if (language === "id") return <svg viewBox="0 0 30 20" className="h-4 w-5 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(245,240,231,.18)]" aria-hidden="true"><path fill="#fff" d="M0 0h30v20H0z" /><path fill="#CE1126" d="M0 0h30v10H0z" /></svg>;
  return <svg viewBox="0 0 60 30" className="h-4 w-5 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(245,240,231,.18)]" aria-hidden="true"><path fill="#012169" d="M0 0h60v30H0z" /><path stroke="#fff" strokeWidth="6" d="m0 0 60 30m0-30L0 30" /><path stroke="#C8102E" strokeWidth="2.5" d="m0 0 60 30m0-30L0 30" /><path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" /><path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" /></svg>;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectLanguage = (next: "id" | "en") => {
    setLanguage(next);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} data-compact={compact || undefined} className="relative order-last z-[60] shrink-0 lg:ml-5">
      <button type="button" aria-label={t("language.label")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="grid h-9 w-9 place-items-center rounded-full border border-[#D6B56F]/30 bg-[#081A2B]/95 text-[17px] shadow-[0_10px_28px_rgba(0,0,0,.28)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#D6B56F]/60 hover:bg-[#0A1D30] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#D6B56F]">
        <FlagIcon language={language} />
      </button>

      {open && (
        <div role="menu" aria-label={t("language.label")} className="absolute top-0 right-11 flex overflow-hidden rounded-xl border border-[#D6B56F]/20 bg-[#081A2B]/98 p-1 shadow-[0_18px_44px_rgba(0,0,0,.38)] backdrop-blur-xl">
          <button type="button" role="menuitemradio" aria-label={t("language.id")} title={t("language.id")} aria-checked={language === "id"} onClick={() => selectLanguage("id")} className={`grid h-9 w-9 place-items-center rounded-lg text-[17px] transition hover:bg-[#F5F0E7]/[.06] focus-visible:outline-2 focus-visible:outline-[#D6B56F] ${language === "id" ? "bg-[#D6B56F]/10" : ""}`}><FlagIcon language="id" /></button>
          <button type="button" role="menuitemradio" aria-label={t("language.en")} title={t("language.en")} aria-checked={language === "en"} onClick={() => selectLanguage("en")} className={`grid h-9 w-9 place-items-center rounded-lg text-[17px] transition hover:bg-[#F5F0E7]/[.06] focus-visible:outline-2 focus-visible:outline-[#D6B56F] ${language === "en" ? "bg-[#D6B56F]/10" : ""}`}><FlagIcon language="en" /></button>
        </div>
      )}
    </div>
  );
}
