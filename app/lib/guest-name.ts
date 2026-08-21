export const MAX_GUEST_NAME_LENGTH = 40;

export type GuestNameValidation =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

export function validateGuestName(value: FormDataEntryValue | null): GuestNameValidation {
  if (typeof value !== "string") return { ok: true, value: null };

  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return { ok: true, value: null };
  if (normalized.length > MAX_GUEST_NAME_LENGTH) return { ok: false, message: "Nama maksimal 40 karakter." };

  return { ok: true, value: normalized };
}
