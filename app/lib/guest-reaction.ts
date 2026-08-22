import { randomUUID } from "node:crypto";

export const GUEST_REACTION_COOKIE = "ruang_momen_guest_reaction";
export const GUEST_REACTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const GUEST_IDENTIFIER_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function parseGuestReactionIdentifier(
  value: string | undefined,
): string | null {
  return value && GUEST_IDENTIFIER_PATTERN.test(value) ? value.toLowerCase() : null;
}

export function createGuestReactionIdentifier(): string {
  return randomUUID();
}
