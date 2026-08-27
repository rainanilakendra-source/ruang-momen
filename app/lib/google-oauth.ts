import { createHash, timingSafeEqual } from "node:crypto";
import * as oidc from "openid-client";
import { ADMIN_ROLES, hasRole, ROLES } from "./roles";

export const GOOGLE_PROVIDER = "GOOGLE" as const;
export const GOOGLE_FLOW_COOKIE = "ruang_momen_google_flow";
export const GOOGLE_FLOW_TTL_SECONDS = 10 * 60;

export const GOOGLE_PORTALS = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
  LINK: "link",
} as const;

export type GooglePortal = (typeof GOOGLE_PORTALS)[keyof typeof GOOGLE_PORTALS];

const portalConfig = {
  user: { destination: "/dashboard", failure: "/masuk" },
  admin: { destination: "/admin", failure: "/admin" },
  superadmin: { destination: "/incroet", failure: "/incroet" },
  link: { destination: "/dashboard/akun", failure: "/dashboard/akun" },
} satisfies Record<GooglePortal, { destination: string; failure: string }>;

let configurationPromise: Promise<oidc.Configuration> | null = null;

export function parseGooglePortal(value: string | null): GooglePortal | null {
  return Object.values(GOOGLE_PORTALS).find((portal) => portal === value) ?? null;
}

export function googlePortalConfig(portal: GooglePortal) {
  return portalConfig[portal];
}

export function hashOAuthValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function oauthHashMatches(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, "hex");
  const rightBytes = Buffer.from(right, "hex");
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function googleRedirectUri(): string {
  const value = process.env.GOOGLE_REDIRECT_URI;
  if (!value) throw new Error("Google OAuth is not configured.");
  const url = new URL(value);
  if (url.pathname !== "/api/auth/google/callback" || url.search || url.hash) {
    throw new Error("Google redirect URI is invalid.");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("Google redirect URI must use HTTPS in production.");
  }
  return url.href;
}

export function googleConfiguration(): Promise<oidc.Configuration> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured.");
  configurationPromise ??= oidc.discovery(
    new URL("https://accounts.google.com"),
    clientId,
    clientSecret,
  );
  return configurationPromise;
}

export function portalAllowsRole(portal: GooglePortal, role: string): boolean {
  if (portal === GOOGLE_PORTALS.USER) return hasRole({ role }, ROLES.USER);
  if (portal === GOOGLE_PORTALS.ADMIN) return hasRole({ role }, ADMIN_ROLES);
  if (portal === GOOGLE_PORTALS.SUPER_ADMIN) return hasRole({ role }, ROLES.SUPER_ADMIN);
  return false;
}
