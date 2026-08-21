"use client";

import Link from "next/link";
import { AppIcon } from "./app-icons";
import { useI18n } from "./i18n-provider";

type SubscriptionView = { status: string; startedAt: string; expiredAt: string; plan: { name: string } };

export function SubscriptionSummary({ subscription }: { subscription: SubscriptionView | null }) {
  const { language, t } = useI18n();
  if (!subscription) return <section className="mt-8 rounded-[1.75rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-8 text-center shadow-[0_18px_44px_rgba(0,0,0,.12)] sm:p-12"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#D6B56F]"><AppIcon name="calendar" className="h-7 w-7" /></span><p className="mt-5 text-[#AEB8BE]">{t("subscription.empty")}</p><Link href="/dashboard/paket" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F5F0E7] px-6 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F]">{t("subscription.choosePlan")}</Link></section>;

  const formatter = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const statusKey = subscription.status === "EXPIRED" ? "subscription.expired" : subscription.status === "CANCELLED" ? "subscription.cancelled" : "subscription.active";
  const fields = [
    { label: t("subscription.status"), value: t(statusKey) },
    { label: t("subscription.startedAt"), value: formatter.format(new Date(subscription.startedAt)) },
    { label: t("subscription.expiredAt"), value: formatter.format(new Date(subscription.expiredAt)) },
  ];

  return <section className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-[#D6B56F]/20 bg-[#0A1D30] p-6 shadow-[0_20px_50px_rgba(0,0,0,.14)] sm:p-9"><div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-[#D6B56F]/[.06] blur-3xl" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">{t("subscription.currentPlan")}</p><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{subscription.plan.name}</h2><span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-emerald-200">{t(statusKey)}</span></div><dl className="mt-8 grid gap-3 sm:grid-cols-3">{fields.map((field) => <div key={field.label} className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/55 p-4"><dt className="text-xs font-semibold text-[#AEB8BE]">{field.label}</dt><dd className="mt-2 text-sm font-bold text-[#F5F0E7]">{field.value}</dd></div>)}</dl></div></section>;
}
