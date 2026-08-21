export function SuperAdminHeader({ userName }: { userName: string }) {
  const initials = userName.split(/\s+/u).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toUpperCase()).join("") || "SA";

  return (
    <header className="flex flex-col gap-5 border-b border-[#F5F0E7]/[.08] pb-7 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#D6B56F]">Control Center</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">Super Admin</h1><p className="mt-2 text-sm leading-6 text-[#AEB8BE]">Ringkasan operasional Ruang Momen.</p></div>
      <div className="flex items-center gap-3 self-start rounded-xl border border-[#D6B56F]/15 bg-[#0A1D30] py-1.5 pr-4 pl-1.5 sm:self-auto"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#D6B56F]/12 font-serif text-sm italic text-[#D6B56F]">{initials}</span><div><p className="text-sm font-semibold">{userName}</p><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#D6B56F]">Super Admin</p></div></div>
    </header>
  );
}
