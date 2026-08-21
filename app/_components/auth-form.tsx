"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { registerUser, type RegisterState } from "../daftar/actions";
import { loginUser, type LoginState } from "../masuk/actions";
import { AppIcon, type AppIconName } from "./app-icons";
import { useI18n } from "./i18n-provider";

type AuthMode = "masuk" | "daftar";

const inputClass = "w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727]/70 px-11 py-3.5 text-sm text-[#F5F0E7] outline-none transition placeholder:text-[#AEB8BE]/45 hover:border-[#F5F0E7]/20 focus:border-[#D6B56F]/65 focus:ring-4 focus:ring-[#D6B56F]/10";

function Field({ label, name, type = "text", autoComplete, icon, placeholder, minLength, maxLength }: { label: string; name: string; type?: string; autoComplete: string; icon: AppIconName; placeholder?: string; minLength?: number; maxLength?: number }) {
  return (
    <label className="block text-sm font-semibold text-[#E8E3D9]">
      {label}
      <span className="relative mt-2 block">
        <AppIcon name={icon} className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[#AEB8BE]" />
        <input className={inputClass} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} minLength={minLength} maxLength={maxLength} required />
      </span>
    </label>
  );
}

const initialRegisterState: RegisterState = { error: null };
const initialLoginState: LoginState = { error: null };

export function AuthForm({ mode }: { mode: AuthMode }) {
  const { t } = useI18n();
  const isLogin = mode === "masuk";
  const [registerState, registerAction, isPending] = useActionState(
    registerUser,
    initialRegisterState,
  );
  const [loginState, loginAction, isLoginPending] = useActionState(
    loginUser,
    initialLoginState,
  );
  const authState = isLogin ? loginState : registerState;
  const pending = isLogin ? isLoginPending : isPending;
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (authState.error) {
      errorRef.current?.focus({ preventScroll: true });
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [authState]);

  return (
    <form className="mt-8 space-y-5" action={isLogin ? loginAction : registerAction} noValidate>
      {!isLogin && <Field label={t("auth.name")} name="name" autoComplete="name" icon="user" placeholder={t("auth.fullName")} minLength={2} maxLength={80} />}
      <Field label={t("auth.email")} name="email" type="email" autoComplete="email" icon="mail" placeholder="nama@email.com" maxLength={254} />
      <div>
        <Field label={t("auth.password")} name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} icon="lock" placeholder={t("auth.passwordPlaceholder")} minLength={isLogin ? undefined : 10} maxLength={isLogin ? undefined : 128} />
        {isLogin && <div className="mt-2 text-right"><button type="button" className="text-xs font-semibold text-[#D6B56F] transition hover:text-[#F1DDA7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">{t("auth.forgotPassword")}</button></div>}
      </div>
      {!isLogin && <Field label={t("auth.confirmPassword")} name="passwordConfirmation" type="password" autoComplete="new-password" icon="lock" placeholder={t("auth.repeatPassword")} minLength={10} maxLength={128} />}

      {authState.error && (
        <p ref={errorRef} role="alert" aria-live="assertive" tabIndex={-1} className="rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100 outline-none">
          {authState.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727] shadow-[0_10px_24px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0">
        {isLogin ? pending ? t("auth.loggingIn") : t("auth.login") : pending ? t("auth.registering") : t("auth.register")}
      </button>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[.16em] text-[#AEB8BE]/65"><span className="h-px flex-1 bg-[#F5F0E7]/10" />{t("auth.or")}<span className="h-px flex-1 bg-[#F5F0E7]/10" /></div>

      <button type="button" className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#F5F0E7]/12 bg-[#F5F0E7]/[.035] px-5 text-sm font-semibold text-[#F5F0E7] transition hover:border-[#D6B56F]/35 hover:bg-[#F5F0E7]/[.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#F5F0E7] text-[11px] font-extrabold text-[#071727]" aria-hidden="true">G</span>
        {isLogin ? t("auth.googleLogin") : t("auth.googleRegister")}
      </button>

      <p className="pt-1 text-center text-sm text-[#AEB8BE]">
        {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
        <Link href={isLogin ? "/daftar" : "/masuk"} className="font-bold text-[#D6B56F] transition hover:text-[#F1DDA7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">
          {isLogin ? t("auth.createAccount") : t("auth.loginLink")}
        </Link>
      </p>
    </form>
  );
}
