"use client";

import Link from "next/link";
import { useI18n } from "./i18n-provider";

type Usage = { guests: number; photos: number; storageBytes: number };
type ActivePlan = { name: string; maxGuests: number; maxPhotos: number; storageLimitMb: number };

function bytesLabel(bytes: number, language: string) {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toLocaleString(language, { maximumFractionDigits: 1 })} GB`;
  return `${(bytes / (1024 * 1024)).toLocaleString(language, { maximumFractionDigits: 1 })} MB`;
}

export function PlanUsageCard({ plan, usage }: { plan: ActivePlan | null; usage: Usage }) {
  const { language, t } = useI18n();
  if (!plan) return <section className="mt-6 rounded-[1.5rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-xl font-bold">{t("planLimits.title")}</h2><p className="mt-3 text-sm text-[#AEB8BE]">{t("planLimits.noActivePlan")}</p><Link href="/dashboard/paket" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F]">{t("planLimits.choosePlan")}</Link></section>;

  const items = [
    { label: t("planLimits.guestUsage"), current: usage.guests, limit: plan.maxGuests, display: `${usage.guests.toLocaleString(language)} / ${plan.maxGuests.toLocaleString(language)}` },
    { label: t("planLimits.photoUsage"), current: usage.photos, limit: plan.maxPhotos, display: `${usage.photos.toLocaleString(language)} / ${plan.maxPhotos.toLocaleString(language)}` },
    { label: t("planLimits.storageUsage"), current: usage.storageBytes, limit: plan.storageLimitMb * 1024 * 1024, display: `${bytesLabel(usage.storageBytes, language)} / ${bytesLabel(plan.storageLimitMb * 1024 * 1024, language)}` },
  ];

  return <section className="mt-6 rounded-[1.5rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-5 shadow-[0_16px_38px_rgba(0,0,0,.1)] sm:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">{t("planLimits.title")}</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.035em]">{plan.name}</h2></div><Link href="/dashboard/langganan" className="text-sm font-bold text-[#D6B56F]">{t("navigation.subscription")} →</Link></div><div className="mt-6 grid gap-4 md:grid-cols-3">{items.map((item) => { const percentage = item.limit > 0 ? Math.min(100, (item.current / item.limit) * 100) : 100; return <div key={item.label} className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold text-[#AEB8BE]">{item.label}</h3><p className="text-sm font-bold">{item.display}</p></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F5F0E7]/10"><span className="block h-full rounded-full bg-[#D6B56F]" style={{ width: `${percentage}%` }} /></div></div>; })}</div></section>;
}
