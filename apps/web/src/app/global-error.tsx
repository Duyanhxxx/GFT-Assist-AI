"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/messages";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const locale = useMemo(() => {
    if (typeof document === "undefined") {
      return DEFAULT_LOCALE;
    }

    const cookieValue = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LOCALE_COOKIE_NAME}=`))
      ?.split("=")[1];

    return normalizeLocale(cookieValue);
  }, []);
  const t = useMemo(() => createTranslator(locale), [locale]);

  return (
    <html lang={locale}>
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-8">
          <Card className="surface-elevated w-full rounded-[32px]">
            <CardHeader className="items-center gap-4 p-8 pb-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl">{t("system.globalErrorTitle")}</CardTitle>
              <CardDescription className="max-w-xl text-sm leading-7">
                {t("system.globalErrorDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-2">
            <Alert title={t("system.errorDetails")} variant="danger">
                {error.message}
            </Alert>
              <div className="flex justify-center">
                <Button onClick={reset}>{t("common.tryAgain")}</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
