import type { Metadata } from "next";
import Link from "next/link";
import { FeatureForm } from "../../_components/superadmin/feature-form";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ROLES } from "../../lib/roles";
import { createFeature, toggleFeatureStatus } from "./actions";

export const metadata: Metadata = { title: "Features — Super Admin Ruang Momen" };

export default async function FeaturesPage() {
  await requireRole(ROLES.SUPER_ADMIN);
  const features = await prisma.feature.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, key: true, description: true, active: true, _count: { select: { plans: true } } } });
  return <section className="mt-8"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Feature Manager</p><h2 className="mt-2 text-2xl font-extrabold">Dynamic Features</h2><p className="mt-2 text-sm text-[#AEB8BE]">Feature tersedia sebagai data dan dapat dipasang ke plan mana pun.</p></div><div className="mt-6 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h3 className="text-lg font-bold">Create Feature</h3><div className="mt-5"><FeatureForm action={createFeature} submitLabel="Create Feature" /></div></div><div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30]"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-[#F5F0E7]/[.08] text-xs uppercase tracking-[.12em] text-[#AEB8BE]"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Key</th><th className="px-5 py-4">Description</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#F5F0E7]/[.07]">{features.map((feature) => <tr key={feature.id}><td className="px-5 py-4"><p className="font-bold">{feature.name}</p><p className="mt-1 text-xs text-[#AEB8BE]">{feature._count.plans} plans</p></td><td className="px-5 py-4 font-mono text-xs text-[#F1DDA7]">{feature.key}</td><td className="max-w-sm px-5 py-4 text-[#AEB8BE]">{feature.description ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${feature.active ? "bg-emerald-400/10 text-emerald-300" : "bg-[#F5F0E7]/[.06] text-[#AEB8BE]"}`}>{feature.active ? "Active" : "Inactive"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/superadmin/features/${feature.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-[#D6B56F]/20 px-3 font-semibold text-[#F1DDA7]">Edit</Link><form action={toggleFeatureStatus.bind(null, feature.id)}><button className="min-h-10 rounded-lg border border-[#F5F0E7]/10 px-3 font-semibold text-[#AEB8BE]">{feature.active ? "Deactivate" : "Activate"}</button></form></div></td></tr>)}</tbody></table></div></section>;
}
