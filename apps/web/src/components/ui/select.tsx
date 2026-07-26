import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 pr-10 text-sm text-[color:var(--foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none hover:border-[color:var(--border-strong)] focus-visible:border-[color:var(--primary)] focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:border-[color:var(--border)] disabled:bg-slate-950/[0.03] disabled:text-[color:var(--muted)] dark:bg-slate-950/50 dark:disabled:bg-white/[0.03]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
    </div>
  );
}
