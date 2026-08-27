"use client";

import { useI18n } from "./i18n-provider";

export function PrintButton() {
  const { t } = useI18n();
  return <button type="button" onClick={() => window.print()} className="min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">{t("ui.print")}</button>;
}
