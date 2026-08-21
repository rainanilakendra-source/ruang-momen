"use server";

import { redirect } from "next/navigation";
import { Prisma } from "../generated/prisma/client";
import { hashPassword } from "../lib/password";
import { prisma } from "../lib/prisma";
import { ROLES } from "../lib/roles";

export type RegisterState = {
  error: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function valueFrom(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function characterCount(value: string): number {
  return Array.from(value).length;
}

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = valueFrom(formData, "name").trim();
  const email = valueFrom(formData, "email").trim().toLowerCase();
  const password = valueFrom(formData, "password");
  const passwordConfirmation = valueFrom(formData, "passwordConfirmation");

  if (!name) {
    return { error: "Nama wajib diisi." };
  }

  if (characterCount(name) < 2 || characterCount(name) > 80) {
    return { error: "Nama harus terdiri dari 2 sampai 80 karakter." };
  }

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  const passwordLength = characterCount(password);
  if (!password) {
    return { error: "Kata sandi wajib diisi." };
  }

  if (passwordLength < 10) {
    return { error: "Kata sandi minimal 10 karakter." };
  }

  if (passwordLength > 128) {
    return { error: "Kata sandi maksimal 128 karakter." };
  }

  if (password !== passwordConfirmation) {
    return { error: "Konfirmasi kata sandi tidak sama." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { error: "Email ini sudah terdaftar." };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: { name, email, passwordHash, role: ROLES.USER },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Email ini sudah terdaftar." };
    }

    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  redirect("/masuk?registered=1");
}
