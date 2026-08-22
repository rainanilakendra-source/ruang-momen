"use server";

import { redirect } from "next/navigation";
import { createSession } from "../lib/auth";
import { verifyPassword } from "../lib/password";
import { prisma } from "../lib/prisma";
import { ROLES, type Role } from "../lib/roles";

export type LoginState = {
  error: string | null;
};

const INVALID_CREDENTIALS = "Email atau kata sandi tidak sesuai.";

async function loginForRole(
  expectedRole: Role,
  destination: string,
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password || email.length > 254 || password.length > 128) {
    return { error: INVALID_CREDENTIALS };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true },
    });

    if (!user?.passwordHash) {
      return { error: INVALID_CREDENTIALS };
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid || user.role !== expectedRole) {
      return { error: INVALID_CREDENTIALS };
    }

    await createSession(user.id);
  } catch {
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  redirect(destination);
}

export async function loginUser(
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return loginForRole(ROLES.USER, "/dashboard", previousState, formData);
}

export async function loginAdmin(
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return loginForRole(ROLES.ADMIN, "/admin", previousState, formData);
}

export async function loginSuperAdmin(
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return loginForRole(ROLES.SUPER_ADMIN, "/incroet", previousState, formData);
}
