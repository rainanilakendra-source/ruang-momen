import Image from "next/image";
import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../_components/dashboard-shell";
import { T } from "../../../_components/i18n-provider";
import { OrderStatus } from "../../../_components/orders-table";
import { PaymentProofForm } from "../../../_components/payment-proof-form";
import { requireUser } from "../../../lib/auth";
import { ORDER_STATUSES } from "../../../lib/orders";
import { prisma } from "../../../lib/prisma";

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: user.id }, select: { id: true, orderNumber: true, amount: true, status: true, plan: { select: { name: true } }, paymentMethod: { select: { name: true, bankName: true, accountName: true, accountNumber: true, qrImageUrl: true, instructions: true } }, paymentProof: { select: { fileUrl: true, note: true } } } });
  if (!order) notFound();
  const uploadableStatuses: string[] = [ORDER_STATUSES.WAITING_PAYMENT, ORDER_STATUSES.WAITING_CONFIRMATION, ORDER_STATUSES.REJECTED];
  const canUpload = uploadableStatuses.includes(order.status);
  return <><DashboardHeader title={order.orderNumber} description={`${order.plan.name} · ${money.format(order.amount)}`} /><section className="mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6"><p className="text-xs uppercase text-[#AEB8BE]"><T k="orders.status" /></p><p className="mt-2 text-xl font-bold text-[#F1DDA7]"><OrderStatus status={order.status} /></p><h2 className="mt-7 text-lg font-bold"><T k="orders.paymentMethod" />: {order.paymentMethod.name}</h2><div className="mt-3 space-y-1 text-sm text-[#AEB8BE]">{order.paymentMethod.bankName && <p><T k="orders.bank" />: {order.paymentMethod.bankName}</p>}{order.paymentMethod.accountName && <p><T k="orders.accountName" />: {order.paymentMethod.accountName}</p>}{order.paymentMethod.accountNumber && <p><T k="orders.accountNumber" />: {order.paymentMethod.accountNumber}</p>}</div>{order.paymentMethod.qrImageUrl && <Image src={order.paymentMethod.qrImageUrl} alt="Payment QR" width={240} height={240} unoptimized className="mt-5 rounded-xl bg-white object-contain" />}<p className="mt-5 whitespace-pre-wrap text-sm">{order.paymentMethod.instructions}</p></article><article className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6"><h2 className="text-lg font-bold"><T k="orders.paymentProof" /></h2>{order.paymentProof && <div className="mt-4"><Image src={order.paymentProof.fileUrl} alt="Payment proof" width={480} height={320} unoptimized className="max-h-80 w-full rounded-xl object-contain" /><p className="mt-2 text-sm text-[#AEB8BE]">{order.paymentProof.note}</p></div>}{canUpload && <PaymentProofForm orderId={order.id} />}</article></section></>;
}
