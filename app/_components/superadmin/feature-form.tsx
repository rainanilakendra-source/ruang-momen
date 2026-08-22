"use client";

import { useActionState } from "react";
import type { FeatureFormState } from "../../incroet/features/actions";

type Values = { name: string; key: string; description: string | null };

export function FeatureForm({ action, values, submitLabel }: { action: (state: FeatureFormState, formData: FormData) => Promise<FeatureFormState>; values?: Values; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  return <form action={formAction} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="name" className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Name</label><input id="name" name="name" required maxLength={100} defaultValue={values?.name} className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-sm outline-none focus:border-[#D6B56F]/50" /></div><div><label htmlFor="key" className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Key</label><input id="key" name="key" required maxLength={80} pattern="[a-z][a-z0-9_]+" defaultValue={values?.key} placeholder="example_feature" className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 font-mono text-sm outline-none focus:border-[#D6B56F]/50" /></div></div><div><label htmlFor="description" className="text-xs font-bold uppercase tracking-[.14em] text-[#AEB8BE]">Description</label><textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={values?.description ?? ""} className="mt-2 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 py-3 text-sm outline-none focus:border-[#D6B56F]/50" /></div>{state.error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}<button disabled={pending} className="min-h-12 rounded-xl bg-[#D6B56F] px-6 text-sm font-bold text-[#071727] hover:bg-[#F1DDA7] disabled:opacity-60">{pending ? "Menyimpan..." : submitLabel}</button></form>;
}
