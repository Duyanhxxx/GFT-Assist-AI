import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BrainCircuit, Settings2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { AiRunsTable } from "@/components/logs/ai-runs-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchAiRuns, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getServerTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AiRunsPage() {
  const { t } = await getServerTranslator();

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Authentication must be configured before AI audit logs can load."
            icon={BrainCircuit}
            title={t("common.configureSupabase")}
          />
        </Card>
      </main>
    );
  }

  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const response = await fetchAiRuns(accessToken).catch(() => null);

  return (
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <>
            <Link href="/settings">
              <Button variant="secondary">
                <Settings2 className="h-4 w-4" />
                {t("common.settings")}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                {t("common.dashboard")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description={t("aiRuns.description")}
        eyebrow={t("aiRuns.eyebrow")}
        title={t("aiRuns.title")}
      />

      <Card className="surface-elevated rounded-[32px] p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">{t("aiRuns.consoleTitle")}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              {t("aiRuns.consoleDescription")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
            <BrainCircuit className="h-4 w-4" />
            {t("aiRuns.consoleBadge")}
          </div>
        </div>
      </Card>

      <div>
        {response ? (
          <AiRunsTable runs={response.data} />
        ) : (
          <Card className="rounded-[28px] p-6">
            <EmptyState
              description="The AI run log request did not return successfully."
              icon={BrainCircuit}
              title={t("system.unableAiRuns")}
            />
          </Card>
        )}
      </div>
    </main>
  );
}
