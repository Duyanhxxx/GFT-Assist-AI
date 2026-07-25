import type { TicketDetail } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type TicketDetailCardProps = {
  ticket: TicketDetail;
};

export function TicketDetailCard({ ticket }: TicketDetailCardProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Description</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">{ticket.subject}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Ticket metadata</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Requester</dt>
            <dd className="text-right text-slate-900">{ticket.requesterName ?? ticket.requesterEmail}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd className="text-right text-slate-900">{ticket.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Priority</dt>
            <dd className="text-right text-slate-900">{ticket.priority}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Intent</dt>
            <dd className="text-right text-slate-900">{ticket.intentLabel ?? "Not classified"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Sentiment</dt>
            <dd className="text-right text-slate-900">{ticket.sentimentLabel ?? "Not scored"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Confidence</dt>
            <dd className="text-right text-slate-900">
              {ticket.confidenceScore !== null ? ticket.confidenceScore.toFixed(2) : "Not scored"}
            </dd>
          </div>
        </dl>
      </Card>

      {ticket.resolutionSummary ? (
        <Card className="p-6 lg:col-span-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">AI Summary</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.resolutionSummary}</p>
        </Card>
      ) : null}
    </div>
  );
}
