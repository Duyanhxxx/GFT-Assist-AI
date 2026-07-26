import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

const highlights = [
  {
    title: "Explainable AI actions",
    description: "Every ticket decision stays inspectable with confidence and citation history.",
    icon: ShieldCheck,
  },
  {
    title: "Grounded response workflows",
    description: "Support replies stay anchored to knowledge retrieval rather than generic chat output.",
    icon: Sparkles,
  },
  {
    title: "Human-in-the-loop routing",
    description: "Escalation stays deliberate for urgent, low-confidence, or incomplete customer issues.",
    icon: Workflow,
  },
] as const;

export function AuthShell({ children, description, eyebrow, title }: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-elevated relative overflow-hidden rounded-[32px] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.12),transparent_28%)]" />
        <div className="relative flex h-full flex-col justify-between gap-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">GFT-Assist-AI</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Premium support operations platform</p>
              </div>
              <Badge variant="info">Series A polish</Badge>
            </div>

            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">{eyebrow}</p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)] md:text-lg">
                {description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35" key={highlight.title}>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--foreground)] text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-semibold">{highlight.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{highlight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/submit-ticket">
              <Button variant="secondary">
                Customer intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-[color:var(--muted)]">Designed for recruiters, operators, and AI auditability.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        {children}
      </section>
    </main>
  );
}
