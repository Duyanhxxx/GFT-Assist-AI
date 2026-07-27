"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";

import { LocaleProvider } from "./locale-provider";

type AppProvidersProps = {
  children: ReactNode;
  locale: Locale;
};

export function AppProviders({ children, locale }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
    </QueryClientProvider>
  );
}
