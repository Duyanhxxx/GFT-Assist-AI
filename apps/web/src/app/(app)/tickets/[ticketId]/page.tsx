import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RunGroundedResponseButton } from "@/components/ai/run-grounded-response-button";
import { RunTriageButton } from "@/components/ai/run-triage-button";
import { TicketDetailCard } from "@/components/tickets/ticket-detail-card";
import { TicketMessages } from "@/components/tickets/ticket-messages";
import { Card } from "@/components/ui/card";
import { fetchTicket, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function TicketPage({ params }: TicketPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="p-8">
          <p className="text-sm text-slate-600">Configure Supabase before opening ticket details.</p>
        </Card>
      </main>
    );
  }

  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const { ticketId } = await params;
  const response = await fetchTicket(ticketId, accessToken).catch(() => null);

  if (!response) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <Link className="text-sm text-slate-600 hover:text-slate-900" href="/tickets">
          Back to tickets
        </Link>
        <div className="flex flex-col gap-3">
          <RunTriageButton ticketId={ticketId} />
          <RunGroundedResponseButton ticketId={ticketId} />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <TicketDetailCard ticket={response.data.ticket} />
        <TicketMessages messages={response.data.messages} />
      </div>
    </main>
  );
}
