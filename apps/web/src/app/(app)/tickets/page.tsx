import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ListFilter, PlusCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { TicketsTable } from "@/components/tickets/tickets-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchTickets, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Add your Supabase environment variables before accessing the operator ticket queue."
            icon={ListFilter}
            title="Configure Supabase to continue"
          />
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
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <>
            <Link href="/submit-ticket">
              <Button variant="secondary">
                <PlusCircle className="h-4 w-4" />
                Public intake
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description="A clearer queue for triage, escalation, and AI-assisted resolution. Search and filtering are handled locally on the current dataset."
        eyebrow="Tickets"
        title="Ticket queue"
      />

      <Card className="surface-elevated rounded-[32px] p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">Operator workflow</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              Prioritize high-risk conversations, inspect AI confidence, and move directly into the full case view.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
            <ListFilter className="h-4 w-4" />
            Filter, sort, and page the queue below
          </div>
        </div>
      </Card>

      <div>
        {response ? (
          <TicketsTable tickets={response.data} />
        ) : (
          <Card className="rounded-[28px] p-6">
            <EmptyState
              description="The queue request did not return successfully. Try refreshing the page."
              icon={ListFilter}
              title="Unable to load tickets"
            />
          </Card>
        )}
      </div>
    </main>
  );
}
