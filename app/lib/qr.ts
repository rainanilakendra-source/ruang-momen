import QRCode from "qrcode";

export const QR_MODES = ["general", "camera", "gallery"] as const;
export type QrMode = (typeof QR_MODES)[number];

export const QR_MODE_DETAILS: Record<QrMode, { label: string; filename: string; printLabel: string }> = {
  general: { label: "Umum", filename: "umum", printLabel: "SCAN UNTUK MASUK KE RUANG" },
  camera: { label: "Kamera Langsung", filename: "kamera", printLabel: "SCAN UNTUK JEPRET MOMEN" },
  gallery: { label: "Galeri", filename: "galeri", printLabel: "SCAN UNTUK BAGIKAN DARI GALERI" },
};

export function parseQrMode(value: string | string[] | undefined): QrMode {
  return value === "camera" || value === "gallery" ? value : "general";
}

const QR_OPTIONS = {
  errorCorrectionLevel: "Q" as const,
  margin: 4,
  color: {
    dark: "#071727",
    light: "#FFFDF7",
  },
};

export function getAppBaseUrl(): string {
  const configuredUrl = process.env.APP_URL?.trim();

  if (!configuredUrl) {
    throw new Error("APP_URL belum dikonfigurasi.");
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("APP_URL tidak valid.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("APP_URL tidak valid.");
  }

  return url.toString().replace(/\/+$/, "");
}

export function buildGuestUrl({ baseUrl, slug, mode = "general", source }: { baseUrl: string; slug: string; mode?: QrMode; source?: string | null }): string {
  const url = new URL(`/r/${encodeURIComponent(slug)}`, `${baseUrl.replace(/\/+$/, "")}/`);
  if (mode !== "general") url.searchParams.set("mode", mode);
  if (source) url.searchParams.set("source", source);
  return url.toString();
}

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { ...QR_OPTIONS, width: 1024, type: "image/png" });
}

export async function generateQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
}
