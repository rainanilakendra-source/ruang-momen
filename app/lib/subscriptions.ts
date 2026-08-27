import { prisma } from "./prisma";

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export async function getActiveSubscription(userId: string) {
  const now = new Date();
  await prisma.subscription.updateMany({
    where: { userId, status: SUBSCRIPTION_STATUSES.ACTIVE, expiredAt: { lte: now } },
    data: { status: SUBSCRIPTION_STATUSES.EXPIRED },
  });
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startedAt: { lte: now },
      expiredAt: { gt: now },
      plan: { active: true },
    },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      status: true,
      startedAt: true,
      expiredAt: true,
      plan: { select: { id: true, name: true, slug: true, maxGuests: true, maxPhotos: true, storageLimitMb: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });
}
