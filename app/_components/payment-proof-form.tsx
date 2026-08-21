"use client";

import { useActionState } from "react";
import { uploadPaymentProof, type ProofState } from "../dashboard/orders/actions";
import { useI18n } from "./i18n-provider";

export function PaymentProofForm({ orderId }: { orderId: string }) {
  const { t } = useI18n();
  const action = uploadPaymentProof.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, { error: null, success: false } satisfies ProofState);
  return <form action={formAction} className="mt-5 space-y-4"><input type="file" name="proof" required accept="image/jpeg,image/png,image/webp" className="block w-full rounded-xl border border-[#F5F0E7]/10 p-3 text-sm" /><textarea name="note" maxLength={1000} placeholder={t("orders.proofNote")} className="w-full rounded-xl border border-[#F5F0E7]/10 bg-[#071727] p-3 text-sm" />{state.error && <p className="text-sm text-red-300">{t(state.error)}</p>}{state.success && <p className="text-sm text-emerald-300">{t("orders.proofSent")}</p>}<button disabled={pending} className="min-h-11 rounded-xl bg-[#D6B56F] px-5 font-bold text-[#071727]">{pending ? t("orders.uploading") : t("payments.uploadProof")}</button></form>;
}
