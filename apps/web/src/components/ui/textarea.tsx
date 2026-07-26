import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-sm text-[color:var(--foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[color:var(--muted)] hover:border-[color:var(--border-strong)] focus-visible:border-[color:var(--primary)] focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:border-[color:var(--border)] disabled:bg-slate-950/[0.03] disabled:text-[color:var(--muted)] dark:bg-slate-950/50 dark:disabled:bg-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}
