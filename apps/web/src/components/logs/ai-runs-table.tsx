"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, Clock3, Search, Ticket, TriangleAlert } from "lucide-react";

import type { AiRunListItem } from "@gft-assist/types";

import { AiRunEscalationBadge, AiRunOutcomeBadge, AiRunTypeBadge } from "@/components/logs/ai-run-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [escalationFilter, setEscalationFilter] = useState("ALL");

  const filteredRuns = useMemo(
    () =>
      runs.filter((run) => {
        const matchesQuery =
          !query ||
          run.ticketSubject.toLowerCase().includes(query.toLowerCase()) ||
          run.model.toLowerCase().includes(query.toLowerCase()) ||
          run.promptVersion.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "ALL" || run.type === typeFilter;
        const matchesEscalation =
          escalationFilter === "ALL" ||
          (escalationFilter === "ESCALATED" ? run.escalated : !run.escalated);

        return matchesQuery && matchesType && matchesEscalation;
      }),
    [escalationFilter, query, runs, typeFilter],
  );

  const summary = useMemo(
    () => ({
      total: runs.length,
      escalated: runs.filter((run) => run.escalated).length,
      avgLatency:
        runs.reduce((total, run) => total + (run.latencyMs ?? 0), 0) /
        Math.max(
          1,
          runs.reduce((count, run) => count + (run.latencyMs !== null ? 1 : 0), 0),
        ),
      avgConfidence:
        runs.reduce((total, run) => total + (run.confidenceScore ?? 0), 0) /
        Math.max(
          1,
          runs.reduce((count, run) => count + (run.confidenceScore !== null ? 1 : 0), 0),
        ),
    }),
    [runs],
  );

  if (!runs.length) {
    return (
      <Card className="rounded-[28px] p-6">
        <EmptyState
          description="AI actions and audit events will appear here once triage or grounded response flows run."
          icon={Bot}
          title="No AI runs yet"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total runs", value: formatNumber(summary.total), icon: Bot, helper: "Recorded AI decisions in this workspace." },
          { label: "Escalated", value: formatNumber(summary.escalated), icon: TriangleAlert, helper: "Runs that triggered human escalation." },
          { label: "Average latency", value: `${formatNumber(summary.avgLatency)} ms`, icon: Clock3, helper: "Mean model response time." },
          { label: "Average confidence", value: formatPercent(summary.avgConfidence), icon: Ticket, helper: "Mean confidence across scored runs." },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card className="rounded-[28px]" key={item.label}>
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.helper}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-[32px]">
        <CardHeader className="gap-4 border-b border-[color:var(--border)] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl">AI execution log</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Inspect model type, outcome, escalation, latency, and token usage without changing the underlying audit data.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{filteredRuns.length} visible</Badge>
              <Badge variant="info">Append-only audit</Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
              <Input
                className="pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ticket, model, or prompt version"
                value={query}
              />
            </div>
            <Select onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
              <option value="ALL">All run types</option>
              {Array.from(new Set(runs.map((run) => run.type))).map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setEscalationFilter(event.target.value)} value={escalationFilter}>
              <option value="ALL">All escalation states</option>
              <option value="ESCALATED">Escalated only</option>
              <option value="CONTAINED">Contained only</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/70">
              <tr className="border-b border-[color:var(--border)] text-left text-[color:var(--muted)]">
                <th className="px-6 py-4 font-medium">Ticket</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Outcome</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Latency</th>
                <th className="px-6 py-4 font-medium">Tokens</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Prompt</th>
                <th className="px-6 py-4 font-medium">Escalation</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length ? filteredRuns.map((run) => (
                <tr className="border-b border-[color:var(--border)] align-top hover:bg-slate-950/[0.03] dark:hover:bg-white/[0.03]" key={run.id}>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <Link className="text-sm font-semibold hover:opacity-75" href={`/tickets/${run.ticketId}`}>
                        {run.ticketSubject}
                      </Link>
                      <p className="text-xs text-[color:var(--muted)]">{formatDate(run.createdAt)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <AiRunTypeBadge type={run.type} />
                  </td>
                  <td className="px-6 py-5">
                    <AiRunOutcomeBadge outcome={run.outcome} />
                  </td>
                  <td className="px-6 py-5">{formatPercent(run.confidenceScore)}</td>
                  <td className="px-6 py-5">{formatNumber(run.latencyMs)}</td>
                  <td className="px-6 py-5">{formatNumber(run.totalTokens)}</td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium">{run.model}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{run.promptVersion}</td>
                  <td className="px-6 py-5">
                    <AiRunEscalationBadge escalated={run.escalated} />
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{formatDate(run.createdAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10" colSpan={10}>
                    <EmptyState
                      description="Try broadening the search or clearing one of the filters."
                      icon={Search}
                      title="No matching AI runs"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
