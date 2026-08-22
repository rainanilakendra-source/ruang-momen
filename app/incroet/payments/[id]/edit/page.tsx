import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentMethodForm } from "../../../../_components/superadmin/payment-method-form";
import { requireRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ROLES } from "../../../../lib/roles";
import { updatePaymentMethod } from "../../actions";

export const metadata: Metadata = { title: "Edit Payment Method — Ruang Momen" };
export default async function EditPaymentMethodPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(ROLES.SUPER_ADMIN);
  const { id } = await params;
  const method = await prisma.paymentMethod.findUnique({ where: { id }, select: { id: true, name: true, type: true, mode: true, description: true, bankName: true, accountName: true, accountNumber: true, qrImageUrl: true, instructions: true } });
  if (!method) notFound();
  return <section className="mt-8"><Link href="/incroet/payments" className="text-sm font-semibold text-[#D6B56F]">← Back to Payments</Link><div className="mt-5 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Edit {method.name}</h2><div className="mt-7"><PaymentMethodForm action={updatePaymentMethod.bind(null, method.id)} values={method} submitLabel="Save Changes" /></div></div></section>;
}
