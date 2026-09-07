"use server";

import { Prisma } from "../../generated/prisma/client";
import { requireUser } from "../../lib/auth";
import { hashPassword, verifyPassword } from "../../lib/password";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { ROLES } from "../../lib/roles";
import { createEnrollmentChallenge, decryptTwoFactorSecret, generateRecoveryCodes, hashRecoveryCode, TWO_FACTOR_PORTALS, verifyTotp } from "../../lib/two-factor";
import { headers } from "next/headers";
import { consumeRateLimit, requestRateLimitKey } from "../../lib/rate-limit";

export type AccountActionState = { status: "idle" | "success" | "error"; messageKey: string | null };
export type TwoFactorAccountState = AccountActionState & { recoveryCodes: string[] | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const valueFrom = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};
const length = (value: string) => Array.from(value).length;

export async function updateProfile(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const name = valueFrom(formData, "name").trim();
  const email = valueFrom(formData, "email").trim().toLowerCase();

  if (length(name) < 2 || length(name) > 80) return { status: "error", messageKey: "account.errors.name" };
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return { status: "error", messageKey: "account.errors.email" };

  const duplicate = await prisma.user.findFirst({ where: { email, id: { not: user.id } }, select: { id: true } });
  if (duplicate) return { status: "error", messageKey: "account.errors.emailUsed" };

  try {
    await prisma.user.update({ where: { id: user.id }, data: { name, email }, select: { id: true } });
    return { status: "success", messageKey: "account.profileSaved" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { status: "error", messageKey: "account.errors.emailUsed" };
    return { status: "error", messageKey: "account.errors.generic" };
  }
}

export async function changePassword(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const rateLimit = consumeRateLimit(requestRateLimitKey("change-password", await headers(), user.id), 10, 15 * 60 * 1000);
  if (!rateLimit.allowed) return { status: "error", messageKey: "account.errors.currentPassword" };
  const currentPassword = valueFrom(formData, "currentPassword");
  const newPassword = valueFrom(formData, "newPassword");
  const confirmation = valueFrom(formData, "passwordConfirmation");

  if (length(newPassword) < 10 || length(newPassword) > 128) return { status: "error", messageKey: "account.errors.passwordLength" };
  if (newPassword !== confirmation) return { status: "error", messageKey: "account.errors.passwordMismatch" };

  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!account?.passwordHash || !(await verifyPassword(currentPassword, account.passwordHash))) return { status: "error", messageKey: "account.errors.currentPassword" };

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) }, select: { id: true } });
  return { status: "success", messageKey: "account.passwordChanged" };
}

export async function beginTwoFactorSetup(): Promise<void> {
  const user = await requireUser();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, role: true, twoFactorEnabled: true } });
  if (!account || account.twoFactorEnabled) return;
  const portal = account.role === ROLES.SUPER_ADMIN ? TWO_FACTOR_PORTALS.SUPER_ADMIN : account.role === ROLES.ADMIN ? TWO_FACTOR_PORTALS.ADMIN : TWO_FACTOR_PORTALS.USER;
  await createEnrollmentChallenge(user.id, account.email, portal);
  redirect("/setup-2fa");
}

export async function regenerateRecoveryCodes(_state: TwoFactorAccountState, formData: FormData): Promise<TwoFactorAccountState> {
  const user = await requireUser();
  const rateLimit = consumeRateLimit(requestRateLimitKey("recovery-codes", await headers(), user.id), 12, 10 * 60 * 1000);
  if (!rateLimit.allowed) return { status: "error", messageKey: "twoFactor.errors.tooManyAttempts", recoveryCodes: null };
  const code = valueFrom(formData, "totpCode").trim();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true, twoFactorSecretEncrypted: true } });
  let valid = false;
  try { valid = Boolean(account?.twoFactorEnabled && account.twoFactorSecretEncrypted && verifyTotp(decryptTwoFactorSecret(account.twoFactorSecretEncrypted), code)); } catch { valid = false; }
  if (!valid) return { status: "error", messageKey: "twoFactor.errors.invalidCode", recoveryCodes: null };
  const recoveryCodes = generateRecoveryCodes();
  await prisma.$transaction([
    prisma.twoFactorRecoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.twoFactorRecoveryCode.createMany({ data: recoveryCodes.map((recoveryCode) => ({ userId: user.id, codeHash: hashRecoveryCode(recoveryCode) })) }),
  ]);
  return { status: "success", messageKey: "twoFactor.regenerated", recoveryCodes };
}

export async function disableTwoFactor(_state: TwoFactorAccountState, formData: FormData): Promise<TwoFactorAccountState> {
  const user = await requireUser();
  const rateLimit = consumeRateLimit(requestRateLimitKey("disable-two-factor", await headers(), user.id), 12, 10 * 60 * 1000);
  if (!rateLimit.allowed) return { status: "error", messageKey: "twoFactor.errors.tooManyAttempts", recoveryCodes: null };
  const code = valueFrom(formData, "totpCode").trim();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, twoFactorEnabled: true, twoFactorSecretEncrypted: true } });
  if (!account || account.role === ROLES.SUPER_ADMIN) return { status: "error", messageKey: "twoFactor.requiredSuperAdmin", recoveryCodes: null };
  let valid = false;
  try { valid = Boolean(account.twoFactorEnabled && account.twoFactorSecretEncrypted && verifyTotp(decryptTwoFactorSecret(account.twoFactorSecretEncrypted), code)); } catch { valid = false; }
  if (!valid) return { status: "error", messageKey: "twoFactor.errors.invalidCode", recoveryCodes: null };
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecretEncrypted: null }, select: { id: true } }),
    prisma.twoFactorRecoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.twoFactorChallenge.deleteMany({ where: { userId: user.id } }),
  ]);
  return { status: "success", messageKey: "twoFactor.disabled", recoveryCodes: null };
}
