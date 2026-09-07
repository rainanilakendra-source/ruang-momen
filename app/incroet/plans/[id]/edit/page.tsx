import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanForm } from "../../../../_components/superadmin/plan-form";
import { requireRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ROLES } from "../../../../lib/roles";
import { updatePlan } from "../../actions";

export const metadata: Metadata = { title: "Edit Plan — Super Admin Ruang Momen" };

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(ROLES.SUPER_ADMIN);
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id }, select: { id: true, name: true, description: true, price: true, maxGuests: true, maxPhotos: true, storageLimitMb: true, durationDays: true, limit: { select: { maxPhotos: true, maxStorageBytes: true, maxActiveDays: true } } } });
  if (!plan) notFound();
  const values = { ...plan, maxPhotos: plan.limit?.maxPhotos ?? plan.maxPhotos, storageLimitMb: plan.limit ? Number(plan.limit.maxStorageBytes / BigInt(1024 * 1024)) : plan.storageLimitMb, durationDays: plan.limit?.maxActiveDays ?? plan.durationDays };
  return <section className="mt-8"><Link href="/incroet/plans" className="text-sm font-semibold text-[#D6B56F]">← Back to Plans</Link><div className="mt-5 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Edit {plan.name}</h2><p className="mt-2 text-sm text-[#AEB8BE]">Perbarui detail dan limit plan.</p><div className="mt-7"><PlanForm action={updatePlan.bind(null, plan.id)} values={values} submitLabel="Save Changes" /></div></div></section>;
}
