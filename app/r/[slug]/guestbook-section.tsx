"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitGuestbookEntry,
  type GuestbookState,
} from "./actions";

export type GuestbookItem = {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
};

const initialState: GuestbookState = { status: "idle", message: null };

export function GuestbookSection({
  slug,
  entries,
}: {
  slug: string;
  entries: GuestbookItem[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    submitGuestbookEntry.bind(null, slug),
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <section className="mt-8 border-t border-[var(--guest-border)] pt-8 text-left" aria-labelledby="guestbook-title">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--guest-accent)]">Buku Cerita</p>
        <h2 id="guestbook-title" className="mt-3 text-2xl font-bold text-[var(--guest-accent-soft)]">Tinggalkan cerita untuk acara ini</h2>
      </div>

      <form ref={formRef} action={action} className="mt-6 space-y-4 rounded-2xl border border-[var(--guest-border)] bg-[var(--guest-bg)] p-5" noValidate>
        <label className="block text-sm font-semibold text-[var(--guest-text)]">Nama <span className="font-normal text-[var(--guest-muted)]">(opsional)</span><input name="guestName" maxLength={40} autoComplete="name" placeholder="Tamu" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--guest-border)] bg-[var(--guest-input)] px-4 text-sm outline-none transition placeholder:text-[var(--guest-muted)] focus:border-[var(--guest-accent)]" /></label>
        <label className="block text-sm font-semibold text-[var(--guest-text)]">Pesan<textarea name="message" required maxLength={500} rows={4} placeholder="Tulis pesan singkat untuk tuan rumah..." className="mt-2 w-full resize-y rounded-xl border border-[var(--guest-border)] bg-[var(--guest-input)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--guest-muted)] focus:border-[var(--guest-accent)]" /></label>
        {state.message && <p role={state.status === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${state.status === "error" ? "border-red-300/20 bg-red-400/10 text-red-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>{state.message}</p>}
        <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--guest-accent)] px-5 text-sm font-bold text-[var(--guest-bg)] transition disabled:cursor-wait disabled:opacity-65">{pending ? "Mengirim..." : "Kirim Pesan"}</button>
      </form>

      <div className="mt-6 space-y-3">
        {entries.length ? entries.map((entry) => <article key={entry.id} className="rounded-2xl border border-[var(--guest-border)] bg-[var(--guest-bg)] p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-[var(--guest-accent-soft)]">{entry.guestName}</h3><time className="text-xs text-[var(--guest-muted)]">{entry.createdAt}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--guest-text)]">{entry.message}</p></article>) : <p className="rounded-2xl border border-dashed border-[var(--guest-border)] px-5 py-7 text-center text-sm text-[var(--guest-muted)]">Belum ada cerita. Jadilah yang pertama meninggalkan pesan.</p>}
      </div>
    </section>
  );
}
