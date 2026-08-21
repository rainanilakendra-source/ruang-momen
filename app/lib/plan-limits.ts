import type { Prisma } from "../generated/prisma/client";
import { DEFAULT_LANGUAGE, translate, type Language } from "./i18n";
import { prisma } from "./prisma";
import { SUBSCRIPTION_STATUSES } from "./subscriptions";

export const PLAN_LIMIT_TYPES = { GUEST: "GUEST", PHOTO: "PHOTO", STORAGE: "STORAGE" } as const;
export type PlanLimitType = (typeof PLAN_LIMIT_TYPES)[keyof typeof PLAN_LIMIT_TYPES];
type DbClient = typeof prisma | Prisma.TransactionClient;
type LimitOptions = { additional?: number; guestName?: string | null; language?: Language; client?: DbClient };
export type PlanLimitResult = { allowed: boolean; current: number; limit: number; message: string };

const messageKeys: Record<PlanLimitType, string> = {
  GUEST: "planLimits.guestReached",
  PHOTO: "planLimits.photoReached",
  STORAGE: "planLimits.storageReached",
};

export async function getUserActivePlan(userId: string, client: DbClient = prisma) {
  const now = new Date();
  return client.subscription.findFirst({
    where: { userId, status: SUBSCRIPTION_STATUSES.ACTIVE, startedAt: { lte: now }, expiredAt: { gt: now } },
    orderBy: { startedAt: "desc" },
    select: { id: true, startedAt: true, expiredAt: true, plan: { select: { id: true, name: true, slug: true, maxGuests: true, maxPhotos: true, storageLimitMb: true } } },
  });
}

async function distinctGuestNames(userId: string, client: DbClient) {
  const rows = await client.photo.findMany({ where: { event: { ownerId: userId }, guestName: { not: null } }, distinct: ["guestName"], select: { guestName: true } });
  return rows.flatMap(({ guestName }) => guestName ? [guestName] : []);
}

export async function getPlanUsage(userId: string, client: DbClient = prisma) {
  const [subscription, guestNames, photos] = await Promise.all([
    getUserActivePlan(userId, client),
    distinctGuestNames(userId, client),
    client.photo.aggregate({ where: { event: { ownerId: userId } }, _count: { _all: true }, _sum: { sizeBytes: true } }),
  ]);
  return {
    subscription,
    usage: { guests: guestNames.length, photos: photos._count._all, storageBytes: photos._sum.sizeBytes ?? 0 },
  };
}

export async function checkPlanLimit(userId: string, limitType: PlanLimitType, options: LimitOptions = {}): Promise<PlanLimitResult> {
  const client = options.client ?? prisma;
  const language = options.language ?? DEFAULT_LANGUAGE;
  const subscription = await getUserActivePlan(userId, client);
  if (!subscription) return { allowed: false, current: 0, limit: 0, message: translate(language, "planLimits.noActivePlan") };

  let current = 0;
  let limit = 0;
  let additional = Math.max(0, options.additional ?? 1);
  if (limitType === PLAN_LIMIT_TYPES.GUEST) {
    const names = await distinctGuestNames(userId, client);
    current = names.length;
    limit = subscription.plan.maxGuests;
    if (options.guestName && names.some((name) => name.localeCompare(options.guestName!, undefined, { sensitivity: "accent" }) === 0)) additional = 0;
    if (!options.guestName) additional = 0;
  } else if (limitType === PLAN_LIMIT_TYPES.PHOTO) {
    current = await client.photo.count({ where: { event: { ownerId: userId } } });
    limit = subscription.plan.maxPhotos;
  } else {
    const result = await client.photo.aggregate({ where: { event: { ownerId: userId } }, _sum: { sizeBytes: true } });
    current = result._sum.sizeBytes ?? 0;
    limit = subscription.plan.storageLimitMb * 1024 * 1024;
  }

  const allowed = current + additional <= limit;
  return { allowed, current, limit, message: allowed ? "" : translate(language, messageKeys[limitType]) };
}

export class PlanLimitExceededError extends Error {
  constructor(readonly result: PlanLimitResult) { super(result.message); this.name = "PlanLimitExceededError"; }
}
