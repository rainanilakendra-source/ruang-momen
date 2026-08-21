"use client";

import Image from "next/image";
import Link from "next/link";
import { AppIcon, type AppIconName } from "../app-icons";
import { useI18n } from "../i18n-provider";

export type MobileNavItem = { labelKey: string; icon: AppIconName; href?: string; action?: "open-menu"; active?: boolean; center?: boolean };

export function MobileBottomNav({ items, ariaLabelKey }: { items: MobileNavItem[]; ariaLabelKey: string }) {
  const { t } = useI18n();
  const itemClass = (item: MobileNavItem) => `group flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#D6B56F] ${item.center ? "-translate-y-2" : ""} ${item.active ? "text-[#F5F0E7]" : "text-[#AEB8BE] hover:text-[#F5F0E7]"}`;
  const content = (item: MobileNavItem) => <><span className={item.center ? "grid h-12 w-12 place-items-center rounded-[16px] border border-[#F5F0E7]/15 bg-[linear-gradient(145deg,#F1DDA7_0%,#D6B56F_58%,#A98242_100%)] text-[#071727] shadow-[0_8px_20px_rgba(0,0,0,.28)] transition group-active:scale-95" : "grid h-7 w-7 place-items-center"}>{item.center ? <Image src="/brand/ruang-momen-icon.png" alt="" width={512} height={512} className="h-8 w-8 object-contain" /> : <AppIcon name={item.icon} className="h-5 w-5" />}</span><span>{t(item.labelKey)}</span></>;
  return <nav className="fixed right-0 bottom-0 left-0 z-50 px-3 pb-[calc(.65rem+env(safe-area-inset-bottom))] lg:hidden" aria-label={t(ariaLabelKey)}><div className="mx-auto grid h-16 w-full max-w-[420px] grid-cols-5 items-center rounded-[22px] border border-[#F5F0E7]/10 bg-[rgba(10,29,48,.95)] px-1.5 shadow-[0_16px_42px_rgba(0,0,0,.34)] backdrop-blur-[18px]">{items.map((item) => item.action === "open-menu" ? <button key={item.labelKey} type="button" onClick={() => window.dispatchEvent(new Event("ruang-mobile-menu-open"))} className={itemClass(item)}>{content(item)}</button> : <Link key={item.labelKey} href={item.href ?? "/"} aria-current={item.active ? "page" : undefined} className={itemClass(item)}>{content(item)}</Link>)}</div></nav>;
}
