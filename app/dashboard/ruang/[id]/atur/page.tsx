import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../../_components/dashboard-shell";
import { requireUser } from "../../../../lib/auth";
import { resolveFrameKey, resolveThemeKey } from "../../../../lib/event-appearance";
import { prisma } from "../../../../lib/prisma";
import { RoomSettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Atur Ruang — Ruang Momen" };

export default async function RoomSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true, slug: true, name: true, type: true, eventDate: true, coverStorageKey: true, themeKey: true, frameKey: true, guestUploadEnabled: true, guestGalleryEnabled: true, guestDownloadEnabled: true, uploadStartsAt: true, uploadEndsAt: true },
  });
  if (!event) notFound();

  return <><DashboardHeader title="Atur Ruang" description={`Kelola pengaturan ${event.name} dalam satu halaman.`} /><RoomSettingsForm event={{ ...event, themeKey: resolveThemeKey(event.themeKey), frameKey: resolveFrameKey(event.frameKey), eventDate: event.eventDate.toISOString().slice(0, 10), hasCover: Boolean(event.coverStorageKey), uploadStartsAt: event.uploadStartsAt?.toISOString() ?? null, uploadEndsAt: event.uploadEndsAt?.toISOString() ?? null }} /></>;
}
