"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon, type AppIconName } from "../app-icons";
import { useI18n } from "../i18n-provider";

export type MobileMenuItem = { labelKey: string; href?: string; icon?: AppIconName; action?: ReactNode };
export type MobileMenuSection = { titleKey: string; items: MobileMenuItem[] };

export function MobileMenuSheet({ open, onClose, sections }: { open: boolean; onClose: () => void; sections: MobileMenuSection[] }) {
  const { t } = useI18n();
  return <div className={`fixed inset-0 z-[70] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}><button type="button" aria-label={t("navigation.closeMenu")} onClick={onClose} className={`absolute inset-0 bg-[#020A12]/70 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`} /><aside role="dialog" aria-modal="true" aria-label={t("navigation.mobileMenu")} className={`absolute top-3 right-3 max-h-[calc(100dvh-6.5rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-[1.75rem] border border-[#D6B56F]/20 bg-[#081A2B] p-5 text-[#F5F0E7] shadow-[0_24px_70px_rgba(0,0,0,.45)] transition duration-200 ${open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"}`}><div className="mb-5 flex items-center justify-between"><p className="font-serif text-xl italic text-[#F1DDA7]">Ruang Momen</p><button type="button" onClick={onClose} aria-label={t("navigation.closeMenu")} className="grid h-9 w-9 place-items-center rounded-xl border border-[#F5F0E7]/10 text-xl text-[#AEB8BE]">×</button></div><div className="space-y-5">{sections.map((section) => <section key={section.titleKey}><h2 className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#D6B56F]">{t(section.titleKey)}</h2><div className="space-y-1">{section.items.map((item) => item.action ? <div key={item.labelKey}>{item.action}</div> : item.href ? <Link key={item.labelKey} href={item.href} onClick={onClose} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#D9D6CE] transition hover:bg-[#D6B56F]/10 hover:text-[#F1DDA7]">{item.icon && <AppIcon name={item.icon} className="h-[18px] w-[18px] text-[#D6B56F]" />}<span>{t(item.labelKey)}</span></Link> : <button key={item.labelKey} type="button" disabled className="flex min-h-11 w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#AEB8BE]/55">{item.icon && <AppIcon name={item.icon} className="h-[18px] w-[18px]" />}<span>{t(item.labelKey)}</span><span className="sr-only">({t("common.unavailable")})</span></button>)}</div></section>)}</div></aside></div>;
}
