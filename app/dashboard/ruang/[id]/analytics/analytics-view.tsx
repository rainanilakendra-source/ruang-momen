"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../../../_components/i18n-provider";
import { formatPhotoSource } from "../../../../lib/photo-source";

type AnalyticsData = NonNullable<Awaited<ReturnType<typeof import("../../../../lib/event-analytics").getEventAnalytics>>>;

function formatBytes(bytes: number, language: "id" | "en") {
  const units = ["B", "KB", "MB", "GB"];
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}

export function AnalyticsView({ eventId, data }: { eventId: string; data: AnalyticsData }) {
  const { t, language } = useI18n();
  const locale = language === "id" ? "id-ID" : "en-US";
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
  const dateTime = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const maximumActivity = Math.max(...data.activity.map(({ count }) => count), 1);
  const cards = [
    ["analytics.totalMoments", data.metrics.moments.toLocaleString(locale)],
    ["analytics.storageUsed", formatBytes(data.metrics.storageBytes, language)],
    ["analytics.contributors", data.metrics.contributors.toLocaleString(locale)],
    ["analytics.totalReactions", data.metrics.reactions.toLocaleString(locale)],
    ["analytics.guestbook", data.metrics.guestbook.toLocaleString(locale)],
  ];

  return <>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#AEB8BE]">{t("analytics.eventDate")}: <span className="font-semibold text-[#F5F0E7]">{date(data.event.eventDate)}</span></p><Link href={`/dashboard/ruang/${eventId}`} className="inline-flex min-h-10 items-center rounded-xl border border-[#D6B56F]/25 px-4 text-sm font-bold text-[#F1DDA7]">{t("analytics.backToRoom")}</Link></div>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label={t("analytics.summary")}>
      {cards.map(([label, value]) => <article key={label} className="rounded-[1.25rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#AEB8BE]">{t(label)}</p><p className="mt-3 text-2xl font-extrabold text-[#F1DDA7]">{value}</p></article>)}
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <article className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6"><h2 className="text-xl font-bold">{t("analytics.momentActivity")}</h2>{data.activity.length ? <div className="mt-5 space-y-4">{data.activity.map((item) => <div key={item.bucket}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="text-[#D9D6CE]">{date(item.bucket)}</span><span className="font-bold text-[#F1DDA7]">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#071727]"><div className="h-full rounded-full bg-[#D6B56F]" style={{ width: `${Math.max(4, item.count / maximumActivity * 100)}%` }} /></div></div>)}</div> : <p className="mt-5 text-sm text-[#AEB8BE]">{t("analytics.noActivity")}</p>}</article>
      <article className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6"><h2 className="text-xl font-bold">{t("analytics.topSources")}</h2>{data.sources.length ? <ol className="mt-5 space-y-3">{data.sources.map((item, index) => <li key={item.source ?? "without-source"} className="flex items-center justify-between gap-3 rounded-xl border border-[#F5F0E7]/[.07] bg-[#071727]/40 px-4 py-3"><span className="text-sm font-semibold"><span className="mr-3 text-[#D6B56F]">{index + 1}.</span>{item.source ? formatPhotoSource(item.source) : t("analytics.withoutSource")}</span><span className="text-sm font-bold text-[#F1DDA7]">{item.count} {t("analytics.momentsUnit")}</span></li>)}</ol> : <p className="mt-5 text-sm text-[#AEB8BE]">{t("analytics.noSources")}</p>}</article>
    </section>
    <section className="mt-6 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6"><h2 className="text-xl font-bold">{t("analytics.favoriteMoments")}</h2>{data.topPhotos.length ? <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{data.topPhotos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/45"><div className="relative aspect-square"><Image src={`/api/media/${photo.id}`} alt={t("analytics.favoriteMomentAlt")} fill sizes="(min-width:1280px) 18vw, (min-width:768px) 30vw, 48vw" unoptimized className="object-cover" /></div><div className="p-3"><p className="font-bold text-rose-300">♥ {photo.reactionCount}</p>{photo.guestName && <p className="mt-1 truncate text-xs text-[#F1DDA7]">{photo.guestName}</p>}<time className="mt-1 block text-[11px] text-[#AEB8BE]">{dateTime(photo.createdAt)}</time></div></article>)}</div> : <p className="mt-5 text-sm text-[#AEB8BE]">{t("analytics.noFavorites")}</p>}</section>
    <section className="mt-6 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{t("analytics.latestStories")}</h2><span className="text-sm font-bold text-[#F1DDA7]">{data.metrics.guestbook}</span></div>{data.recentMessages.length ? <div className="mt-5 grid gap-3 lg:grid-cols-3">{data.recentMessages.map((entry) => <article key={entry.id} className="rounded-xl border border-[#F5F0E7]/[.07] bg-[#071727]/40 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold text-[#F1DDA7]">{entry.guestName}</p><time className="text-xs text-[#AEB8BE]">{dateTime(entry.createdAt)}</time></div><p className="mt-3 line-clamp-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#D9D6CE]">{entry.message}</p></article>)}</div> : <p className="mt-5 text-sm text-[#AEB8BE]">{t("analytics.noStories")}</p>}</section>
  </>;
}
