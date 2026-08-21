import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { prisma } from "./prisma";
import { hasRole, rolesForProtectedPath, type Role } from "./roles";

const SESSION_COOKIE_NAME = "ruang_momen_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt },
    select: { id: true },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk");
  }

  return user;
}

export const requireAuth = requireUser;

export async function requireRole(role: Role | readonly Role[]) {
  const user = await requireAuth();

  if (!hasRole(user, role)) {
    forbidden();
  }

  return user;
}

export async function requireProtectedPath(pathname: string) {
  const roles = rolesForProtectedPath(pathname);
  return roles ? requireRole(roles) : requireAuth();
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
