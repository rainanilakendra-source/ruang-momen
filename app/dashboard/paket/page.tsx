import type { Metadata } from "next";
import { T } from "../../_components/i18n-provider";
import { PlanCard } from "../../_components/plan-card";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { comparePlanDisplayOrder } from "../../lib/plan-order";

export const metadata: Metadata = { title: "Paket & Upgrade — Ruang Momen" };

export default async function PlansStorePage() {
  await requireUser();
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: [{ price: "asc" }, { name: "asc" }],
    select: {
      id: true, code: true, name: true, slug: true, description: true, price: true, maxGuests: true, maxPhotos: true, storageLimitMb: true, durationDays: true,
      features: { where: { feature: { active: true } }, orderBy: { feature: { name: "asc" } }, select: { feature: { select: { id: true, key: true, name: true } } } },
    },
  });
  const orderedPlans = plans.sort(comparePlanDisplayOrder);

  return <><DashboardHeader title={<T k="plans.title" />} description={<T k="plans.description" />} />{orderedPlans.length ? <section className="mt-7 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">{orderedPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</section> : <p className="mt-8 rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-10 text-center text-[#AEB8BE]"><T k="plans.empty" /></p>}</>;
}
