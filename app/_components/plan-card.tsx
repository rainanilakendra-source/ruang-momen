"use client";

import Link from "next/link";
import { AppIcon } from "./app-icons";
import { useI18n } from "./i18n-provider";

export type StorePlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  maxGuests: number;
  maxPhotos: number;
  storageLimitMb: number;
  durationDays: number;
  features: { feature: { id: string; name: string; description: string | null } }[];
};

export function PlanCard({ plan, detail = false }: { plan: StorePlan; detail?: boolean }) {
  const { language, t } = useI18n();
  const price = new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(plan.price);
  const limits = [
    { icon: "account" as const, label: t("plans.guestLimit"), value: `${plan.maxGuests.toLocaleString(language)} ${t("plans.guests")}` },
    { icon: "album" as const, label: t("plans.photoLimit"), value: `${plan.maxPhotos.toLocaleString(language)} ${t("plans.photos")}` },
    { icon: "billing" as const, label: t("plans.storage"), value: `${plan.storageLimitMb.toLocaleString(language)} ${t("plans.megabytes")}` },
    { icon: "calendar" as const, label: t("plans.duration"), value: `${plan.durationDays.toLocaleString(language)} ${t("plans.days")}` },
  ];

  return (
    <article className={`flex h-full flex-col rounded-[1.75rem] border border-[#F5F0E7]/10 bg-[#0A1D30] shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] ${detail ? "p-6 sm:p-9" : "p-5 sm:p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Ruang Momen</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">{plan.name}</h2></div>
        <span className="rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#F1DDA7]">{t("common.active")}</span>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-[#AEB8BE] sm:text-base">{plan.description}</p>
      <p className="mt-6 text-3xl font-extrabold tracking-[-.04em] text-[#F5F0E7] sm:text-4xl">{price}</p>

      <dl className={`mt-7 grid gap-3 ${detail ? "sm:grid-cols-2" : "grid-cols-2"}`}>
        {limits.map((limit) => <div key={limit.label} className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 p-3"><dt className="flex items-center gap-2 text-[11px] font-semibold text-[#AEB8BE]"><AppIcon name={limit.icon} className="h-4 w-4 text-[#D6B56F]" />{limit.label}</dt><dd className="mt-2 text-sm font-bold text-[#F5F0E7]">{limit.value}</dd></div>)}
      </dl>

      <div className="mt-7 flex-1 border-t border-[#F5F0E7]/[.08] pt-6"><h3 className="text-sm font-bold text-[#F1DDA7]">{t("plans.features")}</h3>{plan.features.length ? <ul className={`mt-4 grid gap-3 ${detail ? "sm:grid-cols-2" : ""}`}>{plan.features.map(({ feature }) => <li key={feature.id} className="flex gap-3 text-sm text-[#D9D6CE]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#D6B56F]/12 text-xs text-[#D6B56F]">✓</span><span><span className="font-semibold">{feature.name}</span>{detail && feature.description && <span className="mt-1 block text-xs leading-5 text-[#AEB8BE]">{feature.description}</span>}</span></li>)}</ul> : <p className="mt-3 text-sm text-[#AEB8BE]">{t("plans.noFeatures")}</p>}</div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {!detail && <Link href={`/dashboard/paket/${plan.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#D6B56F]/25 px-5 text-sm font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">{t("plans.viewDetails")}</Link>}
        <Link href={`/dashboard/checkout/${plan.id}`} className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] ${detail ? "sm:col-span-2" : ""}`}>{t("plans.choose")}</Link>
      </div>
    </article>
  );
}
