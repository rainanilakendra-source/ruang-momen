"use client";

import Link from "next/link";
import { AppIcon } from "./app-icons";
import { useI18n } from "./i18n-provider";

export type StorePlan = {
  id: string; code: string; name: string; slug: string; description: string | null; price: number;
  maxGuests: number; maxPhotos: number; storageLimitMb: number; durationDays: number;
  features: { feature: { id: string; key: string; name: string } }[];
};

const DEFAULT_PLAN_CODES = new Set(["BASIC", "STANDARD", "PREMIUM"]);
const FEATURE_PRIORITY = ["guest_upload", "camera_mode", "gallery", "download_original", "analytics", "zip_export", "watermark", "custom_branding"];

export function TranslatedFeatureName({ featureKey, fallback }: { featureKey: string; fallback: string }) {
  const { t } = useI18n();
  const translationKey = `plans.featureNames.${featureKey}`;
  const translated = t(translationKey);
  return <>{translated === translationKey ? fallback : translated}</>;
}

export function PlanCard({ plan, detail = false }: { plan: StorePlan; detail?: boolean }) {
  const { language, t } = useI18n();
  const planCode = plan.code.toUpperCase();
  const catalogKey = DEFAULT_PLAN_CODES.has(planCode) ? planCode.toLowerCase() : null;
  const planName = catalogKey ? t(`plans.catalog.${catalogKey}.name`) : plan.name;
  const planDescription = catalogKey ? t(`plans.catalog.${catalogKey}.description`) : plan.description;
  const recommended = planCode === "PREMIUM";
  const price = new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.price);
  const limits = [
    { icon: "account" as const, label: t("plans.guestLimit"), value: `${plan.maxGuests.toLocaleString(language)} ${t("plans.guests")}` },
    { icon: "album" as const, label: t("plans.photoLimit"), value: `${plan.maxPhotos.toLocaleString(language)} ${t("plans.photos")}` },
    { icon: "billing" as const, label: t("plans.storage"), value: `${plan.storageLimitMb.toLocaleString(language)} ${t("plans.megabytes")}` },
    { icon: "calendar" as const, label: t("plans.duration"), value: `${plan.durationDays.toLocaleString(language)} ${t("plans.days")}` },
  ];
  const sortedFeatures = [...plan.features].sort((left, right) => {
    const leftRank = FEATURE_PRIORITY.indexOf(left.feature.key);
    const rightRank = FEATURE_PRIORITY.indexOf(right.feature.key);
    return (leftRank < 0 ? Number.MAX_SAFE_INTEGER : leftRank) - (rightRank < 0 ? Number.MAX_SAFE_INTEGER : rightRank);
  });
  const visibleFeatures = detail ? sortedFeatures : sortedFeatures.slice(0, 5);

  return (
    <article className={`relative flex h-full flex-col rounded-[1.5rem] border bg-[#0A1D30] shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] ${recommended ? "border-[#D6B56F]/45 ring-1 ring-[#D6B56F]/10" : "border-[#F5F0E7]/10"} ${detail ? "p-6 sm:p-8" : "p-4 sm:p-5"}`}>
      {recommended && <span className="absolute -top-3 right-5 rounded-full border border-[#D6B56F]/35 bg-[#D6B56F] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#071727]">{t("plans.recommended")}</span>}
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#D6B56F]">Ruang Momen</p><h2 className="mt-1.5 text-2xl font-extrabold tracking-[-.035em]">{planName}</h2></div>
        <span className="rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#F1DDA7]">{t("common.active")}</span>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-[#AEB8BE]">{planDescription}</p>
      <p className="mt-4 text-3xl font-extrabold tracking-[-.04em] text-[#F5F0E7]">{price}</p>
      <dl className={`mt-5 grid grid-cols-2 gap-2 ${detail ? "sm:grid-cols-4" : ""}`}>
        {limits.map((limit) => <div key={limit.label} className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 p-2.5"><dt className="flex items-center gap-1.5 text-[10px] font-semibold text-[#AEB8BE]"><AppIcon name={limit.icon} className="h-3.5 w-3.5 text-[#D6B56F]" />{limit.label}</dt><dd className="mt-1.5 text-xs font-bold text-[#F5F0E7] sm:text-sm">{limit.value}</dd></div>)}
      </dl>
      <div className="mt-5 flex-1 border-t border-[#F5F0E7]/[.08] pt-4"><h3 className="text-sm font-bold text-[#F1DDA7]">{t("plans.features")}</h3>{visibleFeatures.length ? <ul className={`mt-3 grid gap-2 ${detail ? "sm:grid-cols-2" : ""}`}>{visibleFeatures.map(({ feature }) => <li key={feature.id} className="flex gap-2.5 text-sm text-[#D9D6CE]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#D6B56F]/12 text-xs text-[#D6B56F]">✓</span><span className="font-semibold"><TranslatedFeatureName featureKey={feature.key} fallback={feature.name} /></span></li>)}</ul> : <p className="mt-3 text-sm text-[#AEB8BE]">{t("plans.noFeatures")}</p>}</div>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {!detail && <Link href={`/dashboard/paket/${plan.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D6B56F]/25 px-4 text-sm font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">{t("plans.viewAllFeatures")}</Link>}
        <Link href={`/dashboard/checkout/${plan.id}`} className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F5F0E7] px-4 text-sm font-bold text-[#071727] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] ${detail ? "sm:col-span-2" : ""}`}>{t("plans.choose")}</Link>
      </div>
    </article>
  );
}
