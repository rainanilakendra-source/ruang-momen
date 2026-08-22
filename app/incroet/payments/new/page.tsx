import type { Metadata } from "next";
import Link from "next/link";
import { PaymentMethodForm } from "../../../_components/superadmin/payment-method-form";
import { requireRole } from "../../../lib/auth";
import { ROLES } from "../../../lib/roles";
import { createPaymentMethod } from "../actions";

export const metadata: Metadata = { title: "Create Payment Method — Ruang Momen" };
export default async function NewPaymentMethodPage() {
  await requireRole(ROLES.SUPER_ADMIN);
  return <section className="mt-8"><Link href="/incroet/payments" className="text-sm font-semibold text-[#D6B56F]">← Back to Payments</Link><div className="mt-5 rounded-[1.5rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Create Payment Method</h2><p className="mt-2 text-sm text-[#AEB8BE]">Tambahkan instruksi pembayaran manual baru.</p><div className="mt-7"><PaymentMethodForm action={createPaymentMethod} submitLabel="Create Method" /></div></div></section>;
}
