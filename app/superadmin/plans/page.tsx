import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ROLES } from "../../lib/roles";
import { togglePlanStatus, updatePlanFeatures } from "./actions";

export const metadata: Metadata = { title: "Plans — Super Admin Ruang Momen" };
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function PlansPage() {
  await requireRole(ROLES.SUPER_ADMIN);
  const [plans, features] = await Promise.all([
    prisma.plan.findMany({ orderBy: [{ price: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, price: true, maxGuests: true, maxPhotos: true, storageLimitMb: true, durationDays: true, active: true, features: { select: { featureId: true } } } }),
    prisma.feature.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, key: true, active: true } }),
  ]);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Plan Manager</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.035em]">Subscription Plans</h2><p className="mt-2 text-sm text-[#AEB8BE]">Kelola harga, kapasitas, durasi, dan status plan.</p></div><Link href="/superadmin/plans/new" className="inline-flex min-h-12 items-center rounded-xl bg-[#D6B56F] px-5 text-sm font-bold text-[#071727] transition hover:bg-[#F1DDA7]">Add Plan</Link></div>
      <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30]">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[#F5F0E7]/[.08] text-xs uppercase tracking-[.12em] text-[#AEB8BE]"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Guest Limit</th><th className="px-5 py-4">Photo Limit</th><th className="px-5 py-4">Storage</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#F5F0E7]/[.07]">{plans.map((plan) => <tr key={plan.id}><td className="px-5 py-4"><p className="font-bold">{plan.name}</p><p className="mt-1 text-xs text-[#AEB8BE]">{plan.slug} · {plan.durationDays} days</p></td><td className="px-5 py-4 font-semibold text-[#F1DDA7]">{currency.format(plan.price)}</td><td className="px-5 py-4">{plan.maxGuests.toLocaleString("id-ID")}</td><td className="px-5 py-4">{plan.maxPhotos.toLocaleString("id-ID")}</td><td className="px-5 py-4">{plan.storageLimitMb.toLocaleString("id-ID")} MB</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${plan.active ? "bg-emerald-400/10 text-emerald-300" : "bg-[#F5F0E7]/[.06] text-[#AEB8BE]"}`}>{plan.active ? "Active" : "Inactive"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/superadmin/plans/${plan.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-[#D6B56F]/20 px-3 font-semibold text-[#F1DDA7] hover:bg-[#D6B56F]/10">Edit</Link><form action={togglePlanStatus.bind(null, plan.id)}><button type="submit" className="min-h-10 rounded-lg border border-[#F5F0E7]/10 px-3 font-semibold text-[#AEB8BE] hover:text-[#F5F0E7]">{plan.active ? "Deactivate" : "Activate"}</button></form></div></td></tr>)}</tbody>
        </table>
        {!plans.length && <p className="px-6 py-12 text-center text-sm text-[#AEB8BE]">Belum ada plan.</p>}
      </div>
      <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Feature Assignment</p><h2 className="mt-2 text-xl font-bold">Features per plan</h2><div className="mt-5 grid gap-4 xl:grid-cols-2">{plans.map((plan) => { const assigned = new Set(plan.features.map(({ featureId }) => featureId)); return <form key={plan.id} action={updatePlanFeatures.bind(null, plan.id)} className="rounded-[1.35rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5"><div className="flex items-center justify-between gap-4"><div><h3 className="font-bold">{plan.name}</h3><p className="mt-1 text-xs text-[#AEB8BE]">{assigned.size} features assigned</p></div><button className="min-h-10 rounded-lg bg-[#D6B56F] px-4 text-xs font-bold text-[#071727]">Save Features</button></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{features.map((feature) => <label key={feature.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${feature.active ? "border-[#F5F0E7]/10" : "border-[#F5F0E7]/[.05] opacity-55"}`}><input type="checkbox" name="featureId" value={feature.id} defaultChecked={assigned.has(feature.id)} className="mt-0.5 h-4 w-4 accent-[#D6B56F]" /><span><span className="block font-semibold">{feature.name}</span><span className="mt-0.5 block font-mono text-[10px] text-[#AEB8BE]">{feature.key}{feature.active ? "" : " · inactive"}</span></span></label>)}</div></form>; })}</div></div>
    </section>
  );
}
