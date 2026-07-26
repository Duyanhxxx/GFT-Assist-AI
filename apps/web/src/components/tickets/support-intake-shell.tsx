import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SupportIntakeShellProps = {
  children: ReactNode;
};

const highlights = [
  {
    title: "Clear intake",
    description: "A structured request gives your support team better context from the start.",
    icon: MessageSquareText,
  },
  {
    title: "Grounded resolution",
    description: "The platform uses reviewed knowledge sources to help generate more reliable answers.",
    icon: Sparkles,
  },
  {
    title: "Escalation when needed",
    description: "Low-confidence or urgent issues can be surfaced for human attention quickly.",
    icon: ShieldCheck,
  },
] as const;

export function SupportIntakeShell({ children }: SupportIntakeShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[1fr_0.95fr]">
      <section className="surface-elevated relative overflow-hidden rounded-[32px] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.10),transparent_32%)]" />
        <div className="relative flex h-full flex-col justify-between gap-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">GFT-Assist-AI</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Customer support request portal</p>
              </div>
              <Badge variant="info">Public intake</Badge>
            </div>

            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">Support request</p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
                Get your issue to the right team with less back-and-forth.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)] md:text-lg">
                Share what happened, how we can reach you, and enough detail for the support workflow to classify,
                prioritize, and route your request correctly.
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
            <Link href="/login">
              <Button variant="secondary">
                Operator sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-[color:var(--muted)]">Use this page for customer intake only.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">{children}</section>
    </main>
  );
}
