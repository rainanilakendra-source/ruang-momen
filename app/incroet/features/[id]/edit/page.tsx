import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeatureForm } from "../../../../_components/superadmin/feature-form";
import { requireRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ROLES } from "../../../../lib/roles";
import { updateFeature } from "../../actions";

export const metadata: Metadata = { title: "Edit Feature — Super Admin Ruang Momen" };
export default async function EditFeaturePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(ROLES.SUPER_ADMIN);
  const { id } = await params;
  const feature = await prisma.feature.findUnique({ where: { id }, select: { id: true, name: true, key: true, description: true } });
  if (!feature) notFound();
  return <section className="mt-8"><Link href="/incroet/features" className="text-sm font-semibold text-[#D6B56F]">← Back to Features</Link><div className="mt-5 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Edit {feature.name}</h2><div className="mt-7"><FeatureForm action={updateFeature.bind(null, feature.id)} values={feature} submitLabel="Save Changes" /></div></div></section>;
}
