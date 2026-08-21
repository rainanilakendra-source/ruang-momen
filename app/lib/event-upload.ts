export type EventUploadSettings = {
  guestUploadEnabled: boolean;
  uploadStartsAt: Date | null;
  uploadEndsAt: Date | null;
};

export type EventUploadStatus = "OPEN" | "DISABLED" | "NOT_STARTED" | "ENDED";

export const EVENT_UPLOAD_STATUS_DETAILS: Record<EventUploadStatus, { label: string; message: string }> = {
  OPEN: { label: "Aktif", message: "" },
  DISABLED: { label: "Ditutup", message: "Ruang ini sedang tidak menerima momen." },
  NOT_STARTED: { label: "Terjadwal", message: "Ruang ini belum mulai menerima momen." },
  ENDED: { label: "Berakhir", message: "Masa pengiriman momen untuk ruang ini sudah berakhir." },
};

export function getEventUploadStatus(settings: EventUploadSettings, now = new Date()): EventUploadStatus {
  if (!settings.guestUploadEnabled) return "DISABLED";
  if (settings.uploadStartsAt && now < settings.uploadStartsAt) return "NOT_STARTED";
  if (settings.uploadEndsAt && now > settings.uploadEndsAt) return "ENDED";
  return "OPEN";
}
