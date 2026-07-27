export const LOCALE_COOKIE_NAME = "gft-locale";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "vi"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getIntlLocale(locale: Locale) {
  return locale === "vi" ? "vi-VN" : "en-US";
}
