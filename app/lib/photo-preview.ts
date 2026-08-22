import convert from "heic-convert";

export const HEIC_MIME_TYPES = ["image/heic", "image/heif"] as const;
export type HeicMimeType = (typeof HEIC_MIME_TYPES)[number];

export function isHeicMimeType(value: string): value is HeicMimeType {
  return HEIC_MIME_TYPES.includes(value as HeicMimeType);
}

export function hasHeicExtension(filename: string): boolean {
  return /\.(?:heic|heif)$/i.test(filename);
}

export async function createBrowserPreview(bytes: Uint8Array): Promise<Uint8Array> {
  return convert({ buffer: Buffer.from(bytes), format: "JPEG", quality: 0.9 });
}
