import type { DashboardSummary } from "@gft-assist/types";
import {
  Bot,
  Clock3,
  DatabaseZap,
  Flag,
  ShieldAlert,
  Sparkles,
  Ticket,
  TimerReset,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const primaryMetrics = [
  {
    label: "Total volume",
    value: (summary: DashboardSummary) => formatCount(summary.totalTickets),
    description: "Total tickets processed across the current workspace.",
    icon: Ticket,
    tone: "info" as const,
  },
  {
    label: "Pending queue",
    value: (summary: DashboardSummary) => formatCount(summary.pendingTickets),
    description: "Tickets still waiting for operator or AI completion.",
    icon: Clock3,
    tone: "warning" as const,
  },
  {
    label: "Resolved",
    value: (summary: DashboardSummary) => formatCount(summary.resolvedTickets),
    description: "Resolved outcomes across AI-assisted and manual handling.",
    icon: Sparkles,
    tone: "success" as const,
  },
  {
    label: "Escalated",
    value: (summary: DashboardSummary) => formatCount(summary.escalatedTickets),
    description: "Cases pushed to human review or priority routing.",
    icon: ShieldAlert,
    tone: "danger" as const,
  },
  {
    label: "Average confidence",
    value: (summary: DashboardSummary) => formatPercent(summary.averageConfidence),
    description: "Model confidence across recorded AI decisions.",
    icon: Bot,
    tone: "info" as const,
  },
  {
    label: "AI resolution rate",
    value: (summary: DashboardSummary) => formatPercent(summary.aiResolutionRate),
    description: "Share of AI runs that completed without escalation.",
    icon: Flag,
    tone: "success" as const,
  },
] as const;

const supportingMetrics = [
  {
    label: "Spam rate",
    key: "spamRate",
    value: (summary: DashboardSummary) => formatPercent(summary.spamRate),
  },
  {
    label: "Knowledge usage",
    key: "knowledgeBaseUsage",
    value: (summary: DashboardSummary) => formatCount(summary.knowledgeBaseUsage),
  },
  {
    label: "Human overrides",
    key: "humanOverrides",
    value: (summary: DashboardSummary) => formatCount(summary.humanOverrides),
  },
  {
    label: "Token usage",
    key: "totalTokenUsage",
    value: (summary: DashboardSummary) => formatCount(summary.totalTokenUsage),
  },
  {
    label: "Average latency",
    key: "averageLatencyMs",
    value: (summary: DashboardSummary) => formatMilliseconds(summary.averageLatencyMs),
  },
] as const;

export function DashboardSummaryGrid({ summary }: DashboardSummaryGridProps) {
  const queueRatio = summary.totalTickets > 0 ? summary.pendingTickets / summary.totalTickets : 0;
  const escalationRatio = summary.totalTickets > 0 ? summary.escalatedTickets / summary.totalTickets : 0;
  const resolvedRatio = summary.totalTickets > 0 ? summary.resolvedTickets / summary.totalTickets : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {primaryMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card className="rounded-[28px]" key={metric.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
                <div className="space-y-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-3xl">{metric.value(summary)}</CardTitle>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm leading-6 text-[color:var(--muted)]">{metric.description}</p>
                <Badge className="mt-4" variant={metric.tone}>
                  Live metric
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px]">
          <CardHeader>
            <CardTitle>Operational mix</CardTitle>
            <CardDescription>Current balance of pending, escalated, and resolved workload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "Pending queue", value: queueRatio, icon: TimerReset },
              { label: "Escalations", value: escalationRatio, icon: Users },
              { label: "Resolved flow", value: resolvedRatio, icon: DatabaseZap },
            ].map((item) => {
              const Icon = item.icon;
              const percentage = Math.max(item.value * 100, 4);

              return (
                <div className="space-y-2" key={item.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-[color:var(--muted)]" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-sm text-[color:var(--muted)]">{formatPercent(item.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950/6 dark:bg-white/8">
                    <div
                      className="h-2 rounded-full bg-[color:var(--foreground)]"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[28px]">
          <CardHeader>
            <CardTitle>Support signals</CardTitle>
            <CardDescription>Key AI quality and operational follow-through metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportingMetrics.map((metric) => (
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] px-4 py-3"
                key={metric.key}
              >
                <p className="text-sm text-[color:var(--muted-foreground)]">{metric.label}</p>
                <p className="text-sm font-semibold">{metric.value(summary)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
