import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";
import { T } from "../_components/i18n-provider";

export const metadata: Metadata = { title: "Daftar — Ruang Momen" };

export default function DaftarPage() {
  return (
    <AuthShell eyebrow={<T k="auth.registerEyebrow" />} title={<T k="auth.registerTitle" />} description={<T k="auth.registerDescription" />}>
      <AuthForm mode="daftar" />
    </AuthShell>
  );
}
