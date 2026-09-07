import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

type ActivityRow = { bucket: Date; count: number };
type CountRow = { count: number };

export async function getEventAnalytics(eventId: string, ownerId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerId },
    select: { id: true, name: true, eventDate: true },
  });
  if (!event) return null;

  const [photoAggregate, contributorCount, reactionCount, guestbookCount, activity, sources, topPhotos, recentMessages] = await Promise.all([
    prisma.photo.aggregate({ where: { eventId }, _count: { _all: true }, _sum: { sizeBytes: true } }),
    prisma.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(DISTINCT NULLIF(BTRIM("guest_name"), ''))::int AS count
      FROM "photos"
      WHERE "event_id" = ${eventId}
    `),
    prisma.photoReaction.count({ where: { eventId } }),
    prisma.guestbookEntry.count({ where: { eventId } }),
    prisma.$queryRaw<ActivityRow[]>(Prisma.sql`
      SELECT date_trunc('day', "created_at") AS bucket, COUNT(*)::int AS count
      FROM "photos"
      WHERE "event_id" = ${eventId}
      GROUP BY date_trunc('day', "created_at")
      ORDER BY bucket ASC
    `),
    prisma.photo.groupBy({ by: ["source"], where: { eventId }, _count: { _all: true }, orderBy: { _count: { source: "desc" } } }),
    prisma.photo.findMany({
      where: { eventId, reactions: { some: {} } },
      orderBy: [{ reactions: { _count: "desc" } }, { createdAt: "desc" }],
      take: 5,
      select: { id: true, guestName: true, createdAt: true, _count: { select: { reactions: true } } },
    }),
    prisma.guestbookEntry.findMany({ where: { eventId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, guestName: true, message: true, createdAt: true } }),
  ]);

  return {
    event: { name: event.name, eventDate: event.eventDate.toISOString() },
    metrics: {
      moments: photoAggregate._count._all,
      storageBytes: photoAggregate._sum.sizeBytes ?? 0,
      contributors: Number(contributorCount[0]?.count ?? 0),
      reactions: reactionCount,
      guestbook: guestbookCount,
    },
    activity: activity.map((row) => ({ bucket: row.bucket.toISOString(), count: Number(row.count) })),
    sources: sources.map((source) => ({ source: source.source, count: source._count._all })),
    topPhotos: topPhotos.map((photo) => ({ id: photo.id, guestName: photo.guestName, createdAt: photo.createdAt.toISOString(), reactionCount: photo._count.reactions })),
    recentMessages: recentMessages.map((entry) => ({ ...entry, createdAt: entry.createdAt.toISOString() })),
  };
}
