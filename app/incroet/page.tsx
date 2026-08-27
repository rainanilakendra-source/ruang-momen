import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { RoleLoginPortal } from "../_components/role-login-portal";
import { StatCard } from "../_components/superadmin/stat-card";
import { getCurrentUser } from "../lib/auth";
import { formatBytes } from "../lib/format";
import { prisma } from "../lib/prisma";
import { hasRole, ROLES } from "../lib/roles";
import { loginSuperAdmin } from "../masuk/actions";

export const metadata: Metadata = { title: "Super Admin — Ruang Momen" };

export default async function SuperAdminPage({ searchParams }: { searchParams: Promise<{ oauth_error?: string | string[]; two_factor_error?: string | string[] }> }) {
  const user = await getCurrentUser();
  const { oauth_error: oauthError, two_factor_error: twoFactorError } = await searchParams;

  if (!user) {
    return (
      <RoleLoginPortal
        roleLabel="Super Admin"
        loginAction={loginSuperAdmin}
        oauthError={typeof oauthError === "string" ? oauthError : null}
        twoFactorError={typeof twoFactorError === "string" ? twoFactorError : null}
      />
    );
  }

  if (!hasRole(user, ROLES.SUPER_ADMIN)) {
    forbidden();
  }

  const [totalUsers, totalRooms, photoStats] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.photo.aggregate({ _count: { _all: true }, _sum: { sizeBytes: true } }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString("id-ID"), icon: "account" as const },
    { label: "Total Rooms", value: totalRooms.toLocaleString("id-ID"), icon: "spaces" as const },
    { label: "Total Moments", value: photoStats._count._all.toLocaleString("id-ID"), icon: "album" as const },
    { label: "Total Storage", value: formatBytes(photoStats._sum.sizeBytes ?? 0), icon: "billing" as const },
  ];

  return (
    <section className="mt-8" aria-labelledby="system-overview-title">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">System Overview</p><h2 id="system-overview-title" className="mt-2 text-xl font-bold">Platform statistics</h2><p className="mt-2 text-sm text-[#AEB8BE]">Data langsung dari database Ruang Momen.</p></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
      <article className="mt-6 rounded-[1.75rem] border border-[#D6B56F]/15 bg-[#0A1D30] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">Foundation V1</p><h2 className="mt-3 text-xl font-bold">Control center siap dikembangkan</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#AEB8BE]">Menu Users, Plans, Payments, Settings, dan Logs disiapkan sebagai jalur navigasi untuk fase berikutnya. Belum ada operasi pengelolaan data pada versi ini.</p></article>
    </section>
  );
}
