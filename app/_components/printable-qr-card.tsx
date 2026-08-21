import Image from "next/image";

export function PrintableQrCard({ eventName, guestUrl, qrSvg, modeLabel }: { eventName: string; guestUrl: string; qrSvg: string; modeLabel: string }) {
  return (
    <article className="printable-qr-card mx-auto flex aspect-[148/210] w-full max-w-[148mm] flex-col items-center overflow-hidden rounded-[1.5rem] border border-[#D6B56F]/30 bg-[#071727] px-[10%] py-[7%] text-center text-[#F5F0E7] shadow-[0_24px_70px_rgba(0,0,0,.28)]">
      <Image src="/brand/ruang-momen-logo.png" alt="Ruang Momen" width={1973} height={644} className="h-auto w-[48%] object-contain" priority />
      <p className="mt-[5%] text-[clamp(.55rem,1.3vw,.72rem)] font-bold uppercase tracking-[.24em] text-[#D6B56F]">Momen dari setiap sudut</p>
      <h1 className="mt-[3%] max-w-[95%] text-[clamp(1.35rem,4vw,2.25rem)] leading-tight font-extrabold tracking-[-.04em]">{eventName}</h1>
      <p className="mt-[4%] font-serif text-[clamp(1.1rem,3vw,1.7rem)] leading-tight italic text-[#F1DDA7]">Bagikan momennya dari sudutmu.</p>
      <p className="mt-[2%] text-[clamp(.62rem,1.5vw,.82rem)] leading-relaxed text-[#D9D6CE]">Scan QR ini dari HP. Tidak perlu instal aplikasi.</p>
      <div className="mt-[5%] w-[61%] rounded-[1.15rem] border-[3px] border-[#D6B56F]/65 bg-[#FFFDF7] p-[3.5%] shadow-[0_15px_42px_rgba(0,0,0,.25)] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      <p className="mt-[2%] text-[clamp(.5rem,1.2vw,.68rem)] font-bold tracking-[.15em] text-[#F1DDA7]">{modeLabel}</p>
      <p className="mt-[3%] text-[clamp(.55rem,1.3vw,.72rem)] font-bold uppercase tracking-[.19em] text-[#D6B56F]">Scan · Masuk · Bagikan</p>
      <p className="mt-[2%] max-w-full break-all text-[clamp(.48rem,1.15vw,.66rem)] text-[#AEB8BE]">{guestUrl}</p>
      <p className="mt-auto border-t border-[#D6B56F]/25 pt-[4%] font-serif text-[clamp(.72rem,1.8vw,1rem)] italic text-[#F5F0E7]">Satu acara. Banyak sudut. Satu cerita.</p>
    </article>
  );
}
