"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "../../lib/auth";
import { ORDER_STATUSES } from "../../lib/orders";
import { prisma } from "../../lib/prisma";
import { ADMIN_ROLES } from "../../lib/roles";
async function setDecision(id: string, status: string) { await requireRole(ADMIN_ROLES); await prisma.order.updateMany({ where: { id, status: ORDER_STATUSES.WAITING_CONFIRMATION }, data: { status } }); revalidatePath("/admin/orders"); }
export async function approveOrder(id: string) { await setDecision(id, ORDER_STATUSES.PAID); /* Subscription activation intentionally deferred. */ }
export async function rejectOrder(id: string) { await setDecision(id, ORDER_STATUSES.REJECTED); }
