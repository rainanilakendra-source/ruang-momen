"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../dashboard/actions";
import { AppIcon, type AppIconName } from "./app-icons";
import { useI18n } from "./i18n-provider";

type NavItem = { label: string; labelKey?: string; icon: AppIconName; href?: string; match?: string };

const mainItems: NavItem[] = [
  { label: "Beranda", labelKey: "navigation.home", icon: "home", href: "/dashboard", match: "/dashboard" },
  { label: "Ruang Saya", labelKey: "navigation.rooms", icon: "spaces", href: "/dashboard/ruang", match: "/dashboard/ruang" },
  { label: "Album", labelKey: "navigation.album", icon: "album", href: "/dashboard/album", match: "/dashboard/album" },
  { label: "Buat Ruang", labelKey: "navigation.createRoom", icon: "add", href: "/dashboard/ruang/baru", match: "/dashboard/ruang/baru" },
  { label: "Paket & Upgrade", labelKey: "navigation.plansUpgrade", icon: "billing", href: "/dashboard/paket", match: "/dashboard/paket" },
  { label: "My Orders", labelKey: "navigation.orders", icon: "billing", href: "/dashboard/orders", match: "/dashboard/orders" },
  { label: "Akun", labelKey: "common.account", icon: "account" },
];

const bottomItems: NavItem[] = [
  { label: "Bantuan", icon: "help" },
];

function isActive(pathname: string, item: NavItem) {
  if (item.label === "Album") return pathname === "/dashboard/album" || pathname.endsWith("/album");
  if (item.label === "My Orders") return pathname.startsWith("/dashboard/orders");
  if (item.label === "Paket & Upgrade") return pathname.startsWith("/dashboard/paket");
  if (item.label === "Admin Orders") return pathname.startsWith("/admin/orders");
  if (item.label === "Super Admin") return pathname.startsWith("/superadmin");
  return Boolean(item.match && pathname === item.match);
}

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { t } = useI18n();
  const label = item.labelKey ? t(item.labelKey) : item.label;
  const active = isActive(pathname, item);
  const className = `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] ${active ? "border border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#F1DDA7]" : "border border-transparent text-[#AEB8BE] hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7]"}`;
  const content = <><AppIcon name={item.icon} className="h-5 w-5 shrink-0" /><span>{label}</span>{!item.href && <span className="sr-only"> (belum tersedia)</span>}</>;

  return item.href ? <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>{content}</Link> : <button type="button" className={`${className} w-full cursor-not-allowed opacity-65`} disabled>{content}</button>;
}

export function DashboardNavigation({ showAdminOrders = false, showSuperAdmin = false }: { showAdminOrders?: boolean; showSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const visibleMainItems: NavItem[] = [
    ...mainItems,
    ...(showAdminOrders ? [{ label: "Admin Orders", labelKey: "navigation.adminOrders", icon: "lock" as const, href: "/admin/orders", match: "/admin/orders" }] : []),
    ...(showSuperAdmin ? [{ label: "Super Admin", labelKey: "navigation.superAdmin", icon: "lock" as const, href: "/superadmin", match: "/superadmin" }] : []),
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#F5F0E7]/[.08] bg-[#081A2B] p-4 lg:flex lg:flex-col xl:w-[264px] xl:p-5">
        <Link href="/" className="mb-8 block rounded-xl px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]" aria-label="Beranda publik Ruang Momen">
          <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-12 w-auto object-contain" priority />
        </Link>
        <nav className="flex flex-1 flex-col" aria-label="Navigasi dashboard desktop">
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

      <nav className="fixed right-0 bottom-0 left-0 z-50 px-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:hidden" aria-label="Navigasi dashboard mobile">
        <div className="mx-auto grid h-[68px] w-full max-w-[460px] grid-cols-6 items-center rounded-[24px] border border-[#F5F0E7]/10 bg-[rgba(10,29,48,.94)] px-1 shadow-[0_16px_42px_rgba(0,0,0,.36)] backdrop-blur-[18px]">
          <MobileItem label={t("navigation.home")} icon="home" href="/dashboard" active={pathname === "/dashboard"} />
          <MobileItem label={t("navigation.rooms")} icon="spaces" href="/dashboard/ruang" active={pathname === "/dashboard/ruang"} />
          <MobileItem label={t("common.create")} icon="add" href="/dashboard/ruang/baru" active={pathname === "/dashboard/ruang/baru"} central />
          <MobileItem label={t("navigation.album")} icon="album" href="/dashboard/album" active={pathname.startsWith("/dashboard/album") || pathname.endsWith("/album")} />
          <MobileItem label={t("navigation.plansUpgrade")} icon="billing" href="/dashboard/paket" active={pathname.startsWith("/dashboard/paket")} />
          {showSuperAdmin ? <MobileItem label={t("navigation.superAdmin")} icon="lock" href="/superadmin" active={pathname.startsWith("/superadmin")} /> : showAdminOrders ? <MobileItem label={t("navigation.adminOrders")} icon="lock" href="/admin/orders" active={pathname.startsWith("/admin/orders")} /> : <MobileItem label={t("navigation.orders")} icon="billing" href="/dashboard/orders" active={pathname.startsWith("/dashboard/orders")} />}
        </div>
      </nav>
    </>
  );
}

function MobileItem({ label, icon, href, active = false, central = false }: { label: string; icon: AppIconName; href?: string; active?: boolean; central?: boolean }) {
  const className = `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#D6B56F] ${central ? "-translate-y-2.5" : ""} ${active ? "text-[#F5F0E7]" : "text-[#AEB8BE]"}`;
  const iconBox = central ? "grid h-[52px] w-[52px] place-items-center rounded-[18px] border border-[#F5F0E7]/10 bg-[#D6B56F] text-[#071727] shadow-[0_9px_22px_rgba(0,0,0,.25)]" : "grid h-7 w-7 place-items-center";
  const content = <><span className={iconBox}><AppIcon name={icon} className={central ? "h-6 w-6" : "h-[21px] w-[21px]"} /></span><span>{label}</span></>;
  return href ? <Link href={href} className={className} aria-current={active ? "page" : undefined}>{content}</Link> : <button type="button" className={`${className} cursor-not-allowed opacity-65`} disabled>{content}<span className="sr-only"> (belum tersedia)</span></button>;
}
