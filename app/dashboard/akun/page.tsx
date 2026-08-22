import type { Metadata } from "next";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { T } from "../../_components/i18n-provider";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getActiveSubscription } from "../../lib/subscriptions";
import { AccountForms } from "./account-forms";

export const metadata: Metadata = { title: "Akun — Ruang Momen" };

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const [user, subscription] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id }, select: { name: true, email: true, role: true, createdAt: true } }),
    getActiveSubscription(sessionUser.id),
  ]);

  return <><DashboardHeader title={<T k="account.title" />} description={<T k="account.description" />} /><AccountForms account={{ ...user, createdAt: user.createdAt.toISOString(), planName: subscription?.plan.name ?? null, subscriptionStatus: subscription?.status ?? null }} /></>;
}
