"use server";

import { getCurrentUser, createSession } from "../lib/auth";
import { prisma } from "../lib/prisma";
import {
  clearTwoFactorChallenge,
  decryptTwoFactorSecret,
  generateRecoveryCodes,
  getTwoFactorChallenge,
  hashRecoveryCode,
  parseTwoFactorPortal,
  recordFailedTwoFactorAttempt,
  TWO_FACTOR_TYPES,
  twoFactorDestination,
  verifyTotp,
} from "../lib/two-factor";

export type SetupTwoFactorState = { errorKey: string | null; recoveryCodes: string[] | null; destination: string | null };

export async function confirmTwoFactorSetup(_state: SetupTwoFactorState, formData: FormData): Promise<SetupTwoFactorState> {
  const challenge = await getTwoFactorChallenge();
  const portal = challenge ? parseTwoFactorPortal(challenge.portal) : null;
  const currentUser = await getCurrentUser();
  if (!challenge || !portal || challenge.type !== TWO_FACTOR_TYPES.ENROLL || !challenge.secretEncrypted) return { errorKey: "twoFactor.errors.challenge", recoveryCodes: null, destination: null };
  if (currentUser && currentUser.id !== challenge.userId) return { errorKey: "twoFactor.errors.challenge", recoveryCodes: null, destination: null };
  if (challenge.expiresAt <= new Date()) {
    await clearTwoFactorChallenge(challenge.id);
    return { errorKey: "twoFactor.errors.expired", recoveryCodes: null, destination: null };
  }
  const code = typeof formData.get("code") === "string" ? String(formData.get("code")).trim() : "";
  let valid = false;
  try { valid = verifyTotp(decryptTwoFactorSecret(challenge.secretEncrypted), code); } catch { valid = false; }
  if (!valid) {
    const retry = await recordFailedTwoFactorAttempt(challenge.id, challenge.attempts);
    return { errorKey: retry ? "twoFactor.errors.invalidCode" : "twoFactor.errors.tooManyAttempts", recoveryCodes: null, destination: null };
  }

  const recoveryCodes = generateRecoveryCodes();
  await prisma.$transaction([
    prisma.user.update({ where: { id: challenge.userId }, data: { twoFactorEnabled: true, twoFactorSecretEncrypted: challenge.secretEncrypted }, select: { id: true } }),
    prisma.twoFactorRecoveryCode.deleteMany({ where: { userId: challenge.userId } }),
    prisma.twoFactorRecoveryCode.createMany({ data: recoveryCodes.map((recoveryCode) => ({ userId: challenge.userId, codeHash: hashRecoveryCode(recoveryCode) })) }),
    prisma.twoFactorChallenge.deleteMany({ where: { id: challenge.id } }),
  ]);
  await clearTwoFactorChallenge();
  if (!currentUser) await createSession(challenge.userId);
  return { errorKey: null, recoveryCodes, destination: twoFactorDestination(portal) };
}
