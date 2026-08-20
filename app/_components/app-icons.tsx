import type { SVGProps } from "react";

export type AppIconName =
  | "home"
  | "spaces"
  | "album"
  | "add"
  | "billing"
  | "account"
  | "help"
  | "logout"
  | "bell"
  | "mail"
  | "lock"
  | "user"
  | "calendar";

export function AppIcon({ name, ...props }: { name: AppIconName } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  if (name === "home") return <svg {...common}><path d="m4 10 8-6 8 6v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-9Z" /><path d="M9.5 20v-6h5v6" /></svg>;
  if (name === "spaces") return <svg {...common}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M7.5 5V3.5m9 1.5V3.5M7.5 10h9" /></svg>;
  if (name === "album") return <svg {...common}><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.75" /><path d="m4.5 18 4.5-4 3 2.5 3-3 4.5 4" /></svg>;
  if (name === "add") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "billing") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 9h18m-14 6h4" /></svg>;
  if (name === "account" || name === "user") return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6" /></svg>;
  if (name === "help") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.3 2.25c-.75.3-1.1.8-1.1 1.65M12 16.5h.01" /></svg>;
  if (name === "logout") return <svg {...common}><path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10m5-4 3-3-3-3m3 3H9" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" /></svg>;
  if (name === "mail") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m5 8 7 5 7-5" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4m8-4v4M4 10h16" /></svg>;
}
