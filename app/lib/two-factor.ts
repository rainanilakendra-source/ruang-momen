import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import * as OTPAuth from "otpauth";
import { prisma } from "./prisma";
import { ROLES } from "./roles";

export const TWO_FACTOR_COOKIE = "ruang_momen_2fa_challenge";
export const TWO_FACTOR_TTL_SECONDS = 10 * 60;
export const TWO_FACTOR_MAX_ATTEMPTS = 6;
export const TWO_FACTOR_ISSUER = "Ruang Momen";
export const TWO_FACTOR_TYPES = { VERIFY: "VERIFY", ENROLL: "ENROLL" } as const;
export const TWO_FACTOR_PORTALS = { USER: "user", ADMIN: "admin", SUPER_ADMIN: "superadmin" } as const;
export type TwoFactorPortal = (typeof TWO_FACTOR_PORTALS)[keyof typeof TWO_FACTOR_PORTALS];
export type TwoFactorType = (typeof TWO_FACTOR_TYPES)[keyof typeof TWO_FACTOR_TYPES];

const destinations: Record<TwoFactorPortal, string> = { user: "/dashboard", admin: "/admin", superadmin: "/incroet" };
const failures: Record<TwoFactorPortal, string> = { user: "/masuk", admin: "/admin", superadmin: "/incroet" };
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function encryptionKey(): Buffer {
  const encoded = process.env.TWO_FACTOR_ENCRYPTION_KEY?.trim();
  if (!encoded) throw new Error("Two-factor encryption is not configured.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("Two-factor encryption key must be 32 bytes in base64.");
  return key;
}

export function encryptTwoFactorSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptTwoFactorSecret(payload: string): string {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Invalid encrypted two-factor secret.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

export function generateTotp(email: string, secret?: string) {
  return new OTPAuth.TOTP({ issuer: TWO_FACTOR_ISSUER, label: email, algorithm: "SHA1", digits: 6, period: 30, secret: secret ?? new OTPAuth.Secret({ size: 20 }) });
}

export function verifyTotp(secret: string, token: string): boolean {
  if (!/^\d{6}$/u.test(token)) return false;
  return generateTotp("account", secret).validate({ token, window: 1 }) !== null;
}

export function normalizeRecoveryCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z2-9]/gu, "");
}

export function hashRecoveryCode(value: string): string {
  return createHash("sha256").update(normalizeRecoveryCode(value)).digest("hex");
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    let raw = "";
    while (raw.length < 12) raw += RECOVERY_ALPHABET[randomBytes(1)[0]! % RECOVERY_ALPHABET.length];
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
  });
}

export function parseTwoFactorPortal(value: string): TwoFactorPortal | null {
  return Object.values(TWO_FACTOR_PORTALS).find((portal) => portal === value) ?? null;
}

export function twoFactorDestination(portal: TwoFactorPortal) { return destinations[portal]; }
export function twoFactorFailure(portal: TwoFactorPortal) { return failures[portal]; }

export async function createTwoFactorChallenge(userId: string, portal: TwoFactorPortal, type: TwoFactorType, secretEncrypted?: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TWO_FACTOR_TTL_SECONDS * 1000);
  await prisma.$transaction([
    prisma.twoFactorChallenge.deleteMany({ where: { OR: [{ expiresAt: { lte: new Date() } }, { userId }] } }),
    prisma.twoFactorChallenge.create({ data: { tokenHash: createHash("sha256").update(token).digest("hex"), userId, portal, type, secretEncrypted, expiresAt }, select: { id: true } }),
  ]);
  (await cookies()).set(TWO_FACTOR_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt, maxAge: TWO_FACTOR_TTL_SECONDS });
}

export async function createEnrollmentChallenge(userId: string, email: string, portal: TwoFactorPortal) {
  const totp = generateTotp(email);
  await createTwoFactorChallenge(userId, portal, TWO_FACTOR_TYPES.ENROLL, encryptTwoFactorSecret(totp.secret.base32));
}

export async function prepareSecondFactor(user: { id: string; email: string; role: string; twoFactorEnabled: boolean }, portal: TwoFactorPortal): Promise<"/verifikasi-2fa" | "/setup-2fa" | null> {
  if (user.twoFactorEnabled) {
    await createTwoFactorChallenge(user.id, portal, TWO_FACTOR_TYPES.VERIFY);
    return "/verifikasi-2fa";
  }
  if (user.role === ROLES.SUPER_ADMIN) {
    await createEnrollmentChallenge(user.id, user.email, portal);
    return "/setup-2fa";
  }
  return null;
}

export async function getTwoFactorChallenge() {
  const token = (await cookies()).get(TWO_FACTOR_COOKIE)?.value;
  if (!token) return null;
  return prisma.twoFactorChallenge.findUnique({
    where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    select: { id: true, userId: true, portal: true, type: true, secretEncrypted: true, attempts: true, expiresAt: true, user: { select: { id: true, email: true, role: true, twoFactorEnabled: true, twoFactorSecretEncrypted: true } } },
  });
}

export async function clearTwoFactorChallenge(id?: string) {
  if (id) await prisma.twoFactorChallenge.deleteMany({ where: { id } });
  (await cookies()).delete(TWO_FACTOR_COOKIE);
}

export async function recordFailedTwoFactorAttempt(id: string, attempts: number) {
  if (attempts + 1 >= TWO_FACTOR_MAX_ATTEMPTS) {
    await clearTwoFactorChallenge(id);
    return false;
  }
  await prisma.twoFactorChallenge.updateMany({ where: { id }, data: { attempts: { increment: 1 } } });
  return true;
}
