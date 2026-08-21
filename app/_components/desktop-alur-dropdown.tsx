"use client";

import { useEffect, useRef, useState } from "react";

const items = [
  { label: "Buat ruang", description: "Mulai ruang acaramu dalam beberapa langkah.", target: "alur-buat-ruang", icon: "album" },
  { label: "Bagikan QR", description: "Tamu scan lalu kirim momen dari browser.", target: "alur-bagikan-qr", icon: "qr" },
  { label: "Kumpulkan cerita", description: "Semua foto masuk ke satu ruang bersama.", target: "alur-kumpulkan-momen", icon: "cerita" },
] as const;

function DropdownIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  if (name === "album") return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="m5 17 4-3.5 3 2.5 2.5-2 4.5 3" /><circle cx="9" cy="10" r="1.5" /></svg>;
  if (name === "qr") return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path strokeLinecap="round" d="M15 14h2v2h3m-6 4h2m4-3v3" /></svg>;
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5h13A2.5 2.5 0 0 1 21 7.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3h-1A2.5 2.5 0 0 1 3 14.5v-7A2.5 2.5 0 0 1 5.5 5Z" /><path strokeLinecap="round" d="M8 9h8m-8 4h5" /></svg>;
}

export function DesktopAlurDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && triggerRef.current?.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      cancelClose();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const selectItem = (targetId: string) => {
    setOpen(false);
    const target = document.getElementById(targetId);
    if (!target) return;

    window.history.pushState(null, "", `#${targetId}`);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus({ preventScroll: true });
    target.classList.add("alur-target-highlight");
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      target.classList.remove("alur-target-highlight");
    }, 1300);
  };

  return (
    <div ref={wrapperRef} className="group relative" onPointerEnter={cancelClose} onPointerLeave={scheduleClose} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose(); }}>
      <button ref={triggerRef} type="button" className="desktop-nav-link flex items-center gap-2 py-7" aria-expanded={open} aria-controls="desktop-alur-menu" onClick={() => setOpen((current) => !current)}>
        Alur
        <svg className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m4 6 4 4 4-4" /></svg>
      </button>
      {open && (
        <div id="desktop-alur-menu" className="absolute left-0 top-[calc(100%-5px)] w-72 rounded-[18px] border border-[#F5F0E7]/10 bg-[#0A1D30]/95 p-1.5 text-sm leading-normal shadow-[0_16px_38px_rgba(0,0,0,.22)] backdrop-blur-xl">
          {items.map((item) => (
            <a key={item.target} href={`#${item.target}`} onClick={(event) => { event.preventDefault(); selectItem(item.target); }} className="flex gap-3 rounded-[13px] p-3 transition hover:bg-[#F5F0E7]/[.045]">
              <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${item.icon === "cerita" ? "bg-[#A98242]/10 text-[#A98242]" : "bg-[#D6B56F]/10 text-[#D6B56F]"}`}><DropdownIcon name={item.icon} /></span>
              <span><span className="block text-[13px] font-semibold text-[#F5F0E7]">{item.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-[#AEB8BE]">{item.description}</span></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
