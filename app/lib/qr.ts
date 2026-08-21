import QRCode from "qrcode";

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

export function buildGuestUrl(slug: string): string {
  return `${getAppBaseUrl()}/r/${encodeURIComponent(slug)}`;
}

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { ...QR_OPTIONS, width: 1024, type: "image/png" });
}

export async function generateQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
}
