import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { T } from "../../../_components/i18n-provider";
import { PlanCard } from "../../../_components/plan-card";
import { DashboardHeader } from "../../../_components/dashboard-shell";
import { requireUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const metadata: Metadata = { title: "Detail Paket — Ruang Momen" };

export default async function PlanDetailPage({ params }: PageProps<"/dashboard/paket/[slug]">) {
  await requireUser();
  const { slug } = await params;
  const plan = await prisma.plan.findFirst({
    where: { slug, active: true },
    select: {
      id: true, name: true, slug: true, description: true, price: true, maxGuests: true, maxPhotos: true, storageLimitMb: true, durationDays: true,
      features: { where: { feature: { active: true } }, orderBy: { feature: { name: "asc" } }, select: { feature: { select: { id: true, name: true, description: true } } } },
    },
  });
  if (!plan) notFound();

  return <><DashboardHeader title={plan.name} description={<T k="plans.detailDescription" />} /><div className="mt-7"><Link href="/dashboard/paket" className="inline-flex items-center gap-2 text-sm font-bold text-[#D6B56F] transition hover:text-[#F1DDA7]">← <T k="plans.back" /></Link></div><section className="mx-auto mt-5 max-w-4xl"><PlanCard plan={plan} detail /></section></>;
}
