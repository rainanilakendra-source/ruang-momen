import { redirect } from "next/navigation";
import { AuthShell } from "../_components/auth-shell";
import { getCurrentUser } from "../lib/auth";
import { generateQrDataUrl } from "../lib/qr";
import { decryptTwoFactorSecret, generateTotp, getTwoFactorChallenge, parseTwoFactorPortal, TWO_FACTOR_TYPES, twoFactorFailure } from "../lib/two-factor";
import { SetupTwoFactorForm } from "./setup-form";

export default async function SetupTwoFactorPage() {
  const challenge = await getTwoFactorChallenge();
  const currentUser = await getCurrentUser();
  const portal = challenge ? parseTwoFactorPortal(challenge.portal) : null;
  if (!challenge || !portal || challenge.type !== TWO_FACTOR_TYPES.ENROLL || !challenge.secretEncrypted || challenge.expiresAt <= new Date() || (currentUser && currentUser.id !== challenge.userId)) redirect(`${portal ? twoFactorFailure(portal) : "/masuk"}?two_factor_error=expired`);
  const secret = decryptTwoFactorSecret(challenge.secretEncrypted);
  const uri = generateTotp(challenge.user.email, secret).toString();
  const qrDataUrl = await generateQrDataUrl(uri);
  return <AuthShell eyebrow="Two-Factor Authentication" title="Aktifkan 2FA" description="Pindai QR menggunakan aplikasi authenticator, lalu masukkan kode enam digit."><SetupTwoFactorForm qrDataUrl={qrDataUrl} manualKey={secret} /></AuthShell>;
}
