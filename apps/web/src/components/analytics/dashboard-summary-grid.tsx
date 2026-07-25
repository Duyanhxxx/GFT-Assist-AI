import type { DashboardSummary } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type DashboardSummaryGridProps = {
  summary: DashboardSummary;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMilliseconds(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} ms`;
}

const METRICS = [
  {
    label: "Total tickets",
    key: "totalTickets",
    format: formatCount,
  },
  {
    label: "Pending tickets",
    key: "pendingTickets",
    format: formatCount,
  },
  {
    label: "Resolved tickets",
    key: "resolvedTickets",
    format: formatCount,
  },
  {
    label: "Escalated tickets",
    key: "escalatedTickets",
    format: formatCount,
  },
  {
    label: "Spam rate",
    key: "spamRate",
    format: formatPercent,
  },
  {
    label: "Average confidence",
    key: "averageConfidence",
    format: formatPercent,
  },
  {
    label: "AI resolution rate",
    key: "aiResolutionRate",
    format: formatPercent,
  },
  {
    label: "Knowledge base runs",
    key: "knowledgeBaseUsage",
    format: formatCount,
  },
  {
    label: "Human overrides",
    key: "humanOverrides",
    format: formatCount,
  },
  {
    label: "Total token usage",
    key: "totalTokenUsage",
    format: formatCount,
  },
  {
    label: "Average latency",
    key: "averageLatencyMs",
    format: formatMilliseconds,
  },
] as const;

export function DashboardSummaryGrid({ summary }: DashboardSummaryGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((metric) => (
        <Card className="p-6" key={metric.key}>
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.format(summary[metric.key])}</p>
        </Card>
      ))}
    </div>
  );
}
