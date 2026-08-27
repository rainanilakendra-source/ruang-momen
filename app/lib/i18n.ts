import en from "../../locales/en.json";
import id from "../../locales/id.json";

export const DEFAULT_LANGUAGE = "id" as const;
export const SUPPORTED_LANGUAGES = ["id", "en"] as const;
export const LANGUAGE_STORAGE_KEY = "language";
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const dictionaries: Record<Language, unknown> = { id, en };

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as Language);
}

function resolve(dictionary: unknown, key: string): string | undefined {
  let current: unknown = dictionary;
  for (const segment of key.split(".")) {
    if (!current || typeof current !== "object" || !(segment in current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(language: Language, key: string): string {
  return resolve(dictionaries[language], key) ?? resolve(dictionaries[DEFAULT_LANGUAGE], key) ?? "";
}
