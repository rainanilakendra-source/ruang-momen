"use client";

import { useI18n } from "./i18n-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("language.label")}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value === "en" ? "en" : "id")} aria-label={t("language.label")} className="h-10 appearance-none rounded-xl border border-[#D6B56F]/25 bg-[#0A1D30] py-2 pr-8 pl-3 text-xs font-bold text-[#F1DDA7] outline-none transition hover:border-[#D6B56F]/50 focus:ring-2 focus:ring-[#D6B56F]/25">
        <option value="id">🇮🇩 {compact ? "ID" : t("language.id")}</option>
        <option value="en">🇬🇧 {compact ? "EN" : t("language.en")}</option>
      </select>
      <span className="pointer-events-none absolute right-3 text-[9px] text-[#D6B56F]">▼</span>
    </label>
  );
}
