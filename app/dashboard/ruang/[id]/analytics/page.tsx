import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../../_components/dashboard-shell";
import { FeatureLocked } from "../../../../_components/feature-locked";
import { T } from "../../../../_components/i18n-provider";
import { requireUser } from "../../../../lib/auth";
import { getEventAnalytics } from "../../../../lib/event-analytics";
import { hasPlanFeature } from "../../../../lib/plan-limits";
import { PLAN_FEATURES } from "../../../../lib/plans";
import { AnalyticsView } from "./analytics-view";

export const metadata: Metadata = { title: "Analytics — Ruang Momen" };

export default async function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [data, analyticsAllowed] = await Promise.all([
    getEventAnalytics(id, user.id),
    hasPlanFeature(user.id, PLAN_FEATURES.ANALYTICS),
  ]);
  if (!data) notFound();
  if (!analyticsAllowed) return <><DashboardHeader title={<T k="analytics.title" />} description={<T k="analytics.description" />} /><FeatureLocked /></>;

  return <><DashboardHeader title={<T k="analytics.title" />} description={<T k="analytics.description" />} /><AnalyticsView eventId={id} data={data} /></>;
}
