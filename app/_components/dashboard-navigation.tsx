"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../dashboard/actions";
import { AppIcon, type AppIconName } from "./app-icons";
import { useI18n } from "./i18n-provider";
import { DashboardMobileNavigation } from "./navigation/dashboard-mobile-navigation";

type NavItem = { label: string; labelKey?: string; icon: AppIconName; href?: string; match?: string };

const mainItems: NavItem[] = [
  { label: "Beranda", labelKey: "navigation.home", icon: "home", href: "/dashboard", match: "/dashboard" },
  { label: "Ruang Saya", labelKey: "navigation.rooms", icon: "spaces", href: "/dashboard/ruang", match: "/dashboard/ruang" },
  { label: "Album", labelKey: "navigation.album", icon: "album", href: "/dashboard/album", match: "/dashboard/album" },
  { label: "Buat Ruang", labelKey: "navigation.createRoom", icon: "add", href: "/dashboard/ruang/baru", match: "/dashboard/ruang/baru" },
  { label: "Paket & Upgrade", labelKey: "navigation.plansUpgrade", icon: "billing", href: "/dashboard/paket", match: "/dashboard/paket" },
  { label: "Langganan", labelKey: "navigation.subscription", icon: "calendar", href: "/dashboard/langganan", match: "/dashboard/langganan" },
  { label: "My Orders", labelKey: "navigation.orders", icon: "billing", href: "/dashboard/orders", match: "/dashboard/orders" },
  { label: "Akun", labelKey: "common.account", icon: "account" },
];

const bottomItems: NavItem[] = [
  { label: "Bantuan", labelKey: "common.help", icon: "help" },
];

function isActive(pathname: string, item: NavItem) {
  if (item.label === "Album") return pathname === "/dashboard/album" || pathname.endsWith("/album");
  if (item.label === "My Orders") return pathname.startsWith("/dashboard/orders");
  if (item.label === "Paket & Upgrade") return pathname.startsWith("/dashboard/paket");
  if (item.label === "Langganan") return pathname.startsWith("/dashboard/langganan");
  if (item.label === "Admin Orders") return pathname.startsWith("/admin/orders");
  if (item.label === "Super Admin") return pathname.startsWith("/incroet");
  return Boolean(item.match && pathname === item.match);
}

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { t } = useI18n();
  const label = item.labelKey ? t(item.labelKey) : item.label;
  const active = isActive(pathname, item);
  const className = `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] ${active ? "border border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#F1DDA7]" : "border border-transparent text-[#AEB8BE] hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7]"}`;
  const content = <><AppIcon name={item.icon} className="h-5 w-5 shrink-0" /><span>{label}</span>{!item.href && <span className="sr-only"> ({t("common.unavailable")})</span>}</>;

  return item.href ? <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>{content}</Link> : <button type="button" className={`${className} w-full cursor-not-allowed opacity-65`} disabled>{content}</button>;
}

export function DashboardNavigation({ showAdminOrders = false, showSuperAdmin = false }: { showAdminOrders?: boolean; showSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const visibleMainItems: NavItem[] = [
    ...mainItems,
    ...(showAdminOrders ? [{ label: "Admin Orders", labelKey: "navigation.adminOrders", icon: "lock" as const, href: "/admin/orders", match: "/admin/orders" }] : []),
    ...(showSuperAdmin ? [{ label: "Super Admin", labelKey: "navigation.superAdmin", icon: "lock" as const, href: "/incroet", match: "/incroet" }] : []),
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#F5F0E7]/[.08] bg-[#081A2B] p-4 lg:flex lg:flex-col xl:w-[264px] xl:p-5">
        <Link href="/" className="mb-8 block rounded-xl px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]" aria-label={t("navigation.publicHomeAria")}>
          <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-12 w-auto object-contain" priority />
        </Link>
        <nav className="flex flex-1 flex-col" aria-label={t("navigation.dashboardDesktopAria")}>
          <div className="space-y-1.5">{visibleMainItems.map((item) => <SidebarItem key={item.label} item={item} pathname={pathname} />)}</div>
          <div className="mt-auto space-y-1.5 border-t border-[#F5F0E7]/[.08] pt-4">
            {bottomItems.map((item) => <SidebarItem key={item.label} item={item} pathname={pathname} />)}
            <form action={logoutUser}>
              <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3.5 text-sm font-semibold text-[#AEB8BE] transition hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]">
                <AppIcon name="logout" className="h-5 w-5 shrink-0" /><span>{t("common.logout")}</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <DashboardMobileNavigation showAdmin={showAdminOrders && !showSuperAdmin} showSuperAdmin={showSuperAdmin} />
    </>
  );
}
