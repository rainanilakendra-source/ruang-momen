"use client";

import { useActionState } from "react";
import type { PlanFormState } from "../../incroet/plans/actions";

type Values = { name: string; description: string | null; price: number; maxGuests: number; maxPhotos: number; storageLimitMb: number; durationDays: number };

export function PlanForm({ action, values, submitLabel }: { action: (state: PlanFormState, formData: FormData) => Promise<PlanFormState>; values?: Values; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const fields = [
    { name: "price", label: "Price", value: values?.price ?? 0 },
    { name: "maxGuests", label: "Max Guests", value: values?.maxGuests ?? 0 },
    { name: "maxPhotos", label: "Max Photos", value: values?.maxPhotos ?? 0 },
    { name: "storageLimitMb", label: "Storage MB", value: values?.storageLimitMb ?? 0 },
    { name: "durationDays", label: "Duration Days", value: values?.durationDays ?? 30 },
  ];

  return (
    <form action={formAction} className="space-y-5">
      <div><label htmlFor="name" className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Name</label><input id="name" name="name" required maxLength={100} defaultValue={values?.name} className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-sm outline-none transition focus:border-[#D6B56F]/50" /></div>
      <div><label htmlFor="description" className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Description</label><textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={values?.description ?? ""} className="mt-2 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 py-3 text-sm outline-none transition focus:border-[#D6B56F]/50" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{fields.map((field) => <div key={field.name}><label htmlFor={field.name} className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">{field.label}</label><input id={field.name} name={field.name} type="number" min={0} step={1} required defaultValue={field.value} className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-sm outline-none transition focus:border-[#D6B56F]/50" /></div>)}</div>
      {state.error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}
      <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#D6B56F] px-6 text-sm font-bold text-[#071727] transition hover:bg-[#F1DDA7] disabled:cursor-wait disabled:opacity-60">{pending ? "Menyimpan..." : submitLabel}</button>
    </form>
  );
}
