import Link from "next/link";

import type { AiRunListItem } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type AiRunsTableProps = {
  runs: AiRunListItem[];
};

function formatPercent(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AiRunsTable({ runs }: AiRunsTableProps) {
  if (!runs.length) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">No AI runs have been recorded for this organization yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Tokens</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Prompt</th>
              <th className="px-4 py-3 font-medium">Escalated</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {runs.map((run) => (
              <tr className="align-top" key={run.id}>
                <td className="px-4 py-3">
                  <Link className="font-medium text-slate-900 hover:underline" href={`/tickets/${run.ticketId}`}>
                    {run.ticketSubject}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{run.type}</td>
                <td className="px-4 py-3 text-slate-700">{run.outcome ?? "N/A"}</td>
                <td className="px-4 py-3 text-slate-700">{formatPercent(run.confidenceScore)}</td>
                <td className="px-4 py-3 text-slate-700">{formatNumber(run.latencyMs)}</td>
                <td className="px-4 py-3 text-slate-700">{formatNumber(run.totalTokens)}</td>
                <td className="px-4 py-3 text-slate-700">{run.model}</td>
                <td className="px-4 py-3 text-slate-700">{run.promptVersion}</td>
                <td className="px-4 py-3 text-slate-700">{run.escalated ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-slate-700">{formatDate(run.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
