"use client";

import Link from "next/link";
import { useI18n } from "./i18n-provider";

type OrderRow = { id: string; orderNumber: string; amount: number; status: string; createdAt: string; planName: string };

function statusLabel(status: string, t: (key: string) => string) {
  const key = `orders.statuses.${status.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

export function OrderStatus({ status }: { status: string }) {
  const { t } = useI18n();
  return <>{statusLabel(status, t)}</>;
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const { language, t } = useI18n();
  const locale = language === "id" ? "id-ID" : "en-US";
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat(locale);
  return <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30]"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[#F5F0E7]/10 text-[#AEB8BE]"><tr><th className="p-4">{t("orders.order")}</th><th className="p-4">{t("orders.plan")}</th><th className="p-4">{t("orders.amount")}</th><th className="p-4">{t("orders.status")}</th><th className="p-4">{t("orders.created")}</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[#F5F0E7]/[.06]"><td className="p-4"><Link href={`/dashboard/orders/${order.id}`} className="font-bold text-[#F1DDA7]">{order.orderNumber}</Link></td><td className="p-4">{order.planName}</td><td className="p-4">{money.format(order.amount)}</td><td className="p-4">{statusLabel(order.status, t)}</td><td className="p-4">{date.format(new Date(order.createdAt))}</td></tr>)}</tbody></table>{!orders.length && <p className="p-10 text-center text-[#AEB8BE]">{t("orders.empty")}</p>}</div>;
}
