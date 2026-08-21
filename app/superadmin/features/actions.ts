"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../../generated/prisma/client";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ROLES } from "../../lib/roles";

export type FeatureFormState = { error: string | null };

function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function parseFeature(formData: FormData) {
  const name = value(formData, "name");
  const key = value(formData, "key").toLowerCase();
  const description = value(formData, "description");
  if (!name || name.length > 100) return { success: false, error: "Nama wajib diisi dan maksimal 100 karakter." } as const;
  if (!/^[a-z][a-z0-9_]{1,79}$/u.test(key)) return { success: false, error: "Key harus berupa snake_case, minimal 2 karakter." } as const;
  if (description.length > 1000) return { success: false, error: "Deskripsi maksimal 1.000 karakter." } as const;
  return { success: true, data: { name, key, description: description || null } } as const;
}

export async function createFeature(_state: FeatureFormState, formData: FormData): Promise<FeatureFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const parsed = parseFeature(formData);
  if (!parsed.success) return { error: parsed.error };
  try {
    await prisma.feature.create({ data: parsed.data, select: { id: true } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Key feature sudah digunakan." };
    return { error: "Feature gagal dibuat." };
  }
  revalidatePath("/superadmin/features");
  redirect("/superadmin/features");
}

export async function updateFeature(featureId: string, _state: FeatureFormState, formData: FormData): Promise<FeatureFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const parsed = parseFeature(formData);
  if (!parsed.success) return { error: parsed.error };
  try {
    await prisma.feature.update({ where: { id: featureId }, data: parsed.data, select: { id: true } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Key feature sudah digunakan." };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return { error: "Feature tidak ditemukan." };
    return { error: "Feature gagal diperbarui." };
  }
  revalidatePath("/superadmin/features");
  revalidatePath("/superadmin/plans");
  redirect("/superadmin/features");
}

export async function toggleFeatureStatus(featureId: string): Promise<void> {
  await requireRole(ROLES.SUPER_ADMIN);
  const feature = await prisma.feature.findUnique({ where: { id: featureId }, select: { active: true } });
  if (!feature) return;
  await prisma.feature.update({ where: { id: featureId }, data: { active: !feature.active }, select: { id: true } });
  revalidatePath("/superadmin/features");
  revalidatePath("/superadmin/plans");
}
