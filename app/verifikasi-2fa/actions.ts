"use server";

import { redirect } from "next/navigation";
import { createSession } from "../lib/auth";
import { prisma } from "../lib/prisma";
import {
  clearTwoFactorChallenge,
  decryptTwoFactorSecret,
  getTwoFactorChallenge,
  hashRecoveryCode,
  parseTwoFactorPortal,
  recordFailedTwoFactorAttempt,
  TWO_FACTOR_TYPES,
  twoFactorDestination,
  verifyTotp,
} from "../lib/two-factor";

export type VerifyTwoFactorState = { errorKey: string | null };

export async function verifySecondFactor(_state: VerifyTwoFactorState, formData: FormData): Promise<VerifyTwoFactorState> {
  const challenge = await getTwoFactorChallenge();
  const portal = challenge ? parseTwoFactorPortal(challenge.portal) : null;
  if (!challenge || !portal || challenge.type !== TWO_FACTOR_TYPES.VERIFY) return { errorKey: "twoFactor.errors.challenge" };
  if (challenge.expiresAt <= new Date()) {
    await clearTwoFactorChallenge(challenge.id);
    return { errorKey: "twoFactor.errors.expired" };
  }
  if (!challenge.user.twoFactorEnabled || !challenge.user.twoFactorSecretEncrypted) {
    await clearTwoFactorChallenge(challenge.id);
    return { errorKey: "twoFactor.errors.unavailable" };
  }

  const mode = formData.get("mode") === "recovery" ? "recovery" : "totp";
  const value = typeof formData.get("code") === "string" ? String(formData.get("code")).trim() : "";
  let valid = false;

  if (mode === "totp") {
    try { valid = verifyTotp(decryptTwoFactorSecret(challenge.user.twoFactorSecretEncrypted), value); } catch { valid = false; }
    if (valid) await prisma.twoFactorChallenge.deleteMany({ where: { id: challenge.id } });
  } else {
    const codeHash = hashRecoveryCode(value);
    const recovery = value ? await prisma.twoFactorRecoveryCode.findFirst({ where: { userId: challenge.userId, codeHash, usedAt: null }, select: { id: true } }) : null;
    if (recovery) {
      const [recoveryConsumed, challengeConsumed] = await prisma.$transaction([
        prisma.twoFactorRecoveryCode.updateMany({ where: { id: recovery.id, usedAt: null }, data: { usedAt: new Date() } }),
        prisma.twoFactorChallenge.deleteMany({ where: { id: challenge.id } }),
      ]);
      valid = recoveryConsumed.count === 1 && challengeConsumed.count === 1;
    }
  }

  if (!valid) {
    const retry = await recordFailedTwoFactorAttempt(challenge.id, challenge.attempts);
    return { errorKey: retry ? "twoFactor.errors.invalidCode" : "twoFactor.errors.tooManyAttempts" };
  }

  await clearTwoFactorChallenge();
  await createSession(challenge.userId);
  redirect(twoFactorDestination(portal));
}
