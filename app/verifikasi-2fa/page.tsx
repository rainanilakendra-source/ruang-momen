import { redirect } from "next/navigation";
import { AuthShell } from "../_components/auth-shell";
import { getCurrentUser } from "../lib/auth";
import { getTwoFactorChallenge, parseTwoFactorPortal, TWO_FACTOR_TYPES, twoFactorFailure } from "../lib/two-factor";
import { VerifyTwoFactorForm } from "./verify-form";

export default async function VerifyTwoFactorPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const challenge = await getTwoFactorChallenge();
  const portal = challenge ? parseTwoFactorPortal(challenge.portal) : null;
  if (!challenge || !portal || challenge.type !== TWO_FACTOR_TYPES.VERIFY || challenge.expiresAt <= new Date()) redirect(`${portal ? twoFactorFailure(portal) : "/masuk"}?two_factor_error=expired`);
  return <AuthShell eyebrow="Two-Factor Authentication" title="Verifikasi Keamanan" description="Masukkan kode dari aplikasi authenticator atau gunakan recovery code."><VerifyTwoFactorForm /></AuthShell>;
}
