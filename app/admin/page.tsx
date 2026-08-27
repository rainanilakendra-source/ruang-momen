import Link from "next/link";
import { forbidden } from "next/navigation";
import { RoleLoginPortal } from "../_components/role-login-portal";
import { getCurrentUser } from "../lib/auth";
import { ADMIN_ROLES, hasRole } from "../lib/roles";
import { loginAdmin } from "../masuk/actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ oauth_error?: string | string[]; two_factor_error?: string | string[] }> }) {
  const user = await getCurrentUser();
  const { oauth_error: oauthError, two_factor_error: twoFactorError } = await searchParams;

  if (!user) {
    return <RoleLoginPortal roleLabel="Admin" loginAction={loginAdmin} oauthError={typeof oauthError === "string" ? oauthError : null} twoFactorError={typeof twoFactorError === "string" ? twoFactorError : null} />;
  }

  if (!hasRole(user, ADMIN_ROLES)) {
    forbidden();
  }

  return (
    <main className="min-h-screen bg-[#071727] p-6 text-[#F5F0E7] sm:p-10">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D6B56F]">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold">Dashboard Admin</h1>
        <p className="mt-3 text-sm text-[#AEB8BE]">
          Panel operasional Ruang Momen.
        </p>

        <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Navigasi admin">
          <Link
            href="/admin"
            aria-current="page"
            className="rounded-2xl border border-[#D6B56F]/20 bg-[#D6B56F]/10 p-5 font-bold text-[#F1DDA7]"
          >
            Dashboard Admin
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-[#F5F0E7]/10 bg-[#0A1D30] p-5 font-bold transition hover:border-[#D6B56F]/30 hover:text-[#F1DDA7]"
          >
            Pesanan / Orders
          </Link>
        </nav>
      </section>
    </main>
  );
}
