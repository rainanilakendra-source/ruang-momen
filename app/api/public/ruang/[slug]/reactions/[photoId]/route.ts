import { cookies } from "next/headers";
import { Prisma } from "../../../../../../generated/prisma/client";
import {
  createGuestReactionIdentifier,
  GUEST_REACTION_COOKIE,
  GUEST_REACTION_COOKIE_MAX_AGE,
  parseGuestReactionIdentifier,
} from "../../../../../../lib/guest-reaction";
import { prisma } from "../../../../../../lib/prisma";

const MAX_TRANSACTION_ATTEMPTS = 3;

function isRetryableTransactionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" || error.code === "P2034")
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string; photoId: string }> },
) {
  const { slug, photoId } = await params;
  if (!slug || slug.length > 120 || !photoId || photoId.length > 64) {
    return Response.json({ error: "Reaction tidak valid." }, { status: 400 });
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      event: { slug, guestGalleryEnabled: true },
    },
    select: { id: true, eventId: true },
  });
  if (!photo) {
    return Response.json({ error: "Momen tidak ditemukan." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const storedIdentifier = parseGuestReactionIdentifier(
    cookieStore.get(GUEST_REACTION_COOKIE)?.value,
  );
  const guestIdentifier =
    storedIdentifier ?? createGuestReactionIdentifier();

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const existing = await tx.photoReaction.findUnique({
            where: {
              photoId_guestIdentifier: { photoId, guestIdentifier },
            },
            select: { id: true },
          });

          let liked: boolean;
          if (existing) {
            await tx.photoReaction.delete({ where: { id: existing.id } });
            liked = false;
          } else {
            await tx.photoReaction.create({
              data: { photoId, eventId: photo.eventId, guestIdentifier },
              select: { id: true },
            });
            liked = true;
          }

          const count = await tx.photoReaction.count({ where: { photoId } });
          return { liked, count };
        },
        { isolationLevel: "Serializable" },
      );

      if (!storedIdentifier) {
        cookieStore.set(GUEST_REACTION_COOKIE, guestIdentifier, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: GUEST_REACTION_COOKIE_MAX_AGE,
        });
      }

      return Response.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (
        attempt < MAX_TRANSACTION_ATTEMPTS &&
        isRetryableTransactionError(error)
      ) {
        continue;
      }
      return Response.json(
        { error: "Reaction belum berhasil disimpan." },
        { status: 500 },
      );
    }
  }

  return Response.json(
    { error: "Reaction belum berhasil disimpan." },
    { status: 500 },
  );
}
