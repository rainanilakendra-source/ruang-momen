"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { uploadGuestPhoto } from "./actions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, PHOTO_ACCEPT } from "../../lib/upload";
import { MAX_GUEST_NAME_LENGTH, validateGuestName } from "../../lib/guest-name";
import {
  addUploadQueueItems,
  deleteUploadQueueItem,
  getEventUploadQueue,
  putUploadQueueItem,
  type UploadQueueItem,
} from "../../lib/upload-queue";
import type { QrMode } from "../../lib/qr";
import { useI18n } from "../../_components/i18n-provider";

type UploadMethod = "camera" | "gallery";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_GALLERY_SELECTION = 20;
const MAX_AUTOMATIC_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 30_000];

function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function createClientUploadId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function GuestPhotoUploader({ slug, mode, source }: { slug: string; mode: QrMode; source: string | null }) {
  const { language } = useI18n();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const processorActiveRef = useRef(false);
  const wakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const online = useSyncExternalStore(subscribeToOnlineStatus, getOnlineSnapshot, () => true);
  const [guestName, setGuestName] = useState("");
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [enqueueing, setEnqueueing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);

  const loadQueue = useCallback(async () => {
    const queue = await getEventUploadQueue(slug);
    if (mountedRef.current) setItems(queue);
    return queue;
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    void (async () => {
      try {
        const queue = await getEventUploadQueue(slug);
        if (cancelled) return;
        const interrupted = queue.filter((item) => item.status === "uploading");
        await Promise.all(interrupted.map((item) => putUploadQueueItem({ ...item, status: "queued", nextAttemptAt: 0 })));
        if (!cancelled && mountedRef.current) setItems(interrupted.length ? await getEventUploadQueue(slug) : queue);
      } catch {
        if (!cancelled && mountedRef.current) setClientError("Antrean browser tidak tersedia. Foto belum disimpan.");
      } finally {
        if (!cancelled && mountedRef.current) setInitialized(true);
      }
    })();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    };
  }, [slug]);

  const processQueue = useCallback(async () => {
    if (processorActiveRef.current || !navigator.onLine) return;
    processorActiveRef.current = true;
    if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);

    try {
      while (navigator.onLine) {
        const queue = await getEventUploadQueue(slug);
        const now = Date.now();
        const next = queue.find((item) => item.status === "queued" && item.nextAttemptAt <= now);

        if (!next) {
          const futureAttempts = queue.filter((item) => item.status === "queued" && item.nextAttemptAt > now);
          const nearest = futureAttempts.length ? Math.min(...futureAttempts.map((item) => item.nextAttemptAt)) : null;
          if (nearest !== null) wakeTimerRef.current = setTimeout(() => { void loadQueue(); }, Math.max(0, nearest - now));
          break;
        }

        const uploading: UploadQueueItem = { ...next, status: "uploading", errorMessage: null };
        await putUploadQueueItem(uploading);
        await loadQueue();

        try {
          const formData = new FormData();
          formData.append("queuePhoto", new File([uploading.file], uploading.originalName, { type: uploading.mimeType }));
          formData.append("clientUploadId", uploading.id);
          formData.append("guestName", uploading.guestName ?? "");
          formData.append("source", uploading.source ?? "");
          formData.append("language", language);
          const result = await uploadGuestPhoto(slug, formData);

          if (result.status === "success") {
            await deleteUploadQueueItem(uploading.id);
            if (mountedRef.current) setSentCount((count) => count + 1);
          } else if (!result.retryable) {
            await putUploadQueueItem({ ...uploading, status: "failed", attempts: uploading.attempts + 1, errorMessage: result.message });
          } else {
            const attempts = uploading.attempts + 1;
            const exhausted = attempts >= MAX_AUTOMATIC_ATTEMPTS;
            await putUploadQueueItem({
              ...uploading,
              attempts,
              status: exhausted ? "failed" : "queued",
              nextAttemptAt: exhausted ? 0 : Date.now() + RETRY_DELAYS_MS[attempts - 1],
              errorMessage: exhausted ? "Foto gagal dikirim. Silakan coba lagi." : result.message,
            });
          }
        } catch {
          const attempts = uploading.attempts + 1;
          const exhausted = attempts >= MAX_AUTOMATIC_ATTEMPTS;
          await putUploadQueueItem({
            ...uploading,
            attempts,
            status: exhausted ? "failed" : "queued",
            nextAttemptAt: exhausted ? 0 : Date.now() + RETRY_DELAYS_MS[attempts - 1],
            errorMessage: exhausted ? "Foto gagal dikirim. Silakan coba lagi." : "Koneksi terputus. Momenmu aman di antrean.",
          });
        }

        await loadQueue();
      }
    } catch {
      if (mountedRef.current) setClientError("Antrean belum dapat diproses. Silakan coba lagi.");
    } finally {
      processorActiveRef.current = false;
    }
  }, [language, loadQueue, slug]);

  useEffect(() => {
    if (initialized && online && items.some((item) => item.status === "queued")) queueMicrotask(() => { void processQueue(); });
  }, [initialized, items, online, processQueue]);

  const queueFiles = async (files: File[], method: UploadMethod, input: HTMLInputElement) => {
    if (!files.length) return;
    if (method === "gallery" && files.length > MAX_GALLERY_SELECTION) {
      input.value = "";
      setClientError("Terlalu banyak foto. Pilih maksimal 20 foto sekali kirim.");
      return;
    }
    const invalidType = files.find((file) => !ALLOWED_MIME_TYPES.has(file.type));
    if (invalidType) {
      input.value = "";
      setClientError("Gunakan foto berformat JPEG, PNG, WebP, HEIC, atau HEIF.");
      return;
    }
    const oversized = files.find((file) => file.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      input.value = "";
      setClientError(`Ukuran foto maksimal ${MAX_UPLOAD_MB} MB.`);
      return;
    }

    const name = validateGuestName(guestName);
    if (!name.ok) {
      input.value = "";
      setClientError(name.message);
      return;
    }

    setEnqueueing(true);
    setClientError(null);
    try {
      const createdAt = Date.now();
      const queueItems: UploadQueueItem[] = files.map((file, index) => ({
        id: createClientUploadId(),
        eventSlug: slug,
        file,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        guestName: name.value,
        source,
        createdAt: new Date(createdAt + index).toISOString(),
        attempts: 0,
        status: "queued",
        nextAttemptAt: 0,
        errorMessage: null,
      }));
      await addUploadQueueItems(queueItems);
      input.value = "";
      await loadQueue();
      setFeedback(files.length === 1 ? "Momen masuk antrean ✨" : `${files.length} momen masuk antrean ✨`);
    } catch {
      setClientError("Foto belum dapat disimpan ke antrean browser. Silakan coba lagi.");
    } finally {
      if (mountedRef.current) setEnqueueing(false);
    }
  };

  const retryItem = async (item: UploadQueueItem) => {
    await putUploadQueueItem({ ...item, status: "queued", attempts: 0, nextAttemptAt: 0, errorMessage: null });
    setClientError(null);
    await loadQueue();
  };

  const removeItem = async (id: string) => {
    await deleteUploadQueueItem(id);
    await loadQueue();
  };

  const primaryMethod: UploadMethod = mode === "gallery" ? "gallery" : "camera";
  const controlClass = `inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-bold transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#D6B56F] ${enqueueing ? "pointer-events-none opacity-60" : "hover:-translate-y-0.5"}`;
  const controlTone = (method: UploadMethod) => method === primaryMethod
    ? "bg-[#F5F0E7] text-[#071727]"
    : "border border-[#D6B56F]/35 bg-[#D6B56F]/[.08] text-[#F1DDA7]";
  const cameraControl = <label key="camera" className={`${controlClass} ${controlTone("camera")}`}><input ref={cameraInputRef} type="file" accept="image/*" capture="environment" disabled={enqueueing} className="sr-only" onChange={(event) => { void queueFiles(Array.from(event.currentTarget.files ?? []).slice(0, 1), "camera", event.currentTarget); }} />{enqueueing ? "Menyimpan..." : items.length > 0 || sentCount > 0 ? "Ambil Foto Lagi" : "Ambil Foto"}</label>;
  const galleryControl = <label key="gallery" className={`${controlClass} ${controlTone("gallery")}`}><input ref={galleryInputRef} type="file" accept={PHOTO_ACCEPT} multiple disabled={enqueueing} className="sr-only" onChange={(event) => { void queueFiles(Array.from(event.currentTarget.files ?? []), "gallery", event.currentTarget); }} />{enqueueing ? "Menyimpan..." : "Pilih dari Galeri"}</label>;
  const waitingCount = items.filter((item) => item.status === "queued").length;
  const uploadingCount = items.filter((item) => item.status === "uploading").length;
  const failedCount = items.filter((item) => item.status === "failed").length;

  return (
    <div className="mt-8">
      <div className="mx-auto mb-5 max-w-sm text-left">
        <label htmlFor="guest-name" className="text-xs font-bold uppercase tracking-[.14em] text-[#F1DDA7]">Namamu</label>
        <input id="guest-name" type="text" value={guestName} maxLength={MAX_GUEST_NAME_LENGTH} onChange={(event) => setGuestName(event.target.value)} placeholder="Nama atau panggilan" className="mt-2 min-h-12 w-full rounded-xl border border-[#F5F0E7]/12 bg-[#071727]/55 px-4 text-sm text-[#F5F0E7] placeholder:text-[#AEB8BE]/60 focus:border-[#D6B56F]/40 focus:outline-none" />
        <p className="mt-2 text-xs leading-5 text-[#AEB8BE]">Opsional — supaya pemilik ruang tahu momen ini darimu.</p>
      </div>

      <fieldset disabled={enqueueing} className="flex flex-wrap justify-center gap-3">
        <legend className="sr-only">Pilih sumber foto</legend>
        {mode === "gallery" ? [galleryControl, cameraControl] : [cameraControl, galleryControl]}
      </fieldset>

      <div aria-live="polite" aria-atomic="true">
        {!online && <p className="mt-4 text-sm font-semibold text-[#F1DDA7]">Koneksi terputus. Momenmu aman di antrean.</p>}
        {feedback && <p className="mt-4 text-sm font-semibold text-[#F1DDA7]">{feedback}</p>}
        {clientError && <p role="alert" className="mt-4 text-sm font-semibold text-red-300">{clientError}</p>}
      </div>

      {(items.length > 0 || sentCount > 0) && (
        <section className="mx-auto mt-5 max-w-md border-t border-[#F5F0E7]/[.08] pt-4 text-left" aria-label="Antrean momen">
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[#F5F0E7]">Momenmu</h3><p className="text-xs text-[#AEB8BE]">{waitingCount > 0 && `${waitingCount} menunggu`}{waitingCount > 0 && uploadingCount > 0 && " · "}{uploadingCount > 0 && `${uploadingCount} mengirim`}{failedCount > 0 && `${waitingCount > 0 || uploadingCount > 0 ? " · " : ""}${failedCount} gagal`}{items.length === 0 && sentCount > 0 && "Semua momen sudah terkirim ✓"}</p></div>
          {items.length > 0 && <ul className="mt-3 space-y-2">{items.map((item) => <li key={item.id} className="rounded-xl border border-[#F5F0E7]/[.08] bg-[#071727]/45 px-3 py-2.5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#F5F0E7]">{item.originalName}</p><p className="mt-1 text-xs text-[#AEB8BE]">{item.status === "queued" ? "Menunggu" : item.status === "uploading" ? "Mengirim..." : "Gagal"}</p>{item.status === "failed" && item.errorMessage && <p className="mt-1 text-xs text-red-300">{item.errorMessage}</p>}</div>{item.status === "failed" && <div className="flex shrink-0 flex-col gap-2"><button type="button" onClick={() => { void retryItem(item); }} className="min-h-10 rounded-lg bg-[#F5F0E7] px-3 text-xs font-bold text-[#071727]">Coba Lagi</button><button type="button" onClick={() => { void removeItem(item.id); }} className="min-h-10 rounded-lg border border-red-300/25 px-3 text-xs font-semibold text-red-200">Hapus</button></div>}</div></li>)}</ul>}
        </section>
      )}

      <p className="mt-4 text-xs text-[#AEB8BE]">JPEG, PNG, WebP, HEIC, atau HEIF · Maksimal {MAX_UPLOAD_MB} MB</p>
      <p className="mt-3 text-xs leading-5 text-[#AEB8BE]">Dengan mengirim foto, kamu membagikan foto dan nama yang kamu isi kepada pemilik ruang acara ini. Antrean tersimpan di browser dan dilanjutkan saat halaman ruang ini dibuka kembali.</p>
    </div>
  );
}
