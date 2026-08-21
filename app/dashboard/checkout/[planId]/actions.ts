"use server";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { ORDER_STATUSES } from "../../../lib/orders";
import { prisma } from "../../../lib/prisma";

export async function createOrder(planId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const paymentMethodId = formData.get("paymentMethodId");
  if (typeof paymentMethodId !== "string") return;
  const [plan, paymentMethod] = await Promise.all([
    prisma.plan.findFirst({ where: { id: planId, active: true }, select: { id: true, price: true } }),
    prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, active: true, mode: "STATIC" }, select: { id: true } }),
  ]);
  if (!plan || !paymentMethod) return;
  const orderNumber = `RM-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const order = await prisma.order.create({ data: { orderNumber, userId: user.id, planId: plan.id, amount: plan.price, paymentMethodId: paymentMethod.id, status: ORDER_STATUSES.WAITING_PAYMENT }, select: { id: true } });
  redirect(`/dashboard/orders/${order.id}`);
}
