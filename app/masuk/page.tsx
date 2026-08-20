import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Masuk — Ruang Momen" };

export default function MasukPage() {
  return (
    <AuthShell eyebrow="Masuk ke ruangmu" title="Kembali ke ruangmu." description="Lanjutkan mengelola acara, album, dan setiap momen yang sudah terkumpul.">
      <AuthForm mode="masuk" />
    </AuthShell>
  );
}
