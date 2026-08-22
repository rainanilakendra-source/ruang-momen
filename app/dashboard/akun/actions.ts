"use server";

import { Prisma } from "../../generated/prisma/client";
import { requireUser } from "../../lib/auth";
import { hashPassword, verifyPassword } from "../../lib/password";
import { prisma } from "../../lib/prisma";

export type AccountActionState = { status: "idle" | "success" | "error"; messageKey: string | null };

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
