import Link from "next/link";

import type { TicketListItem } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type TicketsTableProps = {
  tickets: TicketListItem[];
};

export function TicketsTable({ tickets }: TicketsTableProps) {
  if (!tickets.length) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">No tickets found for this organization yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600">
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Requester</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Confidence</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-4 py-3">
                <Link className="font-medium text-slate-900 hover:underline" href={`/tickets/${ticket.id}`}>
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{ticket.requesterName ?? ticket.requesterEmail}</td>
              <td className="px-4 py-3 text-slate-600">{ticket.status}</td>
              <td className="px-4 py-3 text-slate-600">{ticket.priority}</td>
              <td className="px-4 py-3 text-slate-600">
                {ticket.confidenceScore !== null ? ticket.confidenceScore.toFixed(2) : "Not scored"}
              </td>
              <td className="px-4 py-3 text-slate-600">{new Date(ticket.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
