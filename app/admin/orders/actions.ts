"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "../../lib/auth";
import { ORDER_STATUSES } from "../../lib/orders";
import { prisma } from "../../lib/prisma";
import { ADMIN_ROLES } from "../../lib/roles";
import { SUBSCRIPTION_STATUSES } from "../../lib/subscriptions";

export async function approveOrder(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: { id: true, userId: true, planId: true, status: true, plan: { select: { durationDays: true } }, subscription: { select: { id: true } } },
    });
    if (!order || order.subscription || ![ORDER_STATUSES.WAITING_CONFIRMATION, ORDER_STATUSES.PAID].includes(order.status as typeof ORDER_STATUSES.PAID)) return;

    const paid = order.status === ORDER_STATUSES.PAID ? { count: 1 } : await tx.order.updateMany({
      where: { id, status: ORDER_STATUSES.WAITING_CONFIRMATION },
      data: { status: ORDER_STATUSES.PAID },
    });
    if (paid.count !== 1) return;

    const startedAt = new Date();
    const expiredAt = new Date(startedAt.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);
    await tx.subscription.updateMany({
      where: { userId: order.userId, status: SUBSCRIPTION_STATUSES.ACTIVE, orderId: { not: order.id } },
      data: { status: SUBSCRIPTION_STATUSES.CANCELLED },
    });
    await tx.subscription.upsert({
      where: { orderId: order.id },
      update: {},
      create: { userId: order.userId, planId: order.planId, orderId: order.id, status: SUBSCRIPTION_STATUSES.ACTIVE, startedAt, expiredAt },
    });
  });
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/langganan");
}

export async function rejectOrder(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.order.updateMany({ where: { id, status: ORDER_STATUSES.WAITING_CONFIRMATION }, data: { status: ORDER_STATUSES.REJECTED } });
  revalidatePath("/admin/orders");
}
