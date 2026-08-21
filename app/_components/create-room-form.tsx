"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createEvent, type CreateEventState } from "../dashboard/ruang/baru/actions";

const fieldClass = "mt-2 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727]/70 px-4 py-3.5 text-sm text-[#F5F0E7] outline-none transition placeholder:text-[#AEB8BE]/45 hover:border-[#F5F0E7]/20 focus:border-[#D6B56F]/65 focus:ring-4 focus:ring-[#D6B56F]/10";

export function CreateRoomForm() {
  const initialState: CreateEventState = { error: null };
  const [state, action, pending] = useActionState(createEvent, initialState);

  return (
    <form className="mt-8 space-y-6" action={action} noValidate>
      <label className="block text-sm font-semibold text-[#E8E3D9]">Nama Acara<input className={fieldClass} name="eventName" placeholder="Contoh: Pernikahan Nabila & Arga" minLength={3} maxLength={100} required /></label>
      <label className="block text-sm font-semibold text-[#E8E3D9]">Jenis Acara<select className={fieldClass} name="eventType" defaultValue="" required><option value="" disabled>Pilih jenis acara</option><option value="WEDDING">Pernikahan</option><option value="BIRTHDAY">Ulang Tahun</option><option value="GATHERING">Gathering</option><option value="GRADUATION">Wisuda</option><option value="REUNION">Reuni</option><option value="CORPORATE">Acara Kantor</option><option value="OTHER">Lainnya</option></select></label>
      <label className="block text-sm font-semibold text-[#E8E3D9]">Tanggal Acara<input className={`${fieldClass} scheme-dark`} name="eventDate" type="date" required /></label>
      {state.error && <p className="rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/[.07] px-4 py-3 text-sm leading-6 text-[#E8E3D9]" role="alert">{state.error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-[#F5F0E7]/[.08] pt-6 sm:flex-row sm:justify-end">
        <Link href="/dashboard" className="flex min-h-12 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-6 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#F5F0E7]/25 hover:bg-[#F5F0E7]/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">Batal</Link>
        <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0">{pending ? "Membuat ruang..." : "Lanjutkan"}</button>
      </div>
    </form>
  );
}
