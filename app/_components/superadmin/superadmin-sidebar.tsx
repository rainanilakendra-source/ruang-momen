"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "../../dashboard/actions";
import { AppIcon, type AppIconName } from "../app-icons";

const items: { label: string; href: string; icon: AppIconName }[] = [
  { label: "Dashboard", href: "/superadmin", icon: "home" },
  { label: "Users", href: "/superadmin?view=users", icon: "account" },
  { label: "Plans", href: "/superadmin/plans", icon: "spaces" },
  { label: "Features", href: "/superadmin/features", icon: "lock" },
  { label: "Payments", href: "/superadmin/payments", icon: "billing" },
  { label: "Settings", href: "/superadmin?view=settings", icon: "calendar" },
  { label: "Logs", href: "/superadmin?view=logs", icon: "album" },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#F5F0E7]/[.08] bg-[#081A2B] px-5 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[264px] lg:flex-col lg:border-r lg:border-b-0 lg:p-5">
      <div className="flex items-center justify-between gap-4 lg:block">
        <Link href="/superadmin" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]" aria-label="Super Admin Ruang Momen">
          <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-10 w-auto object-contain lg:h-12" priority />
        </Link>
        <span className="rounded-full border border-[#D6B56F]/20 bg-[#D6B56F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#F1DDA7]">Super Admin</span>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Navigasi super admin">
        {items.map((item) => {
          const active = item.href === "/superadmin" ? pathname === item.href : pathname.startsWith(`${item.href}/`) || pathname === item.href;
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-3.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F] ${active ? "border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#F1DDA7]" : "border-transparent text-[#AEB8BE] hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7]"}`}><AppIcon name={item.icon} className="h-5 w-5 shrink-0" /><span>{item.label}</span></Link>;
        })}
        <div className="hidden lg:mt-auto lg:block lg:border-t lg:border-[#F5F0E7]/[.08] lg:pt-4">
          <Link href="/dashboard" className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-[#AEB8BE] transition hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7]"><AppIcon name="spaces" className="h-5 w-5" />Dashboard Host</Link>
          <form action={logoutUser}><button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-[#AEB8BE] transition hover:bg-[#F5F0E7]/[.045] hover:text-[#F5F0E7]"><AppIcon name="logout" className="h-5 w-5" />Keluar</button></form>
        </div>
      </nav>
    </aside>
  );
}
