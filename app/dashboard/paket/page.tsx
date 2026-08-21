import type { Metadata } from "next";
import { T } from "../../_components/i18n-provider";
import { PlanCard } from "../../_components/plan-card";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = { title: "Paket & Upgrade — Ruang Momen" };

export default async function PlansStorePage() {
  await requireUser();
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: [{ price: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, slug: true, description: true, price: true, maxGuests: true, maxPhotos: true, storageLimitMb: true, durationDays: true,
      features: { where: { feature: { active: true } }, orderBy: { feature: { name: "asc" } }, select: { feature: { select: { id: true, name: true, description: true } } } },
    },
  });

  return <><DashboardHeader title={<T k="plans.title" />} description={<T k="plans.description" />} />{plans.length ? <section className="mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</section> : <p className="mt-8 rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-10 text-center text-[#AEB8BE]"><T k="plans.empty" /></p>}</>;
}
