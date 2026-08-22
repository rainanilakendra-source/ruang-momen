"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../_components/i18n-provider";
import { logoutUser } from "../actions";
import { changePassword, updateProfile, type AccountActionState } from "./actions";

const initialState: AccountActionState = { status: "idle", messageKey: null };
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] px-4 text-[#F5F0E7] outline-none transition focus:border-[#D6B56F]/60";

function Feedback({ state }: { state: AccountActionState }) {
  const { t } = useI18n();
  if (!state.messageKey) return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`mt-4 text-sm ${state.status === "error" ? "text-[#FFB4A9]" : "text-[#F1DDA7]"}`}>{t(state.messageKey)}</p>;
}

export function AccountForms({ account }: { account: { name: string; email: string; role: string; createdAt: string; planName: string | null; subscriptionStatus: string | null } }) {
  const { t, language } = useI18n();
  const router = useRouter();
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, initialState);

  useEffect(() => { if (profileState.status === "success") router.refresh(); }, [profileState.status, router]);

  return <div className="mt-8 grid gap-5 xl:grid-cols-2">
    <section className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6 sm:p-7"><h2 className="text-xl font-bold">{t("account.profile")}</h2><form action={profileAction} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-[#D9D6CE]">{t("account.name")}<input name="name" defaultValue={account.name} required minLength={2} maxLength={80} autoComplete="name" className={inputClass} /></label><label className="block text-sm font-semibold text-[#D9D6CE]">{t("account.email")}<input name="email" type="email" defaultValue={account.email} required maxLength={254} autoComplete="email" className={inputClass} /></label><button disabled={profilePending} className="min-h-11 rounded-xl bg-[#D6B56F] px-5 font-bold text-[#071727] disabled:opacity-60">{profilePending ? t("account.saving") : t("account.saveChanges")}</button><Feedback state={profileState} /></form></section>
    <section className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6 sm:p-7"><h2 className="text-xl font-bold">{t("account.security")}</h2><form action={passwordAction} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-[#D9D6CE]">{t("account.currentPassword")}<input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} /></label><label className="block text-sm font-semibold text-[#D9D6CE]">{t("account.newPassword")}<input name="newPassword" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></label><label className="block text-sm font-semibold text-[#D9D6CE]">{t("account.confirmPassword")}<input name="passwordConfirmation" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></label><button disabled={passwordPending} className="min-h-11 rounded-xl bg-[#D6B56F] px-5 font-bold text-[#071727] disabled:opacity-60">{passwordPending ? t("account.changingPassword") : t("account.changePassword")}</button><Feedback state={passwordState} /></form></section>
    <section className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6 sm:p-7 xl:col-span-2"><h2 className="text-xl font-bold">{t("account.information")}</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs uppercase tracking-wider text-[#AEB8BE]">{t("account.role")}</dt><dd className="mt-1 font-semibold">{account.role}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[#AEB8BE]">{t("account.joinedAt")}</dt><dd className="mt-1 font-semibold">{new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { dateStyle: "long" }).format(new Date(account.createdAt))}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[#AEB8BE]">{t("account.activePlan")}</dt><dd className="mt-1 font-semibold">{account.planName ?? t("account.noActivePlan")}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[#AEB8BE]">{t("account.subscriptionStatus")}</dt><dd className="mt-1 font-semibold">{account.subscriptionStatus ? t(`subscription.${account.subscriptionStatus.toLowerCase()}`) : "—"}</dd></div></dl><form action={logoutUser} className="mt-7 border-t border-[#F5F0E7]/10 pt-6"><button className="min-h-11 rounded-xl border border-[#D6B56F]/30 px-5 font-bold text-[#F1DDA7] transition hover:bg-[#D6B56F]/10">{t("account.logout")}</button></form></section>
  </div>;
}
