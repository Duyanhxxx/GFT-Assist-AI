import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--foreground)] text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0",
  secondary:
    "border border-[color:var(--border-strong)] bg-white/70 text-[color:var(--foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[color:var(--border-strong)] hover:bg-white active:bg-white/90 dark:bg-slate-950/40 dark:hover:bg-slate-950/60",
  ghost:
    "bg-transparent text-[color:var(--muted-foreground)] hover:bg-slate-950/5 hover:text-[color:var(--foreground)] active:bg-slate-950/8 dark:hover:bg-white/8 dark:active:bg-white/10",
  danger: "bg-[color:var(--danger)] text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-10 rounded-xl px-4 text-sm",
  lg: "h-11 rounded-2xl px-5 text-sm",
  icon: "h-10 w-10 rounded-xl p-0",
};

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
