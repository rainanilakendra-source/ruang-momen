import type { ReactNode } from "react";
import { getCurrentUser } from "../lib/auth";
import { ADMIN_ROLES, hasRole, ROLES } from "../lib/roles";
import { DashboardNavigation } from "./dashboard-navigation";
import { LanguageSwitcher } from "./language-switcher";

export async function DashboardShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071727] pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-[#F5F0E7] lg:pb-0 lg:pl-[248px] xl:pl-[264px]">
      <DashboardNavigation
        showAdminOrders={Boolean(user && hasRole(user, ADMIN_ROLES))}
        showSuperAdmin={Boolean(user && hasRole(user, ROLES.SUPER_ADMIN))}
      />
      <div className="mx-auto min-h-screen w-full max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12">{children}</div>
    </main>
  );
}

export async function DashboardHeader({ title, description }: { title: ReactNode; description: ReactNode }) {
  const user = await getCurrentUser();
  const userName = user?.name ?? "Pengguna Ruang";
  const initials = userName
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase())
    .join("") || "PR";

  return (
    <header className="flex flex-col gap-6 border-b border-[#F5F0E7]/[.08] pb-7 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">Ruang Momen</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#AEB8BE] sm:text-base">{description}</p></div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <span className="hidden lg:block"><LanguageSwitcher compact /></span>
        <button type="button" aria-label="Notifikasi (belum tersedia)" className="grid h-11 w-11 place-items-center rounded-xl border border-[#F5F0E7]/10 bg-[#0A1D30] text-[#AEB8BE] transition hover:border-[#D6B56F]/30 hover:text-[#F5F0E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56F]"><span className="relative"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" /></svg><span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[#D6B56F]" /></span></button>
        <div className="flex items-center gap-3 rounded-xl border border-[#F5F0E7]/10 bg-[#0A1D30] py-1.5 pr-3 pl-1.5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#D6B56F]/12 font-serif text-sm italic text-[#D6B56F]">{initials}</span><span className="text-sm font-semibold">{userName}</span></div>
      </div>
    </header>
  );
}
