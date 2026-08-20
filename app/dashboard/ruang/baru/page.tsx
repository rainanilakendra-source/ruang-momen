import type { Metadata } from "next";
import { CreateRoomForm } from "../../../_components/create-room-form";
import { DashboardHeader } from "../../../_components/dashboard-shell";

export const metadata: Metadata = { title: "Buat Ruang Baru — Ruang Momen" };

export default function CreateRoomPage() {
  return (
    <>
      <DashboardHeader title="Buat Ruang Baru" description="Siapkan tempat untuk mengumpulkan momen acaramu." />
      <section className="mt-8 max-w-3xl rounded-[1.75rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_18px_44px_rgba(0,0,0,.12)] sm:p-9">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Informasi acara</p><h2 className="mt-3 text-xl font-bold sm:text-2xl">Mulai dari detail dasarnya.</h2><p className="mt-2 text-sm leading-6 text-[#AEB8BE]">Detail ini masih berupa UI placeholder dan belum akan disimpan.</p></div>
        <CreateRoomForm />
      </section>
    </>
  );
}
