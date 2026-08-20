import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Daftar — Ruang Momen" };

export default function DaftarPage() {
  return (
    <AuthShell eyebrow="Daftar" title="Buat Ruang Momenmu." description="Mulai kumpulkan cerita dari setiap sudut acaramu.">
      <AuthForm mode="daftar" />
    </AuthShell>
  );
}
