"use client";

import { useEffect, useState } from "react";
import { logoutUser } from "../../dashboard/actions";
import { LanguageSwitcher } from "../language-switcher";
import { useI18n } from "../i18n-provider";
import { MobileMenuSheet, type MobileMenuSection } from "./mobile-menu-sheet";

export function MobileHeaderMenu({ variant, showAdmin = false, showSuperAdmin = false }: { variant: "public" | "dashboard"; showAdmin?: boolean; showSuperAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [open]);
  useEffect(() => { const show = () => setOpen(true); window.addEventListener("ruang-mobile-menu-open", show); return () => window.removeEventListener("ruang-mobile-menu-open", show); }, []);

  const languageAction = <div className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-[#D9D6CE]"><span>{t("navigation.language")}</span><LanguageSwitcher compact /></div>;
  const logoutAction = <form action={logoutUser}><button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#D9D6CE] hover:bg-[#D6B56F]/10 hover:text-[#F1DDA7]">{t("common.logout")}</button></form>;
  const publicSections: MobileMenuSection[] = [
    { titleKey: "navigation.sections.explore", items: [{ labelKey: "navigation.pricing", href: "/#mulai" }, { labelKey: "navigation.contact", href: "/kontak" }, { labelKey: "navigation.album", href: "/#contoh-album" }, { labelKey: "navigation.guestbook", href: "/#contoh-album" }] },
    { titleKey: "navigation.sections.eventTypes", items: [{ labelKey: "navigation.wedding", href: "/#untuk-acara" }, { labelKey: "navigation.birthday", href: "/#untuk-acara" }, { labelKey: "navigation.party", href: "/#untuk-acara" }, { labelKey: "navigation.babyShower", href: "/#untuk-acara" }, { labelKey: "navigation.corporateEvent", href: "/#untuk-acara" }] },
    { titleKey: "navigation.sections.account", items: [{ labelKey: "navigation.login", href: "/masuk", icon: "account" }, { labelKey: "navigation.createRoom", href: "/daftar", icon: "add" }] },
    { titleKey: "navigation.sections.settings", items: [{ labelKey: "navigation.language", action: languageAction }, { labelKey: "common.help", href: "/#faq", icon: "help" }] },
  ];
  const dashboardSections: MobileMenuSection[] = [
    { titleKey: "navigation.sections.rooms", items: [{ labelKey: "navigation.rooms", href: "/dashboard/ruang", icon: "spaces" }, { labelKey: "navigation.album", href: "/dashboard/album", icon: "album" }, { labelKey: "navigation.plansUpgrade", href: "/dashboard/paket", icon: "billing" }] },
    { titleKey: "navigation.sections.transactions", items: [{ labelKey: "navigation.orders", href: "/dashboard/orders", icon: "billing" }, { labelKey: "navigation.subscription", href: "/dashboard/langganan", icon: "calendar" }] },
    { titleKey: "navigation.sections.account", items: [{ labelKey: "navigation.profile", href: "/dashboard/akun", icon: "account" }, { labelKey: "navigation.settings", icon: "lock" }, { labelKey: "navigation.language", action: languageAction }, { labelKey: "common.help", href: "/#faq", icon: "help" }, { labelKey: "common.logout", action: logoutAction }] },
    ...(showAdmin ? [{ titleKey: "navigation.sections.adminPanel", items: [{ labelKey: "navigation.adminDashboard", href: "/admin", icon: "lock" as const }, { labelKey: "navigation.adminOrders", href: "/admin/orders", icon: "billing" as const }, { labelKey: "navigation.users", icon: "user" as const }] }] : []),
    ...(showSuperAdmin ? [{ titleKey: "navigation.sections.superAdmin", items: [{ labelKey: "superadmin.dashboard", href: "/incroet", icon: "lock" as const }, { labelKey: "superadmin.users", icon: "user" as const }, { labelKey: "superadmin.plans", href: "/incroet/plans", icon: "billing" as const }, { labelKey: "superadmin.features", href: "/incroet/features", icon: "album" as const }, { labelKey: "superadmin.payments", href: "/incroet/payments", icon: "billing" as const }, { labelKey: "superadmin.settings", icon: "lock" as const }] }] : []),
  ];
  return <><button type="button" onClick={() => setOpen(true)} aria-label={t("navigation.openMenu")} aria-expanded={open} className="fixed top-3 right-3 z-[60] grid h-11 w-11 place-items-center rounded-xl border border-[#D6B56F]/25 bg-[#081A2B]/95 text-[#F1DDA7] shadow-[0_10px_28px_rgba(0,0,0,.28)] backdrop-blur lg:hidden"><span className="space-y-1" aria-hidden="true"><span className="block h-px w-5 bg-current" /><span className="block h-px w-5 bg-current" /><span className="block h-px w-5 bg-current" /></span></button><MobileMenuSheet open={open} onClose={() => setOpen(false)} sections={variant === "public" ? publicSections : dashboardSections} /></>;
}
