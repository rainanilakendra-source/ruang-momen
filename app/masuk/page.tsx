import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Masuk — Ruang Momen" };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[] }>;
}) {
  const { registered } = await searchParams;

  return (
    <AuthShell eyebrow="Masuk ke ruangmu" title="Kembali ke ruangmu." description="Lanjutkan mengelola acara, album, dan setiap momen yang sudah terkumpul.">
      {registered === "1" && (
        <p role="status" className="mt-8 rounded-xl border border-[#D6B56F]/25 bg-[#D6B56F]/10 px-4 py-3 text-sm text-[#F1DDA7]">
          Akun berhasil dibuat. Silakan masuk ke ruangmu.
        </p>
      )}
      <AuthForm mode="masuk" />
    </AuthShell>
  );
}
