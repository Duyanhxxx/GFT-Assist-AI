"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, normalizeLocale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof createTranslator>;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: createTranslator(DEFAULT_LOCALE),
});

type LocaleProviderProps = {
  children: ReactNode;
  initialLocale: Locale;
};

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale: Locale) => setLocaleState(normalizeLocale(nextLocale)),
      t: createTranslator(locale),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
