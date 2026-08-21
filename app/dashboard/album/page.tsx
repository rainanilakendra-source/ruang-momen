import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "../../_components/app-icons";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { requireUser } from "../../lib/auth";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../lib/event";
import { formatBytes } from "../../lib/format";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = { title: "Album — Ruang Momen" };

export default async function AlbumPage() {
  const user = await requireUser();
  const [events, sizes] = await Promise.all([
    prisma.event.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true, eventDate: true, _count: { select: { photos: true } }, photos: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } },
    }),
    prisma.photo.groupBy({ by: ["eventId"], where: { event: { ownerId: user.id } }, _sum: { sizeBytes: true } }),
  ]);
  const sizesByEvent = new Map(sizes.map((item) => [item.eventId, item._sum.sizeBytes ?? 0]));
  const hasAnyPhoto = events.some((event) => event._count.photos > 0);

  return (
    <>
      <DashboardHeader title="Album" description="Semua ruang dan momen yang dikirim tamumu." />
      {!hasAnyPhoto ? (
        <section className="mt-8 rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] px-6 py-12 text-center sm:px-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F]"><AppIcon name="album" className="h-8 w-8" /></span>
          <h2 className="mt-6 text-2xl font-extrabold">Belum ada momen yang terkumpul.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#AEB8BE]">Bagikan QR ruangmu. Foto yang dikirim tamu akan muncul di sini.</p>
          <Link href="/dashboard/ruang" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#F5F0E7] px-6 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F]">Lihat Ruang Saya</Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Album per ruang">
          {events.map((event) => {
            const latestPhoto = event.photos[0];
            return <article key={event.id} className="overflow-hidden rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] shadow-[0_14px_36px_rgba(0,0,0,.12)]">
              <div className="relative aspect-[16/10] bg-[#071727]">
                {latestPhoto ? <Image src={`/api/media/${latestPhoto.id}`} alt={`Momen terbaru ${event.name}`} fill sizes="(min-width:1280px) 30vw, (min-width:640px) 45vw, 100vw" unoptimized className="object-cover" /> : <div className="grid h-full place-items-center text-[#D6B56F]/50"><AppIcon name="album" className="h-12 w-12" /><span className="sr-only">Belum ada foto</span></div>}
              </div>
              <div className="p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#D6B56F]">{EVENT_TYPE_LABELS[event.type]}</p><h2 className="mt-2 text-xl font-bold">{event.name}</h2><p className="mt-2 text-sm text-[#AEB8BE]">{formatEventDate(event.eventDate)}</p><div className="mt-5 flex gap-5 border-t border-[#F5F0E7]/[.08] pt-4 text-sm"><span>{event._count.photos} momen</span><span className="text-[#AEB8BE]">{formatBytes(sizesByEvent.get(event.id) ?? 0)}</span></div><Link href={`/dashboard/ruang/${event.id}/album`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#D6B56F]/25 px-5 text-sm font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">Lihat Momen</Link></div>
            </article>;
          })}
        </section>
      )}
    </>
  );
}
