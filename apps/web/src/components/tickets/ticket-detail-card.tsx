import type { TicketDetail } from "@gft-assist/types";
import { BadgeAlert, Globe2, HeartPulse, Lightbulb, Mail, UserRound } from "lucide-react";

import { TicketConfidenceBadge, TicketPriorityBadge, TicketStatusBadge } from "@/components/tickets/ticket-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TicketDetailCardProps = {
  ticket: TicketDetail;
};

function titleCase(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TicketDetailCard({ ticket }: TicketDetailCardProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <Card className="surface-elevated rounded-[32px]">
          <CardHeader className="gap-4 p-8 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketConfidenceBadge score={ticket.confidenceScore} />
              {ticket.intentLabel ? <Badge>{ticket.intentLabel}</Badge> : null}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">Ticket brief</p>
              <CardTitle className="text-3xl leading-tight md:text-4xl">{ticket.subject}</CardTitle>
              <CardDescription className="text-sm leading-7">
                Customer-facing issue details and AI-derived signals in one review surface.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-2">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: UserRound,
                  label: "Requester",
                  value: ticket.requesterName ?? "Unknown requester",
                  helper: ticket.requesterEmail,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: ticket.requesterEmail,
                  helper: "Customer contact",
                },
                {
                  icon: Globe2,
                  label: "Language",
                  value: titleCase(ticket.languageCode) ?? "Not detected",
                  helper: "Inbound ticket locale",
                },
                {
                  icon: HeartPulse,
                  label: "Sentiment",
                  value: titleCase(ticket.sentimentLabel) ?? "Not scored",
                  helper: "AI signal",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35" key={item.label}>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                    <p className="mt-2 break-words text-sm font-semibold leading-6">{item.value}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{item.helper}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/55 p-6 dark:bg-slate-950/35">
              <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Customer description</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        {ticket.resolutionSummary ? (
          <Card className="rounded-[32px]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>AI summary</CardTitle>
                  <CardDescription>Latest system-generated resolution summary for operator review.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{ticket.resolutionSummary}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="rounded-[32px] xl:sticky xl:top-28 xl:self-start">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
              <BadgeAlert className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Decision context</CardTitle>
              <CardDescription>Signals that help operators judge whether to trust or escalate.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {[
              ["Status", ticket.status.replaceAll("_", " ")],
              ["Priority", ticket.priority],
              ["Intent", ticket.intentLabel ?? "Not classified"],
              ["Sentiment", titleCase(ticket.sentimentLabel) ?? "Not scored"],
              ["Language", titleCase(ticket.languageCode) ?? "Not detected"],
              ["Confidence", ticket.confidenceScore !== null ? ticket.confidenceScore.toFixed(2) : "Not scored"],
            ].map(([label, value]) => (
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-white/50 px-4 py-3 dark:bg-slate-950/30" key={label}>
                <dt className="text-sm text-[color:var(--muted)]">{label}</dt>
                <dd className="text-right text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
