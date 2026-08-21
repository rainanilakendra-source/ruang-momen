"use client";

import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "../app-icons";
import { useI18n } from "../i18n-provider";

export function PublicMobileBottomNav() {
  const { t } = useI18n();
  const itemClass = "flex min-h-12 flex-col items-center justify-center gap-1 text-[#AEB8BE] transition-colors hover:text-[#F5F0E7]";
  return <nav className="fixed right-0 bottom-0 left-0 z-50 px-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:hidden" aria-label={t("navigation.publicMobileAria")}><div className="mx-auto grid h-[68px] w-full max-w-[400px] grid-cols-5 items-center rounded-[24px] border border-[#F5F0E7]/10 bg-[rgba(10,29,48,.92)] px-1 shadow-[0_16px_42px_rgba(0,0,0,.34)] backdrop-blur-[18px]"><a href="#beranda" className={`${itemClass} text-[#F5F0E7]`}><AppIcon name="home" className="h-[21px] w-[21px]" /><span className="text-[9px] font-medium">{t("navigation.home")}</span></a><a href="#cara-kerja" className={itemClass}><span className="grid h-[21px] w-[21px] place-items-center rounded-full border border-current"><span className="ml-px block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-current" /></span><span className="text-[9px] font-medium">{t("navigation.flow")}</span></a><Link href="/daftar" className="group -translate-y-2.5 flex min-h-16 flex-col items-center justify-center gap-1"><span className="grid h-[52px] w-[52px] place-items-center rounded-[18px] border border-[#F5F0E7]/10 bg-[linear-gradient(145deg,#F1DDA7_0%,#D6B56F_52%,#A98242_100%)] text-[#071727] shadow-[inset_0_1px_0_rgba(245,240,231,.3),0_9px_22px_rgba(0,0,0,.24)] transition-transform group-active:scale-95"><Image src="/brand/ruang-momen-icon.png" alt="" width={512} height={512} className="h-9 w-9 object-contain drop-shadow-[0_2px_5px_rgba(7,23,39,.3)]" /></span><span className="text-[9px] font-semibold text-[#F5F0E7]">{t("navigation.createRoom")}</span></Link><a href="#contoh-album" className={itemClass}><AppIcon name="album" className="h-[21px] w-[21px]" /><span className="text-[9px] font-medium">{t("navigation.inspiration")}</span></a><a href="#faq" className={itemClass}><AppIcon name="help" className="h-[21px] w-[21px]" /><span className="text-[9px] font-medium">{t("common.help")}</span></a></div></nav>;
}
