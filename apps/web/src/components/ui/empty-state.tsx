import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({
  actions,
  className,
  description,
  icon: Icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[28px] border border-dashed border-[color:var(--border-strong)] bg-white/45 px-6 py-10 text-center dark:bg-slate-950/25",
        className,
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950/5 text-[color:var(--foreground)] dark:bg-white/8">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
      {actions ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
