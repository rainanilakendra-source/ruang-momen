import type { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

export const DEFAULT_PLAN_CODE = "BASIC" as const;

export const PLAN_FEATURES = {
  GUEST_UPLOAD: "guest_upload",
  GUEST_GALLERY: "guest_gallery",
  GUEST_DOWNLOAD: "guest_download",
  QR_SOURCE: "qr_source",
  REACTION: "reaction",
  CUSTOM_THEME: "custom_theme",
  REMOVE_BRANDING: "remove_branding",
  ZIP_EXPORT: "zip_export",
  ANALYTICS: "analytics",
  ADVANCED_QR: "advanced_qr",
} as const;

export type PlanFeatureKey = (typeof PLAN_FEATURES)[keyof typeof PLAN_FEATURES];
export type PlanLimitKey = "maxPhotos" | "maxStorageBytes" | "maxActiveDays";

export const EVENT_PLAN_SELECT = {
  id: true,
  plan: {
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
      features: { select: { key: true, enabled: true } },
      limit: { select: { maxPhotos: true, maxStorageBytes: true, maxActiveDays: true } },
    },
  },
} satisfies Prisma.EventSelect;

export type EventWithPlan = Prisma.EventGetPayload<{ select: typeof EVENT_PLAN_SELECT }>;
export type UploadUsage = { photoCount: number; storageBytes: bigint; incomingBytes?: bigint };

export function getEventPlan(eventId: string): Promise<EventWithPlan | null> {
  return prisma.event.findUnique({ where: { id: eventId }, select: EVENT_PLAN_SELECT });
}

export function hasFeature(event: EventWithPlan, featureKey: PlanFeatureKey): boolean {
  return event.plan.isActive && event.plan.features.some(({ key, enabled }) => key === featureKey && enabled);
}

export function getPlanLimit<K extends PlanLimitKey>(event: EventWithPlan, limitKey: K): NonNullable<EventWithPlan["plan"]["limit"]>[K] | null {
  return event.plan.limit?.[limitKey] ?? null;
}

export function checkPhotoLimit(event: EventWithPlan, currentPhotoCount: number): boolean {
  const maximum = getPlanLimit(event, "maxPhotos");
  return maximum !== null && currentPhotoCount < maximum;
}

export function checkStorageLimit(event: EventWithPlan, currentStorageBytes: bigint, incomingBytes = BigInt(0)): boolean {
  const maximum = getPlanLimit(event, "maxStorageBytes");
  return maximum !== null && currentStorageBytes + incomingBytes <= maximum;
}

export function canUploadPhoto(event: EventWithPlan, usage: UploadUsage): boolean {
  return event.plan.isActive
    && hasFeature(event, PLAN_FEATURES.GUEST_UPLOAD)
    && checkPhotoLimit(event, usage.photoCount)
    && checkStorageLimit(event, usage.storageBytes, usage.incomingBytes);
}
