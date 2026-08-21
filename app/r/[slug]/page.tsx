import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EVENT_TYPE_LABELS, formatEventDate } from "../../lib/event";
import { prisma } from "../../lib/prisma";
import { GuestPhotoUploader } from "./guest-photo-uploader";

export const metadata: Metadata = { title: "Ruang Acara — Ruang Momen" };

export default async function GuestRoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { name: true, slug: true, type: true, eventDate: true },
  });

  if (!event) notFound();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071727] px-5 py-10 text-[#F5F0E7] sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#D6B56F]/[.06] blur-[110px]" />
      <section className="relative w-full max-w-2xl rounded-[2rem] border border-[#D6B56F]/20 bg-[#0A1D30]/95 p-7 text-center shadow-[inset_0_1px_0_rgba(245,240,231,.03),0_28px_80px_rgba(0,0,0,.24)] sm:p-12">
        <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="mx-auto h-14 w-auto object-contain sm:h-16" priority />
        <p className="mt-9 text-xs font-bold uppercase tracking-[.22em] text-[#D6B56F]">Ruang Acara</p>
        <h1 className="mx-auto mt-4 max-w-xl text-3xl leading-tight font-extrabold tracking-[-.045em] sm:text-5xl">{event.name}</h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[#AEB8BE]"><span>{EVENT_TYPE_LABELS[event.type]}</span><span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D6B56F]" /><span>{formatEventDate(event.eventDate)}</span></div>
        <div className="mx-auto mt-9 max-w-lg border-t border-[#F5F0E7]/[.08] pt-8"><h2 className="font-serif text-2xl italic text-[#F1DDA7] sm:text-3xl">Setiap sudut punya cerita.</h2><p className="mt-4 text-sm leading-7 text-[#AEB8BE] sm:text-base">Bagikan momen yang kamu lihat dan bantu isi ruang ini bersama.</p></div>
        <GuestPhotoUploader slug={event.slug} />
        <p className="mt-5 text-xs font-semibold text-[#D6B56F]">Tanpa install aplikasi</p>
      </section>
    </main>
  );
}
