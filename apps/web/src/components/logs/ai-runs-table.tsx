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
import { getIntlLocale } from "@/lib/i18n/config";
import { useLocale } from "@/providers/locale-provider";

type AiRunsTableProps = {
  runs: AiRunListItem[];
};

function formatPercent(value: number | null, locale: string, fallback: string) {
  if (value === null) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number | null, locale: string, fallback: string) {
  if (value === null) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AiRunsTable({ runs }: AiRunsTableProps) {
  const { locale, t } = useLocale();
  const intlLocale = getIntlLocale(locale);
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
          description={t("aiRuns.noRunsDescription")}
          icon={Bot}
          title={t("aiRuns.noRuns")}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("aiRuns.cards.totalRuns"), value: formatNumber(summary.total, intlLocale, "N/A"), icon: Bot, helper: t("aiRuns.cards.totalRunsHelper") },
          { label: t("aiRuns.cards.escalated"), value: formatNumber(summary.escalated, intlLocale, "N/A"), icon: TriangleAlert, helper: t("aiRuns.cards.escalatedHelper") },
          { label: t("aiRuns.cards.avgLatency"), value: `${formatNumber(summary.avgLatency, intlLocale, "N/A")} ms`, icon: Clock3, helper: t("aiRuns.cards.avgLatencyHelper") },
          { label: t("aiRuns.cards.avgConfidence"), value: formatPercent(summary.avgConfidence, intlLocale, "N/A"), icon: Ticket, helper: t("aiRuns.cards.avgConfidenceHelper") },
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
              <CardTitle className="text-xl">{t("aiRuns.tableTitle")}</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {t("aiRuns.tableDescription")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t("common.visibleCount", { count: filteredRuns.length })}</Badge>
              <Badge variant="info">{t("common.appendOnlyAudit")}</Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
              <Input
                className="pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.searchTicketModelPrompt")}
                value={query}
              />
            </div>
            <Select onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
              <option value="ALL">{t("common.allRunTypes")}</option>
              {Array.from(new Set(runs.map((run) => run.type))).map((type) => (
                <option key={type} value={type}>
                  {t(`aiRuns.types.${type}`)}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setEscalationFilter(event.target.value)} value={escalationFilter}>
              <option value="ALL">{t("common.allEscalationStates")}</option>
              <option value="ESCALATED">{t("aiRuns.escalationFilter.escalatedOnly")}</option>
              <option value="CONTAINED">{t("aiRuns.escalationFilter.containedOnly")}</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/70">
              <tr className="border-b border-[color:var(--border)] text-left text-[color:var(--muted)]">
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.ticket")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.type")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.outcome")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.confidence")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.latency")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.tokens")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.model")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.prompt")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.escalation")}</th>
                <th className="px-6 py-4 font-medium">{t("aiRuns.table.created")}</th>
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
                      <p className="text-xs text-[color:var(--muted)]">{formatDate(run.createdAt, intlLocale)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <AiRunTypeBadge type={run.type} />
                  </td>
                  <td className="px-6 py-5">
                    <AiRunOutcomeBadge outcome={run.outcome} />
                  </td>
                  <td className="px-6 py-5">{formatPercent(run.confidenceScore, intlLocale, "N/A")}</td>
                  <td className="px-6 py-5">{formatNumber(run.latencyMs, intlLocale, "N/A")}</td>
                  <td className="px-6 py-5">{formatNumber(run.totalTokens, intlLocale, "N/A")}</td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium">{run.model}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{run.promptVersion}</td>
                  <td className="px-6 py-5">
                    <AiRunEscalationBadge escalated={run.escalated} />
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{formatDate(run.createdAt, intlLocale)}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10" colSpan={10}>
                    <EmptyState
                      description={t("aiRuns.noMatchingDescription")}
                      icon={Search}
                      title={t("aiRuns.noMatching")}
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
