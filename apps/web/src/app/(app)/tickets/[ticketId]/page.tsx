import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BrainCircuit, FileText } from "lucide-react";

import { RunGroundedResponseButton } from "@/components/ai/run-grounded-response-button";
import { RunTriageButton } from "@/components/ai/run-triage-button";
import { PageHeader } from "@/components/layout/page-header";
import { TicketDetailCard } from "@/components/tickets/ticket-detail-card";
import { TicketMessages } from "@/components/tickets/ticket-messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchTicket, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getServerTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function TicketPage({ params }: TicketPageProps) {
  const { t } = await getServerTranslator();

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Authentication must be configured before the ticket workspace can load."
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

  const { ticketId } = await params;
  const response = await fetchTicket(ticketId, accessToken).catch(() => null);

  if (!response) {
    notFound();
  }

  return (
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <Link href="/tickets">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              {t("common.backToQueue")}
            </Button>
          </Link>
        }
        description={t("tickets.detailDescription")}
        eyebrow={t("common.ticketDetail")}
        title={response.data.ticket.subject}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="surface-elevated rounded-[32px]">
          <CardHeader>
            <CardTitle>{t("tickets.operatorActions")}</CardTitle>
            <CardDescription>{t("tickets.operatorActionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-[color:var(--border)] p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{t("tickets.geminiTriage")}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {t("tickets.geminiTriageDescription")}
              </p>
              <div className="mt-4">
                <RunTriageButton ticketId={ticketId} />
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <FileText className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{t("tickets.groundedResponse")}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {t("tickets.groundedResponseDescription")}
              </p>
              <div className="mt-4">
                <RunGroundedResponseButton ticketId={ticketId} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] p-6">
          <p className="text-sm font-semibold">{t("tickets.workflowNote")}</p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            {t("tickets.workflowNoteDescription")}
          </p>
        </Card>
      </section>

      <div className="space-y-6">
        <TicketDetailCard ticket={response.data.ticket} />
        <TicketMessages messages={response.data.messages} />
      </div>
    </main>
  );
}
