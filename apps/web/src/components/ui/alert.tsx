import type { HTMLAttributes, ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variantClasses: Record<AlertVariant, string> = {
  info: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  variant?: AlertVariant;
  icon?: ReactNode;
};

export function Alert({
  children,
  className,
  icon,
  title,
  variant = "info",
  ...props
}: AlertProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        variantClasses[variant],
        className,
      )}
      role="alert"
      {...props}
    >
      <div className="mt-0.5 shrink-0">{icon ?? <Icon className="h-4 w-4" />}</div>
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title ? "mt-1" : undefined)}>{children}</div>
      </div>
    </div>
  );
}
