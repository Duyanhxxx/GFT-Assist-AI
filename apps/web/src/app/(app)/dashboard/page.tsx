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
import { getServerTranslator } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { t } = await getServerTranslator();

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-6 py-12">
        <Card className="max-w-xl rounded-[28px] p-8">
          <EmptyState
            description="Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to enable login and the operator workspace."
            icon={ShieldCheck}
            title={t("common.configureSupabase")}
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
                {t("common.aiLogs")}
              </Button>
            </Link>
            <Link href="/tickets">
              <Button>
                {t("common.openTickets")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description={t("dashboard.description")}
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-elevated rounded-[32px]">
          <CardHeader className="gap-4 p-8 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="info">{t("common.liveEnvironment")}</Badge>
              <Badge>{role}</Badge>
            </div>
            <CardTitle className="max-w-2xl text-3xl leading-tight md:text-4xl">
              {t("dashboard.heroTitle")}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7">
              {t("dashboard.heroDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-8 pt-6 md:grid-cols-3">
            {[
              {
                icon: Activity,
                label: t("dashboard.signedInAs"),
                value: user.email ?? t("common.unknownUser"),
              },
              {
                icon: ShieldCheck,
                label: t("dashboard.role"),
                value: role,
              },
              {
                icon: Building2,
                label: t("dashboard.organization"),
                value: organizationId ?? t("common.noOrganization"),
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
            <CardTitle>{t("dashboard.quickPaths")}</CardTitle>
            <CardDescription>{t("dashboard.quickPathsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                href: "/tickets",
                icon: Ticket,
                title: t("dashboard.quickPathsItems.tickets.title"),
                description: t("dashboard.quickPathsItems.tickets.description"),
              },
              {
                href: "/knowledge-base",
                icon: BookOpen,
                title: t("dashboard.quickPathsItems.knowledge.title"),
                description: t("dashboard.quickPathsItems.knowledge.description"),
              },
              {
                href: "/settings",
                icon: BrainCircuit,
                title: t("dashboard.quickPathsItems.ai.title"),
                description: t("dashboard.quickPathsItems.ai.description"),
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
              description={t("dashboard.unableMetricsDescription")}
              icon={Activity}
              title={t("dashboard.unableMetrics")}
            />
          </Card>
        )}
      </section>
    </main>
  );
}
