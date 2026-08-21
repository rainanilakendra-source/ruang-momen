import type { Metadata } from "next";
import Link from "next/link";
import { PlanForm } from "../../../_components/superadmin/plan-form";
import { requireRole } from "../../../lib/auth";
import { ROLES } from "../../../lib/roles";
import { createPlan } from "../actions";

export const metadata: Metadata = { title: "Add Plan — Super Admin Ruang Momen" };

export default async function NewPlanPage() {
  await requireRole(ROLES.SUPER_ADMIN);
  return <section className="mt-8"><Link href="/superadmin/plans" className="text-sm font-semibold text-[#D6B56F]">← Back to Plans</Link><div className="mt-5 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Add Plan</h2><p className="mt-2 text-sm text-[#AEB8BE]">Buat plan baru dengan batas kapasitasnya.</p><div className="mt-7"><PlanForm action={createPlan} submitLabel="Create Plan" /></div></div></section>;
}
