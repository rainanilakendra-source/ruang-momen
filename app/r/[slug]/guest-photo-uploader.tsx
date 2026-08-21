"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadGuestPhoto, type UploadPhotoState } from "./actions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, PHOTO_ACCEPT } from "../../lib/upload";
import type { QrMode } from "../../lib/qr";

const initialUploadPhotoState: UploadPhotoState = { status: "idle", message: null };
type UploadMethod = "camera" | "gallery";

export function GuestPhotoUploader({ slug, mode }: { slug: string; mode: QrMode }) {
  const formRef = useRef<HTMLFormElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<UploadMethod | null>(null);
  const [state, action, pending] = useActionState(uploadGuestPhoto.bind(null, slug), initialUploadPhotoState);

  useEffect(() => {
    if (!pending) submittingRef.current = false;
    if (state.status === "success") {
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }, [pending, state.status]);

  const submitSelection = (method: UploadMethod) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      setClientError(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      input.value = "";
      setClientError(`Ukuran foto maksimal ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    if (submittingRef.current) return;

    submittingRef.current = true;
    setActiveMethod(method);
    setClientError(null);
    formRef.current?.requestSubmit();
  };

  const retryUpload = () => {
    if (pending || submittingRef.current) return;
    submittingRef.current = true;
    setClientError(null);
    formRef.current?.requestSubmit();
  };

  const openPicker = (method: UploadMethod) => {
    if (pending || submittingRef.current) return;
    const input = method === "camera" ? cameraInputRef.current : galleryInputRef.current;
    if (!input) return;
    input.value = "";
    setClientError(null);
    input.click();
  };

  const primaryMethod: UploadMethod = mode === "gallery" ? "gallery" : "camera";
  const inputAccept = mode === "general" ? PHOTO_ACCEPT : "image/*";
  const controlClass = `inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-bold transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#D6B56F] ${pending ? "pointer-events-none opacity-60" : "hover:-translate-y-0.5"}`;
  const controlTone = (method: UploadMethod) => method === primaryMethod
    ? "bg-[#F5F0E7] text-[#071727]"
    : "border border-[#D6B56F]/35 bg-[#D6B56F]/[.08] text-[#F1DDA7]";
  const cameraControl = (
    <label key="camera" className={`${controlClass} ${controlTone("camera")}`}>
      <input ref={cameraInputRef} type="file" name="cameraPhoto" accept={inputAccept} capture="environment" className="sr-only" onChange={submitSelection("camera")} />
      {pending && activeMethod === "camera" ? "Mengirim momen..." : "Ambil Foto"}
    </label>
  );
  const galleryControl = (
    <label key="gallery" className={`${controlClass} ${controlTone("gallery")}`}>
      <input ref={galleryInputRef} type="file" name="galleryPhoto" accept={inputAccept} className="sr-only" onChange={submitSelection("gallery")} />
      {pending && activeMethod === "gallery" ? "Mengirim momen..." : "Pilih dari Galeri"}
    </label>
  );
  const cameraSuccess = state.status === "success" && activeMethod === "camera" && !pending;
  const gallerySuccess = state.status === "success" && activeMethod === "gallery" && !pending;
  const serverError = state.status === "error" && !pending ? state.message : null;

  return (
    <form ref={formRef} action={action} className="mt-8" onSubmit={() => { submittingRef.current = true; }}>
      {cameraSuccess ? (
        <div role="status" aria-live="polite">
          <p className="font-serif text-2xl italic text-[#F1DDA7] sm:text-3xl">Momenmu sudah masuk ✨</p>
          <p className="mt-3 text-sm leading-6 text-[#AEB8BE]">Terima kasih sudah ikut mengisi ruang ini.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => openPicker("camera")} className="min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Ambil Foto Lagi</button>
            <button type="button" onClick={() => openPicker("gallery")} className="min-h-12 rounded-xl border border-[#D6B56F]/35 bg-[#D6B56F]/[.08] px-7 text-sm font-bold text-[#F1DDA7] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Pilih dari Galeri</button>
          </div>
        </div>
      ) : gallerySuccess ? (
        <div role="status" aria-live="polite">
          <p className="text-sm font-semibold text-[#F1DDA7]">{state.message}</p>
          <button type="button" onClick={() => openPicker("gallery")} className="mt-5 min-h-12 rounded-xl bg-[#F5F0E7] px-7 text-sm font-bold text-[#071727] transition hover:bg-[#D6B56F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Kirim Momen Lagi</button>
        </div>
      ) : (
        <fieldset disabled={pending} className="flex flex-wrap justify-center gap-3">
          <legend className="sr-only">Pilih sumber foto</legend>
          {mode === "gallery" ? [galleryControl, cameraControl] : [cameraControl, galleryControl]}
        </fieldset>
      )}

      {(cameraSuccess || gallerySuccess) && <div className="hidden">{cameraControl}{galleryControl}</div>}

      <div aria-live="polite" aria-atomic="true">
        {pending && <p className="mt-4 text-sm font-semibold text-[#F1DDA7]">Mengirim momen...</p>}
        {serverError && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{activeMethod === "camera" ? "Foto gagal dikirim. Silakan coba lagi." : serverError}</p>}
        {clientError && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{clientError}</p>}
      </div>

      {serverError && (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={retryUpload} className="min-h-12 rounded-xl bg-[#F5F0E7] px-6 text-sm font-bold text-[#071727] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">Coba Lagi</button>
          <button type="button" onClick={() => openPicker(activeMethod ?? primaryMethod)} className="min-h-12 rounded-xl border border-[#D6B56F]/35 px-6 text-sm font-bold text-[#F1DDA7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B56F]">{activeMethod === "gallery" ? "Pilih Foto Baru" : "Ambil Foto Baru"}</button>
        </div>
      )}

      {!cameraSuccess && !gallerySuccess && <p className="mt-4 text-xs text-[#AEB8BE]">JPEG, PNG, atau WebP · Maksimal {MAX_UPLOAD_MB} MB</p>}
    </form>
  );
}
