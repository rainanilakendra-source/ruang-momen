import { AppIcon, type AppIconName } from "../app-icons";

export function StatCard({ label, value, icon }: { label: string; value: string; icon: AppIconName }) {
  return (
    <article className="rounded-[1.35rem] border border-[#F5F0E7]/[.08] bg-[#0A1D30] p-5 shadow-[inset_0_1px_0_rgba(245,240,231,.025),0_14px_34px_rgba(0,0,0,.12)]">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#D6B56F]/15 bg-[#D6B56F]/[.07] text-[#D6B56F]"><AppIcon name={icon} className="h-5 w-5" /></span>
      <p className="mt-6 text-3xl font-extrabold tracking-[-.04em]">{value}</p>
      <h2 className="mt-1 text-sm font-semibold text-[#AEB8BE]">{label}</h2>
    </article>
  );
}
