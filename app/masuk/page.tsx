import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";
import { T } from "../_components/i18n-provider";

export const metadata: Metadata = { title: "Masuk — Ruang Momen" };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[] }>;
}) {
  const { registered } = await searchParams;

  return (
    <AuthShell eyebrow={<T k="auth.loginEyebrow" />} title={<T k="auth.loginTitle" />} description={<T k="auth.loginDescription" />}>
      {registered === "1" && (
        <p role="status" className="mt-8 rounded-xl border border-[#D6B56F]/25 bg-[#D6B56F]/10 px-4 py-3 text-sm text-[#F1DDA7]">
          <T k="auth.registered" />
        </p>
      )}
      <AuthForm mode="masuk" />
    </AuthShell>
  );
}
