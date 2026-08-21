import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../_components/dashboard-shell";
import { T } from "../../../_components/i18n-provider";
import { TranslatedFeatureName } from "../../../_components/plan-card";
import { requireUser } from "../../../lib/auth";
import { getActivePaymentMethods } from "../../../lib/payment-methods";
import { prisma } from "../../../lib/prisma";
import { createOrder } from "./actions";

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  await requireUser();
  const { planId } = await params;
  const [plan, methods] = await Promise.all([prisma.plan.findFirst({ where: { id: planId, active: true }, select: { id: true, name: true, price: true, features: { where: { feature: { active: true } }, select: { feature: { select: { key: true, name: true } } } } } }), getActivePaymentMethods()]);
  if (!plan) notFound();
  return <><DashboardHeader title={<T k="orders.checkout" />} description={<T k="orders.checkoutDescription" />} /><section className="mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]"><T k="orders.selectedPlan" /></p><h2 className="mt-3 text-2xl font-bold">{plan.name}</h2><p className="mt-3 text-3xl font-extrabold text-[#F1DDA7]">{money.format(plan.price)}</p><ul className="mt-5 space-y-2 text-sm text-[#AEB8BE]">{plan.features.map(({ feature }) => <li key={feature.key}>✓ <TranslatedFeatureName featureKey={feature.key} fallback={feature.name} /></li>)}</ul></article><form action={createOrder.bind(null, plan.id)} className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6"><h2 className="text-xl font-bold"><T k="orders.paymentMethod" /></h2><div className="mt-5 space-y-3">{methods.map((method) => <label key={method.id} className="flex gap-3 rounded-xl border border-[#F5F0E7]/10 p-4"><input type="radio" name="paymentMethodId" value={method.id} required className="accent-[#D6B56F]" /><span><strong>{method.name}</strong><span className="mt-1 block text-xs text-[#AEB8BE]">{method.type} · {method.mode}</span></span></label>)}</div><button disabled={!methods.length} className="mt-6 min-h-12 w-full rounded-xl bg-[#D6B56F] font-bold text-[#071727] disabled:opacity-50"><T k="orders.create" /></button></form></section></>;
}
