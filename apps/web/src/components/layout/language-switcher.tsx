"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-[color:var(--border)] bg-white/70 p-1 dark:bg-slate-950/40">
      <div className="flex h-9 w-9 items-center justify-center text-[color:var(--muted)]">
        <Languages className="h-4 w-4" />
      </div>
      <Button
        aria-label={t("common.english")}
        onClick={() => setLocale("en")}
        size="sm"
        variant={locale === "en" ? "primary" : "ghost"}
      >
        EN
      </Button>
      <Button
        aria-label={t("common.vietnamese")}
        onClick={() => setLocale("vi")}
        size="sm"
        variant={locale === "vi" ? "primary" : "ghost"}
      >
        VI
      </Button>
    </div>
  );
}
