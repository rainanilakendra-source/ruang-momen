"use client";

import { useActionState, useRef, useState } from "react";
import { uploadGuestPhoto, type UploadPhotoState } from "./actions";

const initialUploadPhotoState: UploadPhotoState = { status: "idle", message: null };

export function GuestPhotoUploader({ slug }: { slug: string }) {
  const [resetKey, setResetKey] = useState(0);
  return <Uploader key={resetKey} slug={slug} onReset={() => setResetKey((key) => key + 1)} />;
}

function Uploader({ slug, onReset }: { slug: string; onReset: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(uploadGuestPhoto.bind(null, slug), initialUploadPhotoState);
  if (state.status === "success") return <div className="mt-8" role="status"><p className="text-sm font-semibold text-[#F1DDA7]">{state.message}</p><button type="button" onClick={onReset} className="mt-5 min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Kirim Momen Lagi</button></div>;

  const submitSelection = () => formRef.current?.requestSubmit();
  const controlClass = `inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-bold transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#D6B56F] ${pending ? "pointer-events-none opacity-60" : "hover:-translate-y-0.5"}`;
  return (
    <form ref={formRef} action={action} className="mt-8">
      <fieldset disabled={pending} className="flex flex-wrap justify-center gap-3">
        <legend className="sr-only">Pilih sumber foto</legend>
        <label className={`${controlClass} bg-[#F5F0E7] text-[#071727]`}><input type="file" name="cameraPhoto" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={submitSelection} />{pending ? "Mengirim momen..." : "Ambil Foto"}</label>
        <label className={`${controlClass} border border-[#D6B56F]/35 bg-[#D6B56F]/[.08] text-[#F1DDA7]`}><input type="file" name="galleryPhoto" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={submitSelection} />{pending ? "Mohon tunggu..." : "Pilih dari Galeri"}</label>
      </fieldset>
      {state.status === "error" && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{state.message}</p>}
      <p className="mt-4 text-xs text-[#AEB8BE]">JPEG, PNG, atau WebP · Maksimal 10 MB</p>
    </form>
  );
}
