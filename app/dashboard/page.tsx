import type { Metadata } from "next";
import Link from "next/link";
import { AppIcon, type AppIconName } from "../_components/app-icons";
import { DashboardHeader } from "../_components/dashboard-shell";

export const metadata: Metadata = { title: "Dashboard — Ruang Momen" };

const stats: { label: string; value: string; icon: AppIconName }[] = [
  { label: "Ruang Aktif", value: "0", icon: "spaces" },
  { label: "Total Momen", value: "0", icon: "album" },
  { label: "Tamu Bergabung", value: "0", icon: "account" },
  { label: "Penyimpanan", value: "0 MB", icon: "billing" },
];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Selamat datang" description="Kelola ruang dan semua momen acaramu dari sini." />
      <section className="mt-8" aria-labelledby="overview-title">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Ringkasan</p><h2 id="overview-title" className="mt-2 text-xl font-bold">Overview ruangmu</h2></div><p className="hidden text-xs text-[#AEB8BE] sm:block">Data akan tampil setelah ruang dibuat.</p></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="rounded-[1.25rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-4 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_12px_30px_rgba(0,0,0,.1)] sm:p-5"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6B56F]/15 bg-[#D6B56F]/[.07] text-[#D6B56F]"><AppIcon name={stat.icon} className="h-5 w-5" /></span><p className="mt-5 text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">{stat.value}</p><h3 className="mt-1 text-xs font-semibold text-[#AEB8BE] sm:text-sm">{stat.label}</h3></article>)}</div>
      </section>

      <section className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] px-6 py-10 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full border border-[#D6B56F]/10" />
        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <div className="grid h-20 w-20 place-items-center rounded-[1.5rem] border border-[#D6B56F]/20 bg-[#D6B56F]/[.08] text-[#D6B56F] sm:h-24 sm:w-24"><AppIcon name="album" className="h-10 w-10 sm:h-12 sm:w-12" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Ruang pertamamu</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">Belum ada ruang yang dibuat.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#AEB8BE] sm:text-base sm:leading-7">Buat ruang pertamamu, bagikan QR, lalu biarkan setiap sudut cerita mulai terkumpul.</p><Link href="/dashboard/ruang/baru" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5F0E7] px-6 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Buat Ruang Pertama<AppIcon name="add" className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </>
  );
}
