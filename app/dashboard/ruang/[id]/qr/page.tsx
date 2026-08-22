import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../../_components/dashboard-shell";
import { FeatureLocked } from "../../../../_components/feature-locked";
import { ShareRoomActions, type QrVariant } from "../../../../_components/share-room-actions";
import { requireUser } from "../../../../lib/auth";
import { buildGuestUrl, generateQrDataUrl, getAppBaseUrl, QR_MODE_DETAILS, QR_MODES, type QrMode } from "../../../../lib/qr";
import { formatPhotoSource } from "../../../../lib/photo-source";
import { prisma } from "../../../../lib/prisma";
import { hasPlanFeature } from "../../../../lib/plan-limits";
import { PLAN_FEATURES } from "../../../../lib/plans";

export const metadata: Metadata = { title: "QR Studio — Ruang Momen" };

export default async function QrStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: {
      name: true,
      slug: true,
      photos: { where: { source: { not: null } }, distinct: ["source"], select: { source: true } },
    },
  });
  if (!event) notFound();
  if (!(await hasPlanFeature(user.id, PLAN_FEATURES.ADVANCED_QR))) return <><DashboardHeader title="QR Studio" description={`Siapkan QR untuk ${event.name} dalam beberapa klik.`} /><FeatureLocked /></>;

  const baseUrl = getAppBaseUrl();
  const variants = Object.fromEntries(await Promise.all(QR_MODES.map(async (mode) => {
    const guestUrl = buildGuestUrl({ baseUrl, slug: event.slug, mode });
    return [mode, {
      guestUrl,
      qrDataUrl: await generateQrDataUrl(guestUrl),
      printHref: `/dashboard/ruang/${id}/qr/print${mode === "general" ? "" : `?mode=${mode}`}`,
      downloadName: `ruang-momen-${event.slug}-${QR_MODE_DETAILS[mode].filename}.png`,
    }] as const;
  }))) as Record<QrMode, QrVariant>;
  const knownSources = event.photos.flatMap(({ source }) => source ? [formatPhotoSource(source)] : []);

  return <>
    <DashboardHeader title="QR Studio" description={`Siapkan QR untuk ${event.name} dalam beberapa klik.`} />
    <section className="mx-auto mt-8 max-w-xl rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-5 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Quick Generator</p><h2 className="mt-2 text-xl font-bold">Pilih QR yang dibutuhkan</h2></div><Link href={`/dashboard/ruang/${id}`} className="inline-flex min-h-10 items-center rounded-xl border border-[#F5F0E7]/12 px-4 text-xs font-semibold text-[#F5F0E7]">Kembali ke Ruang</Link></div>
      <p className="mt-3 text-sm leading-6 text-[#AEB8BE]">Pilih mode dan jejak momen. Preview, link, unduhan, dan kartu print akan mengikuti pilihanmu.</p>
      <ShareRoomActions eventName={event.name} eventId={id} eventSlug={event.slug} baseUrl={baseUrl} variants={variants} knownSources={knownSources} />
      <p className="mt-4 text-center text-xs font-semibold text-[#D6B56F]">QR dibuat dengan kontras tinggi dan quiet zone yang aman untuk dipindai.</p>
    </section>
  </>;
}
