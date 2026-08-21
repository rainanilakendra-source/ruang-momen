import type { Metadata } from "next";
import { DashboardHeader } from "../../_components/dashboard-shell";
import { T } from "../../_components/i18n-provider";
import { SubscriptionSummary } from "../../_components/subscription-summary";
import { requireUser } from "../../lib/auth";
import { getActiveSubscription } from "../../lib/subscriptions";

export const metadata: Metadata = { title: "Langganan — Ruang Momen" };

export default async function SubscriptionPage() {
  const user = await requireUser();
  const subscription = await getActiveSubscription(user.id);
  return <><DashboardHeader title={<T k="subscription.title" />} description={<T k="subscription.description" />} /><SubscriptionSummary subscription={subscription ? { ...subscription, startedAt: subscription.startedAt.toISOString(), expiredAt: subscription.expiredAt.toISOString() } : null} /></>;
}
