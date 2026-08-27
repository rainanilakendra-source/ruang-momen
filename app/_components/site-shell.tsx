import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { T } from "./i18n-provider";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#D6B56F]/20 bg-[#071727]/95 shadow-[0_8px_28px_rgba(0,0,0,.1)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-center px-5 sm:h-[68px] sm:px-8 lg:h-20 lg:justify-between lg:px-12" aria-label="Navigasi halaman">
        <Link href="/" aria-label="Beranda Ruang Momen">
          <span className="relative isolate flex items-center justify-center">
            <Image src="/brand/ruang-momen-header-logo.png" alt="" width={1916} height={821} className="pointer-events-none absolute h-16 w-auto object-contain opacity-[.07] blur-[1px] sm:h-[68px] lg:h-20" aria-hidden="true" />
            <Image src="/brand/ruang-momen-header-logo.png" alt="Ruang Momen" width={1916} height={821} className="relative h-14 w-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,.16)] sm:h-[60px] lg:h-[68px]" priority />
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-[#D9D6CE] md:flex lg:text-base">
          <Link href="/" className="transition-colors hover:text-[#F5F0E7]"><T k="navigation.home" /></Link>
          <Link href="/privasi" className="transition-colors hover:text-[#D6B56F]"><T k="ui.privacy" /></Link>
          <Link href="/syarat" className="transition-colors hover:text-[#D6B56F]"><T k="ui.terms" /></Link>
          <Link href="/kontak" className="transition-colors hover:text-[#D6B56F]"><T k="ui.contact" /></Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#F5F0E7]/[.08] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex"><Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-12 w-auto object-contain" /></Link>
          <p className="mt-4 text-sm leading-6 text-[#AEB8BE]"><T k="footer.tagline" /></p>
        </div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#F5F0E7]">Jelajahi</h2><div className="mt-4 flex flex-col gap-3 text-sm text-[#AEB8BE]"><Link href="/#cara-kerja" className="hover:text-[#F5F0E7]">Alur</Link><Link href="/#contoh-album" className="hover:text-[#F5F0E7]">Inspirasi</Link><Link href="/#fitur" className="hover:text-[#F5F0E7]">Keunggulan</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#F5F0E7]">Bantuan</h2><div className="mt-4 flex flex-col gap-3 text-sm text-[#AEB8BE]"><Link href="/#faq" className="hover:text-[#F5F0E7]">Pertanyaan Umum</Link><Link href="/privasi" className="hover:text-[#F5F0E7]">Kebijakan Privasi</Link><Link href="/syarat" className="hover:text-[#F5F0E7]">Syarat &amp; Ketentuan</Link><Link href="/kontak" className="hover:text-[#F5F0E7]">Kontak</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#F5F0E7]">Ruang Momen</h2><p className="mt-4 text-sm leading-6 text-[#AEB8BE]">Ruang bersama untuk menyimpan cerita dari setiap sudut acara.</p></div>
        <p className="flex flex-wrap items-baseline gap-x-1.5 border-t border-[#F5F0E7]/[.08] pt-6 text-sm text-[#AEB8BE]/70 sm:col-span-2 lg:col-span-4"><span>© 2026 Ruang Momen. Semua hak dilindungi ·</span><span className="font-serif text-base font-normal italic tracking-[.04em] text-[#D6B56F]">iNcroet</span></p>
      </div>
    </footer>
  );
}

export function ContentPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#071727] text-[#F5F0E7]">
      <SiteHeader />
      <section className="border-b border-[#F5F0E7]/[.08] bg-[#0A1D30]/45 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#D6B56F]">{eyebrow}</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.045em] sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#AEB8BE] sm:text-lg sm:leading-8">{description}</p></div>
      </section>
      {children}
      <SiteFooter />
    </main>
  );
}

export function LegalArticle({ children }: { children: ReactNode }) {
  return <article className="mx-auto max-w-4xl space-y-10 px-5 py-16 sm:px-8 sm:py-20 lg:px-0 lg:py-24 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#F5F0E7] [&_p]:mt-3 [&_p]:leading-8 [&_p]:text-[#AEB8BE] [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[#AEB8BE] [&_li]:list-disc [&_li]:leading-7">{children}</article>;
}
