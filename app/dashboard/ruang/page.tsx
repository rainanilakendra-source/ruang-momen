import type { Metadata } from "next";
import Link from "next/link";
import { AppIcon } from "../../_components/app-icons";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { requireUser } from "../../lib/auth";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../lib/event";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = { title: "Ruang Saya — Ruang Momen" };

export default async function RoomsPage() {
  const user = await requireUser();
  const events = await prisma.event.findMany({
    where: { ownerId: user.id },
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, type: true, eventDate: true },
  });

  return (
    <>
      <DashboardHeader title="Ruang Saya" description="Kelola semua ruang acara yang sudah kamu buat." />
      {events.length === 0 ? (
        <section className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] px-6 py-10 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full border border-[#D6B56F]/10" />
          <div className="relative"><div className="grid h-20 w-20 place-items-center rounded-[1.5rem] border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F]"><AppIcon name="spaces" className="h-10 w-10" /></div><h2 className="mt-6 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">Belum ada ruang yang dibuat.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#AEB8BE] sm:text-base sm:leading-7">Buat ruang pertamamu untuk mulai menyiapkan acara.</p><Link href="/dashboard/ruang/baru" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5F0E7] px-6 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F]">Buat Ruang Pertama<AppIcon name="add" className="h-4 w-4" /></Link></div>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Daftar ruang acara">
          {events.map((event) => (
            <article key={event.id} className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_14px_36px_rgba(0,0,0,.1)] sm:p-7">
              <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F]"><AppIcon name="spaces" className="h-5 w-5" /></span><span className="rounded-full border border-[#D6B56F]/15 bg-[#D6B56F]/[.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#D6B56F]">{EVENT_TYPE_LABELS[event.type]}</span></div>
              <h2 className="mt-6 text-xl font-bold tracking-[-.025em]">{event.name}</h2>
              <p className="mt-2 text-sm text-[#AEB8BE]">{formatEventDate(event.eventDate)}</p>
              <Link href={`/dashboard/ruang/${event.id}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-5 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/30 hover:bg-[#F5F0E7]/[.04]">Buka Ruang</Link>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
