import Link from "next/link";
import { redirect } from "next/navigation";

import type { AppRole } from "@gft-assist/types";

import { DashboardSummaryGrid } from "@/components/analytics/dashboard-summary-grid";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchDashboardSummary, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <Card className="max-w-xl p-8">
          <h1 className="text-2xl font-semibold text-slate-950">Configure Supabase to continue</h1>
          <p className="mt-3 text-sm text-slate-600">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to enable login.
          </p>
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

  const roleValue = user.app_metadata?.platform_role;
  const role: AppRole = roleValue === "ADMIN" || roleValue === "OPERATOR" || roleValue === "VIEWER" ? roleValue : "VIEWER";
  const organizationId = user.app_metadata?.organization_id as string | undefined;
  const summaryResponse = accessToken ? await fetchDashboardSummary(accessToken).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Support operations workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Settings</Button>
          </Link>
          <Link href="/knowledge-base">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Knowledge base</Button>
          </Link>
          <Link href="/ai-runs">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">AI run logs</Button>
          </Link>
          <Link href="/tickets">
            <Button>Open tickets</Button>
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{user.email}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500">Role</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{role}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500">Organization</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{organizationId ?? "Not assigned"}</p>
        </Card>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Observability</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">AI and support performance</h2>
          </div>
          <Link href="/ai-runs">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Inspect AI runs</Button>
          </Link>
        </div>

        <div className="mt-6">
          {summaryResponse ? (
            <DashboardSummaryGrid summary={summaryResponse.data} />
          ) : (
            <Card className="p-6">
              <p className="text-sm text-slate-600">Unable to load dashboard metrics from the API.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
