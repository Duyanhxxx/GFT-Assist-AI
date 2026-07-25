import Link from "next/link";
import { redirect } from "next/navigation";

import { TicketsTable } from "@/components/tickets/tickets-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchTickets, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-slate-950">Configure Supabase to continue</h1>
          <p className="mt-3 text-sm text-slate-600">
            Add your Supabase environment variables before accessing the operator queue.
          </p>
        </Card>
      </main>
    );
  }

  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const response = await fetchTickets(accessToken).catch(() => null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Tickets</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Ticket queue</h1>
        </div>
        <Link href="/submit-ticket">
          <Button>Open public intake</Button>
        </Link>
      </div>

      <div className="mt-8">
        {response ? (
          <TicketsTable tickets={response.data} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-slate-600">Unable to load tickets from the API.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
