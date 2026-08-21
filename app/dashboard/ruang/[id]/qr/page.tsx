import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "../../../../_components/print-button";
import { PrintableQrCard } from "../../../../_components/printable-qr-card";
import { requireUser } from "../../../../lib/auth";
import { buildGuestUrl, generateQrSvg, getAppBaseUrl, parseQrMode, QR_MODE_DETAILS } from "../../../../lib/qr";
import { formatPhotoSource, normalizePhotoSource } from "../../../../lib/photo-source";
import { prisma } from "../../../../lib/prisma";

export const metadata: Metadata = { title: "Cetak QR — Ruang Momen" };

export default async function PrintQrPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mode?: string | string[]; source?: string | string[] }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const mode = parseQrMode(query.mode);
  const source = normalizePhotoSource(query.source);
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: { name: true, slug: true },
  });

  if (!event) notFound();

  const guestUrl = buildGuestUrl({ baseUrl: getAppBaseUrl(), slug: event.slug, mode, source });
  const qrSvg = await generateQrSvg(guestUrl);

  return (
    <div className="print-preview-page">
      <div className="print-controls mx-auto mb-7 flex w-full max-w-[148mm] flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href={`/dashboard/ruang/${id}`} className="flex min-h-12 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-6 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#F5F0E7]/25 hover:bg-[#F5F0E7]/[.04]">Kembali ke Ruang</Link>
        <PrintButton />
      </div>
      <PrintableQrCard eventName={event.name} guestUrl={guestUrl} qrSvg={qrSvg} modeLabel={QR_MODE_DETAILS[mode].printLabel} sourceLabel={source ? formatPhotoSource(source) : null} />
    </div>
  );
}
