"use client";

import { useActionState, useState } from "react";
import { useI18n } from "../_components/i18n-provider";
import { verifySecondFactor, type VerifyTwoFactorState } from "./actions";

const initialState: VerifyTwoFactorState = { errorKey: null };

export function VerifyTwoFactorForm() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"totp" | "recovery">("totp");
  const [state, action, pending] = useActionState(verifySecondFactor, initialState);
  return <form action={action} className="mt-8 space-y-5"><input type="hidden" name="mode" value={mode} /><label className="block text-sm font-semibold text-[#E8E3D9]">{mode === "totp" ? t("twoFactor.authenticatorCode") : t("twoFactor.recoveryCode")}<input name="code" required autoComplete="one-time-code" inputMode={mode === "totp" ? "numeric" : "text"} pattern={mode === "totp" ? "[0-9]{6}" : undefined} maxLength={mode === "totp" ? 6 : 20} className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-center font-mono text-lg tracking-[.18em] outline-none focus:border-[#D6B56F]/60" placeholder={mode === "totp" ? "123456" : "XXXX-XXXX-XXXX"} /></label>{state.errorKey && <p role="alert" className="text-sm text-[#FFB4A9]">{t(state.errorKey)}</p>}<button disabled={pending} className="min-h-12 w-full rounded-xl bg-[#F5F0E7] px-5 font-bold text-[#071727] disabled:opacity-60">{t("twoFactor.verify")}</button><button type="button" onClick={() => setMode(mode === "totp" ? "recovery" : "totp")} className="w-full text-sm font-semibold text-[#D6B56F]">{mode === "totp" ? t("twoFactor.useRecoveryCode") : t("twoFactor.useAuthenticatorCode")}</button></form>;
}
