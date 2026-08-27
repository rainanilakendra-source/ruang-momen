"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "./i18n-provider";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: ReactNode; title: ReactNode; description: ReactNode; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#071727] px-5 py-8 text-[#F5F0E7] sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,.9fr)_minmax(28rem,1.1fr)] lg:gap-12 lg:px-12">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#D6B56F]/[.055] blur-[110px]" />
      <section className="relative hidden flex-col justify-between rounded-[2rem] border border-[#D6B56F]/15 bg-[#0A1D30]/70 p-10 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_24px_70px_rgba(0,0,0,.16)] lg:flex xl:p-14">
        <Link href="/" className="mx-auto w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]" aria-label={t("ui.homeAria")}>
          <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-16 w-auto object-contain" priority />
        </Link>
        <div className="w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#D6B56F]">{t("ui.authEyebrow")}</p>
          <p className="mt-5 font-serif text-4xl leading-[1.35] italic text-[#F5F0E7] xl:text-5xl">{t("ui.authQuote")}</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#AEB8BE]"><span className="h-px w-10 bg-[#D6B56F]/55" />Ruang Momen</div>
        </div>
        <p className="text-xs text-[#AEB8BE]/65">{t("footer.tagline")}</p>
      </section>

      <section className="relative flex items-center justify-center py-4 lg:py-8">
        <div className="w-full max-w-[32rem]">
          <Link href="/" className="mx-auto mb-8 block w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F] lg:hidden" aria-label={t("ui.homeAria")}>
            <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-14 w-auto object-contain" priority />
          </Link>
          <div className="rounded-[1.75rem] border border-[#F5F0E7]/10 bg-[#0A1D30]/90 p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_22px_60px_rgba(0,0,0,.2)] sm:p-10">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">{eyebrow}</p>
              <h1 className="mx-auto mt-4 max-w-sm text-[1.75rem] leading-[1.18] font-extrabold tracking-[-.04em] sm:mx-0 sm:text-[2.125rem]">{title}</h1>
              <p className="mx-auto mt-4 max-w-[25rem] text-sm leading-6 text-[#AEB8BE] sm:mx-0 sm:max-w-[27rem] sm:text-base sm:leading-7">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
