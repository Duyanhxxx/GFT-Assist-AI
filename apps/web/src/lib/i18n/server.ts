import { cookies } from "next/headers";

import { createTranslator } from "./messages";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, normalizeLocale } from "./config";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE);
}

export async function getServerTranslator() {
  const locale = await getServerLocale();

  return {
    locale,
    t: createTranslator(locale),
  };
}
