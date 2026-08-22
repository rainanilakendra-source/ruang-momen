"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "../../generated/prisma/client";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ROLES } from "../../lib/roles";

export type PlanFormState = { error: string | null };

const MAX_INT = 2_147_483_647;

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nonNegativeInteger(formData: FormData, key: string): number | null {
  const raw = textValue(formData, key);
  if (!/^\d+$/u.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value <= MAX_INT ? value : null;
}

function slugify(name: string): string {
  return name.normalize("NFKD").replace(/\p{Mark}/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 80);
}

function parsePlanForm(formData: FormData) {
  const name = textValue(formData, "name");
  const description = textValue(formData, "description");
  const price = nonNegativeInteger(formData, "price");
  const maxGuests = nonNegativeInteger(formData, "maxGuests");
  const maxPhotos = nonNegativeInteger(formData, "maxPhotos");
  const storageLimitMb = nonNegativeInteger(formData, "storageLimitMb");
  const durationDays = nonNegativeInteger(formData, "durationDays");

  if (!name || name.length > 100) return { success: false, error: "Nama wajib diisi dan maksimal 100 karakter." } as const;
  if (description.length > 2000) return { success: false, error: "Deskripsi maksimal 2.000 karakter." } as const;
  if ([price, maxGuests, maxPhotos, storageLimitMb, durationDays].some((value) => value === null)) return { success: false, error: "Harga dan seluruh limit harus berupa bilangan bulat minimal 0." } as const;

  return { success: true, data: { name, description: description || null, price: price!, maxGuests: maxGuests!, maxPhotos: maxPhotos!, storageLimitMb: storageLimitMb!, durationDays: durationDays! } } as const;
}

function storageBytes(storageLimitMb: number): bigint {
  return BigInt(storageLimitMb) * BigInt(1024 * 1024);
}

export async function createPlan(_state: PlanFormState, formData: FormData): Promise<PlanFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const parsed = parsePlanForm(formData);
  if (!parsed.success) return { error: parsed.error };
  const slug = slugify(parsed.data.name);
  if (!slug) return { error: "Nama tidak dapat digunakan sebagai slug." };

  try {
    await prisma.plan.create({
      data: {
        ...parsed.data,
        slug,
        code: slug.replace(/-/gu, "_").toUpperCase(),
        limit: { create: { maxPhotos: parsed.data.maxPhotos, maxStorageBytes: storageBytes(parsed.data.storageLimitMb), maxActiveDays: parsed.data.durationDays } },
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Nama atau slug plan sudah digunakan." };
    return { error: "Plan gagal dibuat. Silakan coba lagi." };
  }

  revalidatePath("/incroet/plans");
  redirect("/incroet/plans");
}

export async function updatePlan(planId: string, _state: PlanFormState, formData: FormData): Promise<PlanFormState> {
  await requireRole(ROLES.SUPER_ADMIN);
  const parsed = parsePlanForm(formData);
  if (!parsed.success) return { error: parsed.error };

  try {
    await prisma.plan.update({
      where: { id: planId },
      data: {
        ...parsed.data,
        limit: {
          upsert: {
            create: { maxPhotos: parsed.data.maxPhotos, maxStorageBytes: storageBytes(parsed.data.storageLimitMb), maxActiveDays: parsed.data.durationDays },
            update: { maxPhotos: parsed.data.maxPhotos, maxStorageBytes: storageBytes(parsed.data.storageLimitMb), maxActiveDays: parsed.data.durationDays },
          },
        },
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return { error: "Plan tidak ditemukan." };
    return { error: "Plan gagal diperbarui. Silakan coba lagi." };
  }

  revalidatePath("/incroet/plans");
  redirect("/incroet/plans");
}

export async function togglePlanStatus(planId: string): Promise<void> {
  await requireRole(ROLES.SUPER_ADMIN);
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { active: true } });
  if (!plan) return;
  await prisma.plan.update({ where: { id: planId }, data: { active: !plan.active }, select: { id: true } });
  revalidatePath("/incroet/plans");
}

export async function updatePlanFeatures(planId: string, formData: FormData): Promise<void> {
  await requireRole(ROLES.SUPER_ADMIN);
  const requestedIds = formData.getAll("featureId").filter((value): value is string => typeof value === "string");
  const features = await prisma.feature.findMany({ where: { id: { in: requestedIds } }, select: { id: true } });
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { code: true } });
  if (!plan) return;
  const pairedCode: Record<string, string> = { BASIC: "BASIC_PLUS", BASIC_PLUS: "BASIC", STANDARD: "STANDARD_PLUS", STANDARD_PLUS: "STANDARD", PREMIUM: "PREMIUM_PLUS", PREMIUM_PLUS: "PREMIUM" };
  const pairedPlan = pairedCode[plan.code] ? await prisma.plan.findUnique({ where: { code: pairedCode[plan.code] }, select: { id: true } }) : null;
  const targetPlanIds = pairedPlan ? [planId, pairedPlan.id] : [planId];

  await prisma.$transaction([
    prisma.planFeature.deleteMany({ where: { planId: { in: targetPlanIds } } }),
    prisma.planFeature.createMany({ data: targetPlanIds.flatMap((targetPlanId) => features.map(({ id: featureId }) => ({ planId: targetPlanId, featureId }))), skipDuplicates: true }),
  ]);
  revalidatePath("/incroet/plans");
}
