import Link from "next/link";
import { redirect } from "next/navigation";

import { AiRunsTable } from "@/components/logs/ai-runs-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAiRuns, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AiRunsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="p-8">
          <p className="text-sm text-slate-600">Configure Supabase before reviewing AI run logs.</p>
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Logs</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">AI run observability</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Settings</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50">Dashboard</Button>
          </Link>
          <Link href="/tickets">
            <Button>Open tickets</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {response ? (
          <AiRunsTable runs={response.data} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-slate-600">Unable to load AI run logs from the API.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
