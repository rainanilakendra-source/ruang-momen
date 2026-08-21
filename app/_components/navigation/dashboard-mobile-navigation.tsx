"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeaderMenu } from "./mobile-header-menu";

export function DashboardMobileNavigation({ showAdmin = false, showSuperAdmin = false }: { showAdmin?: boolean; showSuperAdmin?: boolean }) {
  const pathname = usePathname();
  return <><MobileHeaderMenu variant="dashboard" showAdmin={showAdmin} showSuperAdmin={showSuperAdmin} /><MobileBottomNav ariaLabelKey="navigation.dashboardMobileAria" items={[{ labelKey: "navigation.home", icon: "home", href: "/dashboard", active: pathname === "/dashboard" }, { labelKey: "navigation.rooms", icon: "spaces", href: "/dashboard/ruang", active: pathname.startsWith("/dashboard/ruang") && pathname !== "/dashboard/ruang/baru" }, { labelKey: "navigation.createRoom", icon: "add", href: "/dashboard/ruang/baru", active: pathname === "/dashboard/ruang/baru", center: true }, { labelKey: "navigation.album", icon: "album", href: "/dashboard/album", active: pathname.startsWith("/dashboard/album") || pathname.endsWith("/album") }, { labelKey: "common.account", icon: "account", action: "open-menu", active: false }]} /></>;
}
