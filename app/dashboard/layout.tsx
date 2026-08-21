import type { ReactNode } from "react";
import { DashboardShell } from "../_components/dashboard-shell";
import { requireUser } from "../lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return <DashboardShell>{children}</DashboardShell>;
}
