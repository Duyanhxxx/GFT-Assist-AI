import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, BookOpen, BrainCircuit, Building2, ShieldCheck, Ticket } from "lucide-react";

import type { AppRole } from "@gft-assist/types";

import { DashboardSummaryGrid } from "@/components/analytics/dashboard-summary-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveOrganizationId, resolveUserRole } from "@/lib/auth/user-metadata";
import { fetchDashboardSummary, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-6 py-12">
        <Card className="max-w-xl rounded-[28px] p-8">
          <EmptyState
            description="Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to enable login and the operator workspace."
            icon={ShieldCheck}
            title="Configure Supabase to continue"
          />
        </Card>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const accessToken = await getServerAccessToken();

  const role: AppRole = resolveUserRole(user);
  const organizationId = resolveOrganizationId(user);
  const summaryResponse = accessToken ? await fetchDashboardSummary(accessToken).catch(() => null) : null;

  return (
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <>
            <Link href="/ai-runs">
              <Button variant="secondary">
                <BrainCircuit className="h-4 w-4" />
                AI logs
              </Button>
            </Link>
            <Link href="/tickets">
              <Button>
                Open tickets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description="Monitor ticket throughput, AI quality, and escalation pressure from one premium operator workspace."
        eyebrow="Dashboard"
        title="Support operations workspace"
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-elevated rounded-[32px]">
          <CardHeader className="gap-4 p-8 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="info">Live environment</Badge>
              <Badge>{role}</Badge>
            </div>
            <CardTitle className="max-w-2xl text-3xl leading-tight md:text-4xl">
              A calmer control center for AI-assisted support.
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              Review routing performance, inspect model behavior, and move quickly between tickets, knowledge, and settings without losing context.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-8 pt-6 md:grid-cols-3">
            {[
              {
                icon: Activity,
                label: "Signed in as",
                value: user.email ?? "Unknown user",
              },
              {
                icon: ShieldCheck,
                label: "Role",
                value: role,
              },
              {
                icon: Building2,
                label: "Organization",
                value: organizationId ?? "Not assigned",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35" key={item.label}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-base font-semibold">{item.value}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[32px]">
          <CardHeader>
            <CardTitle>Quick paths</CardTitle>
            <CardDescription>Jump straight into the parts of the platform operators touch most often.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                href: "/tickets",
                icon: Ticket,
                title: "Ticket queue",
                description: "Review customer issues, internal notes, and AI actions.",
              },
              {
                href: "/knowledge-base",
                icon: BookOpen,
                title: "Knowledge base",
                description: "Upload, inspect, and manage grounded answer sources.",
              },
              {
                href: "/settings",
                icon: BrainCircuit,
                title: "AI configuration",
                description: "Tune thresholds, retrieval depth, and model behavior.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-start gap-4 rounded-3xl border border-[color:var(--border)] px-4 py-4 hover:border-[color:var(--border-strong)] hover:bg-slate-950/4 dark:hover:bg-white/5"
                  href={item.href}
                  key={item.href}
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        {summaryResponse ? (
          <DashboardSummaryGrid summary={summaryResponse.data} />
        ) : (
          <Card className="rounded-[28px] p-6">
            <EmptyState
              description="The workspace loaded, but the metrics request did not return successfully."
              icon={Activity}
              title="Unable to load dashboard metrics"
            />
          </Card>
        )}
      </section>
    </main>
  );
}
