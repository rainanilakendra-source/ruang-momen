"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "../../../../lib/event";
import { removeRoomCover, saveRoomSettings, type RoomSettingsState } from "./actions";
import type { EventType } from "../../../../generated/prisma/enums";

type SettingsEvent = {
  id: string;
  slug: string;
  name: string;
  type: EventType;
  eventDate: string;
  hasCover: boolean;
  guestUploadEnabled: boolean;
  guestGalleryEnabled: boolean;
  uploadStartsAt: string | null;
  uploadEndsAt: string | null;
};

const fieldClass = "mt-2 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727]/70 px-4 py-3.5 text-sm text-[#F5F0E7] outline-none transition placeholder:text-[#AEB8BE]/45 hover:border-[#F5F0E7]/20 focus:border-[#D6B56F]/65 focus:ring-4 focus:ring-[#D6B56F]/10";

function localDateTimeValue(iso: string): string {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function RoomSettingsForm({ event }: { event: SettingsEvent }) {
  const router = useRouter();
  const startsRef = useRef<HTMLInputElement>(null);
  const endsRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removing, startRemoving] = useTransition();
  const initialState: RoomSettingsState = { status: "idle", message: null };
  const [state, action, pending] = useActionState(async (previousState: RoomSettingsState, formData: FormData) => {
    formData.set("timezoneOffset", String(new Date().getTimezoneOffset()));
    const result = await saveRoomSettings(event.id, previousState, formData);
    if (result.status === "success") router.refresh();
    return result;
  }, initialState);

  useEffect(() => {
    if (startsRef.current && event.uploadStartsAt) startsRef.current.value = localDateTimeValue(event.uploadStartsAt);
    if (endsRef.current && event.uploadEndsAt) endsRef.current.value = localDateTimeValue(event.uploadEndsAt);
  }, [event.uploadEndsAt, event.uploadStartsAt]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const removeCover = () => {
    setRemoveError(null);
    startRemoving(async () => {
      const result = await removeRoomCover(event.id);
      if (!result.ok) {
        setRemoveError(result.message);
        return;
      }
      setConfirmRemove(false);
      router.refresh();
    });
  };

  return (
    <form action={action} className="mt-8 space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8" noValidate>
      <section className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">01</p><h2 className="mt-2 text-xl font-bold">Identitas Ruang</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#E8E3D9] sm:col-span-2">Nama Acara<input className={fieldClass} name="eventName" defaultValue={event.name} minLength={3} maxLength={100} required /></label>
          <label className="block text-sm font-semibold text-[#E8E3D9]">Jenis Acara<select className={fieldClass} name="eventType" defaultValue={event.type}>{EVENT_TYPES.map((type) => <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>)}</select></label>
          <label className="block text-sm font-semibold text-[#E8E3D9]">Tanggal Acara<input className={`${fieldClass} scheme-dark`} name="eventDate" type="date" defaultValue={event.eventDate} required /></label>
        </div>
        <p className="mt-4 text-xs text-[#AEB8BE]">Tautan ruang tetap menggunakan slug <span className="font-semibold text-[#F1DDA7]">{event.slug}</span>.</p>
      </section>

      <section className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">02</p><h2 className="mt-2 text-xl font-bold">Sampul Ruang</h2><p className="mt-2 text-sm text-[#AEB8BE]">Gunakan foto yang mewakili suasana acaramu.</p>
        {(previewUrl || event.hasCover) && <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-2xl border border-[#D6B56F]/20 bg-[#071727]">{previewUrl ? <Image src={previewUrl} alt="Pratinjau sampul baru" fill unoptimized className="object-cover" /> : <Image src={`/api/ruang/${encodeURIComponent(event.slug)}/cover`} alt={`Sampul ${event.name}`} fill unoptimized className="object-cover" />}</div>}
        <label className="mt-5 block text-sm font-semibold text-[#E8E3D9]">Pilih Sampul<input className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5F0E7] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#071727]`} name="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(changeEvent) => { const file = changeEvent.currentTarget.files?.[0]; setPreviewUrl(file ? URL.createObjectURL(file) : null); }} /></label>
        <p className="mt-2 text-xs text-[#AEB8BE]">JPEG, PNG, atau WebP · Maksimal 10 MB. File asli tidak dipotong saat disimpan.</p>
        {event.hasCover && <div className="mt-4">{confirmRemove ? <div className="rounded-xl border border-red-300/20 bg-red-300/[.05] p-4"><p className="text-sm text-[#E8E3D9]">Hapus sampul ruang ini?</p><div className="mt-3 flex gap-2"><button type="button" disabled={removing} onClick={removeCover} className="min-h-10 rounded-lg bg-red-200 px-4 text-xs font-bold text-[#071727]">{removing ? "Menghapus..." : "Ya, Hapus"}</button><button type="button" disabled={removing} onClick={() => setConfirmRemove(false)} className="min-h-10 rounded-lg border border-[#F5F0E7]/15 px-4 text-xs font-semibold">Batal</button></div></div> : <button type="button" onClick={() => setConfirmRemove(true)} className="min-h-11 rounded-xl border border-red-300/25 px-4 text-sm font-semibold text-red-200">Hapus Sampul</button>}{removeError && <p role="alert" className="mt-3 text-sm text-red-300">{removeError}</p>}</div>}
      </section>

      <section className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">03</p><h2 className="mt-2 text-xl font-bold">Akses Momen</h2>
        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/45 p-4"><span><span className="block text-sm font-semibold text-[#F5F0E7]">Izinkan tamu mengirim momen</span><span className="mt-1 block text-xs leading-5 text-[#AEB8BE]">Jika dimatikan, tamu masih dapat membuka ruang tetapi tidak dapat mengirim foto.</span></span><input type="checkbox" name="guestUploadEnabled" defaultChecked={event.guestUploadEnabled} className="mt-1 h-5 w-5 shrink-0 accent-[#D6B56F]" /></label>
          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/45 p-4"><span><span className="block text-sm font-semibold text-[#F5F0E7]">Tamu boleh melihat album</span><span className="mt-1 block text-xs leading-5 text-[#AEB8BE]">Jika aktif, album tamu dapat ditampilkan saat fitur Galeri Tamu digunakan.</span></span><input type="checkbox" name="guestGalleryEnabled" defaultChecked={event.guestGalleryEnabled} className="mt-1 h-5 w-5 shrink-0 accent-[#D6B56F]" /></label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">04</p><h2 className="mt-2 text-xl font-bold">Masa Aktif</h2><p className="mt-2 text-sm text-[#AEB8BE]">Kosongkan waktu jika tidak ingin memberi batas.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#E8E3D9]">Mulai menerima momen<input ref={startsRef} className={`${fieldClass} scheme-dark`} name="uploadStartsAt" type="datetime-local" /></label><label className="block text-sm font-semibold text-[#E8E3D9]">Berhenti menerima momen<input ref={endsRef} className={`${fieldClass} scheme-dark`} name="uploadEndsAt" type="datetime-local" /></label></div>
      </section>

      <div aria-live="polite">{state.message && <p role={state.status === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${state.status === "success" ? "border-[#D6B56F]/25 bg-[#D6B56F]/[.08] text-[#F1DDA7]" : "border-red-300/20 bg-red-300/[.05] text-red-200"}`}>{state.message}</p>}</div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={`/dashboard/ruang/${event.id}`} className="flex min-h-12 items-center justify-center rounded-xl border border-[#F5F0E7]/12 px-6 text-sm font-semibold">Kembali</Link><button type="submit" disabled={pending || removing} className="min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F] disabled:cursor-wait disabled:opacity-60">{pending ? "Menyimpan..." : "Simpan Perubahan"}</button></div>
    </form>
  );
}
