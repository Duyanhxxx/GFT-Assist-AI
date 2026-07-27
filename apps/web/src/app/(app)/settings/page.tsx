import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BrainCircuit, LayoutDashboard } from "lucide-react";

import type { AppRole } from "@gft-assist/types";

import { PageHeader } from "@/components/layout/page-header";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchOrganizationSettings, getServerAccessToken } from "@/lib/api/server";
import { resolveUserRole } from "@/lib/auth/user-metadata";
import { hasSupabaseEnv } from "@/lib/env";
import { getServerTranslator } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { t } = await getServerTranslator();

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Authentication must be configured before organization settings can load."
            icon={LayoutDashboard}
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

  if (!accessToken) {
    redirect("/login");
  }

  const role: AppRole = resolveUserRole(user);
  const result = await fetchOrganizationSettings(accessToken)
    .then((response) => ({ response, error: null }))
    .catch((error: unknown) => ({
      response: null,
      error: error instanceof Error ? error.message : "The runtime configuration request did not return successfully.",
    }));

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
            <Link href="/dashboard">
              <Button>
                {t("common.dashboard")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description={t("settings.description")}
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
      />

      <Card className="surface-elevated rounded-[32px] p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">{t("settings.controlPlane")}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              {t("settings.controlPlaneDescription")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
            <LayoutDashboard className="h-4 w-4" />
            {t("settings.controlPlaneBadge")}
          </div>
        </div>
      </Card>

      <div>
        {result.response ? (
          <OrganizationSettingsForm recentChanges={result.response.data.recentChanges} role={role} settings={result.response.data.settings} />
        ) : (
          <Card className="rounded-[28px] p-6">
            <EmptyState
              description={result.error ?? "The runtime configuration request did not return successfully."}
              icon={LayoutDashboard}
              title={t("system.unableSettings")}
            />
          </Card>
        )}
      </div>
    </main>
  );
}
