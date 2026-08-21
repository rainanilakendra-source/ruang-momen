"use server";

import { redirect } from "next/navigation";
import { createSession } from "../lib/auth";
import { verifyPassword } from "../lib/password";
import { prisma } from "../lib/prisma";

export type LoginState = {
  error: string | null;
};

const INVALID_CREDENTIALS = "Email atau kata sandi tidak sesuai.";

export async function loginUser(
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
      select: { id: true, passwordHash: true },
    });

    if (!user?.passwordHash) {
      return { error: INVALID_CREDENTIALS };
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid) {
      return { error: INVALID_CREDENTIALS };
    }

    await createSession(user.id);
  } catch {
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  redirect("/dashboard");
}
