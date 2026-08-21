export const MAX_PHOTO_SOURCE_LENGTH = 50;

export function normalizePhotoSource(value: string | string[] | null | undefined): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_PHOTO_SOURCE_LENGTH)
    .replace(/-+$/g, "");

  return normalized || null;
}

export function formatPhotoSource(source: string): string {
  return source.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
