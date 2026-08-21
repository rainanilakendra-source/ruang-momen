import { DashboardHeader } from "../../_components/dashboard-shell";
import { T } from "../../_components/i18n-provider";
import { OrdersTable } from "../../_components/orders-table";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, amount: true, status: true, createdAt: true, plan: { select: { name: true } } } });
  return <><DashboardHeader title={<T k="orders.title" />} description={<T k="orders.description" />} /><OrdersTable orders={orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, amount: order.amount, status: order.status, createdAt: order.createdAt.toISOString(), planName: order.plan.name }))} /></>;
}
