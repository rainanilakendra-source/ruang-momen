"use client";

import { useActionState } from "react";
import { useI18n } from "../_components/i18n-provider";
import { confirmTwoFactorSetup, type SetupTwoFactorState } from "./actions";

const initialState: SetupTwoFactorState = { errorKey: null, recoveryCodes: null, destination: null };

export function SetupTwoFactorForm({ qrDataUrl, manualKey }: { qrDataUrl: string; manualKey: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(confirmTwoFactorSetup, initialState);
  if (state.recoveryCodes) return <section className="mt-8"><h2 className="text-xl font-bold">{t("twoFactor.recoveryCodes")}</h2><p className="mt-2 text-sm text-[#AEB8BE]">{t("twoFactor.saveCodes")}</p><ul className="mt-5 grid gap-2 sm:grid-cols-2">{state.recoveryCodes.map((code) => <li key={code} className="rounded-lg bg-[#071727] px-4 py-3 text-center font-mono tracking-wider">{code}</li>)}</ul><a href={state.destination ?? "/dashboard"} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#D6B56F] px-5 font-bold text-[#071727]">{t("twoFactor.continue")}</a></section>;
  return <form action={action} className="mt-8 space-y-5"><div className="mx-auto w-fit rounded-xl bg-white p-3"><img src={qrDataUrl} alt={t("twoFactor.qrAlt")} className="h-52 w-52" /></div><div><p className="text-sm text-[#AEB8BE]">{t("twoFactor.manualKey")}</p><code className="mt-2 block break-all rounded-lg bg-[#071727] p-3 text-sm text-[#F1DDA7]">{manualKey}</code></div><label className="block text-sm font-semibold">{t("twoFactor.authenticatorCode")}<input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-center font-mono text-lg tracking-[.18em] outline-none focus:border-[#D6B56F]/60" placeholder="123456" /></label>{state.errorKey && <p role="alert" className="text-sm text-[#FFB4A9]">{t(state.errorKey)}</p>}<button disabled={pending} className="min-h-12 w-full rounded-xl bg-[#F5F0E7] px-5 font-bold text-[#071727] disabled:opacity-60">{t("twoFactor.verify")}</button></form>;
}
