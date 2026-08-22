import Link from "next/link";
import { T } from "./i18n-provider";

export function FeatureLocked() {
  return <section className="mt-8 rounded-[1.5rem] border border-[#D6B56F]/20 bg-[#0A1D30] p-7 text-center"><h2 className="text-xl font-bold text-[#F1DDA7]"><T k="planLimits.featureLocked" /></h2><p className="mt-3 text-sm text-[#AEB8BE]"><T k="planLimits.featureLockedDescription" /></p><Link href="/dashboard/paket" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#F5F0E7] px-5 text-sm font-bold text-[#071727]"><T k="planLimits.choosePlan" /></Link></section>;
}
