import type { Metadata } from "next";
import Image from "next/image";
import { ContentPage } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Hubungi Kami | Ruang Momen",
  description: "Hubungi Ruang Momen untuk bantuan penggunaan, acara, akun, atau kerja sama.",
};

const kategoriKontak = [
  { nomor: "01", judul: "Bantuan Penggunaan", deskripsi: "Kesulitan membuat ruang atau menggunakan layanan?" },
  { nomor: "02", judul: "Kerja Sama", deskripsi: "Untuk vendor acara, wedding organizer, fotografer, atau kolaborasi lainnya." },
  { nomor: "03", judul: "Pertanyaan Akun", deskripsi: "Bantuan terkait akun, akses, atau data." },
  { nomor: "04", judul: "Lainnya", deskripsi: "Punya ide, kritik, atau sesuatu yang ingin disampaikan?" },
];

// TODO: Replace placeholder contact information before production
const kontakPlaceholder = [
  { label: "WhatsApp", nilai: "+62 812-3456-7890", ikon: "chat" },
  { label: "Email", nilai: "halo@ruangmomen.test", ikon: "email" },
  { label: "Instagram", nilai: "@ruangmomen.id", ikon: "instagram" },
  { label: "TikTok", nilai: "@ruangmomen.id", ikon: "musik" },
];

const inputClass = "mt-2 w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727]/70 px-4 py-3.5 text-sm text-[#F5F0E7] outline-none transition placeholder:text-[#AEB8BE]/45 focus:border-[#D6B56F]/55 focus:ring-2 focus:ring-[#D6B56F]/10";

function IkonKontak({ nama, className = "h-5 w-5" }: { nama: string; className?: string }) {
  const properti = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, "aria-hidden": true as const };
  if (nama === "email") return <svg {...properti}><rect x="3" y="5" width="18" height="14" rx="3" /><path strokeLinecap="round" strokeLinejoin="round" d="m5 8 7 5 7-5" /></svg>;
  if (nama === "instagram") return <svg {...properti}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.5" /><path strokeLinecap="round" d="M17.4 6.6h.01" /></svg>;
  if (nama === "musik") return <svg {...properti}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5v10.2a3.8 3.8 0 1 1-2-3.35V7l7-1.5v3L14 9.6" /></svg>;
  if (nama === "jam") return <svg {...properti}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" /></svg>;
  if (nama === "user") return <svg {...properti}><circle cx="12" cy="8.5" r="3.5" /><path strokeLinecap="round" d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6" /></svg>;
  if (nama === "topik") return <svg {...properti}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14v11H9l-4 3v-3H5V5Z" /><path strokeLinecap="round" d="M8 9h8m-8 3h5" /></svg>;
  if (nama === "pesan") return <svg {...properti}><path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-1-1.73V6a2 2 0 0 1 2-2Z" /></svg>;
  if (nama === "kirim") return <svg {...properti}><path strokeLinecap="round" strokeLinejoin="round" d="m3.5 11.5 17-8-6.5 17-2.6-6.3-7.9-2.7Zm7.9 2.7 3.7-3.7" /></svg>;
  return <svg {...properti}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5h3l1.5 4-2 1.5a14 14 0 0 0 4.5 4.5l1.5-2 4 1.5v3A2.5 2.5 0 0 1 17 19.5C10.1 19.5 4.5 13.9 4.5 7A2.5 2.5 0 0 1 7 4.5Z" /></svg>;
}

export default function KontakPage() {
  return (
    <ContentPage eyebrow="Hubungi Ruang Momen" title="Ada yang ingin dibicarakan?" description="Kami siap membantu pertanyaan tentang penggunaan Ruang Momen, acara, maupun kerja sama.">
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kategoriKontak.map((item) => <article key={item.nomor} className="rounded-[1.5rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6 shadow-[0_14px_34px_rgba(0,0,0,.1)]"><span className="font-serif text-2xl italic text-[#D6B56F]">{item.nomor}</span><h2 className="mt-7 text-lg font-bold">{item.judul}</h2><p className="mt-3 text-sm leading-6 text-[#AEB8BE]">{item.deskripsi}</p></article>)}</div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-8">
          <aside className="relative overflow-hidden rounded-[1.75rem] border border-[#D6B56F]/20 bg-[#102A42] p-6 shadow-[inset_0_1px_0_rgba(245,240,231,.035),0_18px_46px_rgba(0,0,0,.12)] sm:p-8"><Image src="/brand/ruang-momen-icon.png" alt="" width={512} height={512} className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 object-contain opacity-[.045]" /><div className="relative"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#D6B56F]"><IkonKontak nama="chat" /></span><p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">Informasi Kontak</p></div><h2 className="mt-5 text-2xl font-bold">Temukan kanal yang nyaman.</h2><div className="mt-8 divide-y divide-[#F5F0E7]/10">{kontakPlaceholder.map((item) => <div key={item.label} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-3 text-sm text-[#AEB8BE]"><span className="grid h-9 w-9 place-items-center rounded-lg border border-[#F5F0E7]/10 bg-[#071727]/35 text-[#D6B56F]"><IkonKontak nama={item.ikon} className="h-[18px] w-[18px]" /></span>{item.label}</span><span className="text-sm font-semibold text-[#F5F0E7]">{item.nilai}</span></div>)}</div><div className="mt-7 flex gap-3 rounded-xl border border-[#D6B56F]/15 bg-[#071727]/45 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#D6B56F]/10 text-[#D6B56F]"><IkonKontak nama="jam" /></span><div><p className="text-sm font-semibold">Jam bantuan</p><p className="mt-1 text-sm leading-6 text-[#AEB8BE]">Senin–Jumat<br />09.00–17.00 WIB</p></div></div><p className="mt-4 text-xs leading-5 text-[#AEB8BE]/70">Informasi kontak di halaman ini masih berupa data sementara.</p></div></aside>

          <form className="rounded-[1.75rem] border border-[#F5F0E7]/10 bg-[#0A1D30] p-6 shadow-[0_18px_46px_rgba(0,0,0,.12)] sm:p-8">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6B56F]/20 bg-[#D6B56F]/10 text-[#D6B56F]"><IkonKontak nama="pesan" /></span><p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">Kirim Pertanyaan</p></div><h2 className="mt-5 text-2xl font-bold">Ceritakan yang kamu butuhkan.</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-[#D9D6CE]"><span className="flex items-center gap-2"><IkonKontak nama="user" className="h-4 w-4 text-[#D6B56F]" />Nama</span><input className={inputClass} type="text" name="nama" placeholder="Nama kamu" /></label><label className="text-sm font-semibold text-[#D9D6CE]"><span className="flex items-center gap-2"><IkonKontak nama="email" className="h-4 w-4 text-[#D6B56F]" />Email</span><input className={inputClass} type="email" name="email" placeholder="nama@email.com" /></label></div>
            <label className="mt-5 block text-sm font-semibold text-[#D9D6CE]"><span className="flex items-center gap-2"><IkonKontak nama="topik" className="h-4 w-4 text-[#D6B56F]" />Topik</span><select className={inputClass} name="topik" defaultValue=""><option value="" disabled>Pilih topik</option><option>Bantuan penggunaan</option><option>Kerja sama</option><option>Akun &amp; data</option><option>Kritik &amp; saran</option><option>Lainnya</option></select></label>
            <label className="mt-5 block text-sm font-semibold text-[#D9D6CE]"><span className="flex items-center gap-2"><IkonKontak nama="pesan" className="h-4 w-4 text-[#D6B56F]" />Pesan</span><textarea className={`${inputClass} min-h-36 resize-y`} name="pesan" placeholder="Tulis pesanmu di sini" /></label>
            <button type="button" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F5F0E7] px-6 py-3.5 text-sm font-bold text-[#071727] shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_9px_24px_rgba(0,0,0,.14)] transition hover:-translate-y-0.5 hover:bg-[#D6B56F]"><IkonKontak nama="kirim" className="h-[18px] w-[18px]" />Kirim Pesan</button>
            <p className="mt-3 text-xs leading-5 text-[#AEB8BE]">Form kontak akan segera tersedia. Tombol ini belum mengirimkan pesan.</p>
          </form>
        </div>
      </section>
    </ContentPage>
  );
}
