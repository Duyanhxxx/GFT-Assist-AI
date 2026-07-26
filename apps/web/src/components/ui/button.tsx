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
    "bg-[color:var(--foreground)] text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:opacity-95",
  secondary:
    "border border-[color:var(--border-strong)] bg-white/70 text-[color:var(--foreground)] hover:bg-white dark:bg-slate-950/40 dark:hover:bg-slate-950/60",
  ghost: "bg-transparent text-[color:var(--muted-foreground)] hover:bg-slate-950/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/8",
  danger: "bg-[color:var(--danger)] text-white hover:-translate-y-0.5 hover:opacity-95",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
