import Link from "next/link";
import { redirect } from "next/navigation";

import type { AppRole } from "@gft-assist/types";

import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchOrganizationSettings, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="p-8">
          <p className="text-sm text-slate-600">Configure Supabase before managing organization settings.</p>
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

  const roleValue = user.app_metadata?.platform_role;
  const role: AppRole = roleValue === "ADMIN" || roleValue === "OPERATOR" || roleValue === "VIEWER" ? roleValue : "VIEWER";
  const response = await fetchOrganizationSettings(accessToken).catch(() => null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Runtime configuration</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Dashboard</Button>
          </Link>
          <Link href="/ai-runs">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">AI run logs</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {response ? (
          <OrganizationSettingsForm recentChanges={response.data.recentChanges} role={role} settings={response.data.settings} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-slate-600">Unable to load organization settings from the API.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
