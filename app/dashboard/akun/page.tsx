import type { Metadata } from "next";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { T } from "../../_components/i18n-provider";
import { requireUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getActiveSubscription } from "../../lib/subscriptions";
import { AccountForms } from "./account-forms";

export const metadata: Metadata = { title: "Akun — Ruang Momen" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ oauth_error?: string | string[]; oauth_success?: string | string[] }> }) {
  const sessionUser = await requireUser();
  const { oauth_error: oauthError, oauth_success: oauthSuccess } = await searchParams;
  const [user, subscription] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id }, select: { name: true, email: true, role: true, createdAt: true, passwordHash: true, twoFactorEnabled: true, oauthAccounts: { where: { provider: "GOOGLE" }, select: { id: true }, take: 1 } } }),
    getActiveSubscription(sessionUser.id),
  ]);

  return <><DashboardHeader title={<T k="account.title" />} description={<T k="account.description" />} /><AccountForms account={{ name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString(), planName: subscription?.plan.name ?? null, subscriptionStatus: subscription?.status ?? null, hasPassword: Boolean(user.passwordHash), googleLinked: user.oauthAccounts.length > 0, twoFactorEnabled: user.twoFactorEnabled }} oauthError={typeof oauthError === "string" ? oauthError : null} oauthSuccess={oauthSuccess === "linked"} /></>;
}
