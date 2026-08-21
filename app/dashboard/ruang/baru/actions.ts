"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { Prisma } from "../../../generated/prisma/client";
import type { EventType } from "../../../generated/prisma/enums";
import { requireUser } from "../../../lib/auth";
import { EVENT_TYPES } from "../../../lib/event";
import { prisma } from "../../../lib/prisma";
import { DEFAULT_PLAN_CODE } from "../../../lib/plans";

export type CreateEventState = {
  error: string | null;
};

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function slugBase(name: string): string {
  const simplified = name
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return simplified || "ruang";
}

function generateSlug(name: string): string {
  return `${slugBase(name)}-${randomBytes(3).toString("hex")}`;
}

function parseEventDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export async function createEvent(
  _previousState: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const user = await requireUser();
  const name = formValue(formData, "eventName").trim();
  const typeValue = formValue(formData, "eventType");
  const eventDate = parseEventDate(formValue(formData, "eventDate"));

  if (!name) return { error: "Nama acara wajib diisi." };
  if (Array.from(name).length < 3) return { error: "Nama acara minimal 3 karakter." };
  if (Array.from(name).length > 100) return { error: "Nama acara maksimal 100 karakter." };
  if (!EVENT_TYPES.includes(typeValue as EventType)) return { error: "Pilih jenis acara yang valid." };
  if (!eventDate) return { error: "Masukkan tanggal acara yang valid." };

  const defaultPlan = await prisma.plan.findUnique({
    where: { code: DEFAULT_PLAN_CODE, isActive: true },
    select: { id: true },
  });
  if (!defaultPlan) return { error: "Plan dasar belum tersedia. Silakan coba lagi." };

  let eventId: string | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const event = await prisma.event.create({
        data: {
          ownerId: user.id,
          planId: defaultPlan.id,
          name,
          type: typeValue as EventType,
          eventDate,
          slug: generateSlug(name),
        },
        select: { id: true },
      });
      eventId = event.id;
      break;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue;
      }
      return { error: "Terjadi kesalahan. Silakan coba lagi." };
    }
  }

  if (!eventId) return { error: "Terjadi kesalahan. Silakan coba lagi." };
  redirect(`/dashboard/ruang/${eventId}`);
}
