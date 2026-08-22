import type { CSSProperties } from "react";

export const THEME_KEYS = ["MIDNIGHT", "IVORY", "ROMANTIC", "ELEGANT"] as const;
export const FRAME_KEYS = ["NONE", "CLASSIC", "SOFT", "EDITORIAL"] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];
export type FrameKey = (typeof FRAME_KEYS)[number];

export const THEME_DETAILS: Record<ThemeKey, { label: string; preview: string }> = {
  MIDNIGHT: { label: "Midnight", preview: "bg-[#071727] text-[#F5F0E7]" },
  IVORY: { label: "Ivory", preview: "bg-[#F4EFE5] text-[#24313B]" },
  ROMANTIC: { label: "Romantic", preview: "bg-[#2A1521] text-[#FFF4F3]" },
  ELEGANT: { label: "Elegant", preview: "bg-[#171717] text-[#F5F0E7]" },
};

export const FRAME_DETAILS: Record<FrameKey, { label: string; preview: string }> = {
  NONE: { label: "Tanpa Frame", preview: "rounded-xl border border-transparent" },
  CLASSIC: { label: "Classic", preview: "rounded-sm border-4 border-double border-[#D6B56F]" },
  SOFT: { label: "Soft", preview: "rounded-[1.5rem] border border-[#D6B56F]/25 shadow-lg" },
  EDITORIAL: { label: "Editorial", preview: "rounded-none border-[6px] border-[#F5F0E7] shadow-xl" },
};

export function resolveThemeKey(value: unknown): ThemeKey {
  return typeof value === "string" && THEME_KEYS.includes(value as ThemeKey) ? value as ThemeKey : "MIDNIGHT";
}

export function resolveFrameKey(value: unknown): FrameKey {
  return typeof value === "string" && FRAME_KEYS.includes(value as FrameKey) ? value as FrameKey : "NONE";
}

type GuestThemeStyle = CSSProperties & Record<`--guest-${string}`, string>;

const THEME_STYLES: Record<ThemeKey, GuestThemeStyle> = {
  MIDNIGHT: { "--guest-bg": "#071727", "--guest-surface": "#0A1D30", "--guest-input": "#071727", "--guest-text": "#F5F0E7", "--guest-muted": "#AEB8BE", "--guest-accent": "#D6B56F", "--guest-accent-soft": "#F1DDA7", "--guest-border": "rgba(214,181,111,.22)" },
  IVORY: { "--guest-bg": "#F4EFE5", "--guest-surface": "#FFFDF8", "--guest-input": "#F7F0E5", "--guest-text": "#24313B", "--guest-muted": "#6B7280", "--guest-accent": "#9A6A35", "--guest-accent-soft": "#76502D", "--guest-border": "rgba(154,106,53,.24)" },
  ROMANTIC: { "--guest-bg": "#2A1521", "--guest-surface": "#3A1D2C", "--guest-input": "#2A1521", "--guest-text": "#FFF4F3", "--guest-muted": "#D8BFC5", "--guest-accent": "#D99AA8", "--guest-accent-soft": "#F2C2C9", "--guest-border": "rgba(217,154,168,.28)" },
  ELEGANT: { "--guest-bg": "#171717", "--guest-surface": "#25231F", "--guest-input": "#171717", "--guest-text": "#F5F0E7", "--guest-muted": "#B9B1A3", "--guest-accent": "#C5A46D", "--guest-accent-soft": "#E2CCA3", "--guest-border": "rgba(197,164,109,.25)" },
};

export function getGuestThemeStyle(value: unknown): GuestThemeStyle {
  return THEME_STYLES[resolveThemeKey(value)];
}

export function getGuestFrameClass(value: unknown): string {
  const key = resolveFrameKey(value);
  if (key === "CLASSIC") return "rounded-sm border-4 border-double border-[var(--guest-accent)] bg-[var(--guest-surface)] p-1";
  if (key === "SOFT") return "rounded-[1.75rem] border border-[var(--guest-border)] bg-[var(--guest-surface)] shadow-[0_18px_42px_rgba(0,0,0,.16)]";
  if (key === "EDITORIAL") return "rounded-none border-[6px] border-[var(--guest-text)] bg-[var(--guest-surface)] shadow-[0_20px_45px_rgba(0,0,0,.2)]";
  return "rounded-xl border border-[var(--guest-border)] bg-[var(--guest-surface)]";
}
