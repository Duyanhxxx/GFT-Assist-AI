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
import { getIntlLocale } from "@/lib/i18n/config";
import { getServerTranslator } from "@/lib/i18n/server";

type DashboardSummaryGridProps = {
  summary: DashboardSummary;
};

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMilliseconds(value: number, locale: string, unitLabel: string) {
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value)} ${unitLabel}`;
}
export async function DashboardSummaryGrid({ summary }: DashboardSummaryGridProps) {
  const { locale, t } = await getServerTranslator();
  const intlLocale = getIntlLocale(locale);
  const queueRatio = summary.totalTickets > 0 ? summary.pendingTickets / summary.totalTickets : 0;
  const escalationRatio = summary.totalTickets > 0 ? summary.escalatedTickets / summary.totalTickets : 0;
  const resolvedRatio = summary.totalTickets > 0 ? summary.resolvedTickets / summary.totalTickets : 0;

  const primaryMetrics = [
    {
      label: t("dashboard.metrics.totalVolume"),
      value: formatCount(summary.totalTickets, intlLocale),
      description: t("dashboard.metrics.totalVolumeDescription"),
      icon: Ticket,
      tone: "info" as const,
    },
    {
      label: t("dashboard.metrics.pendingQueue"),
      value: formatCount(summary.pendingTickets, intlLocale),
      description: t("dashboard.metrics.pendingQueueDescription"),
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: t("dashboard.metrics.resolved"),
      value: formatCount(summary.resolvedTickets, intlLocale),
      description: t("dashboard.metrics.resolvedDescription"),
      icon: Sparkles,
      tone: "success" as const,
    },
    {
      label: t("dashboard.metrics.escalated"),
      value: formatCount(summary.escalatedTickets, intlLocale),
      description: t("dashboard.metrics.escalatedDescription"),
      icon: ShieldAlert,
      tone: "danger" as const,
    },
    {
      label: t("dashboard.metrics.averageConfidence"),
      value: formatPercent(summary.averageConfidence, intlLocale),
      description: t("dashboard.metrics.averageConfidenceDescription"),
      icon: Bot,
      tone: "info" as const,
    },
    {
      label: t("dashboard.metrics.aiResolutionRate"),
      value: formatPercent(summary.aiResolutionRate, intlLocale),
      description: t("dashboard.metrics.aiResolutionRateDescription"),
      icon: Flag,
      tone: "success" as const,
    },
  ] as const;

  const supportingMetrics = [
    {
      label: t("dashboard.signalLabels.spamRate"),
      key: "spamRate",
      value: formatPercent(summary.spamRate, intlLocale),
    },
    {
      label: t("dashboard.signalLabels.knowledgeUsage"),
      key: "knowledgeBaseUsage",
      value: formatCount(summary.knowledgeBaseUsage, intlLocale),
    },
    {
      label: t("dashboard.signalLabels.humanOverrides"),
      key: "humanOverrides",
      value: formatCount(summary.humanOverrides, intlLocale),
    },
    {
      label: t("dashboard.signalLabels.tokenUsage"),
      key: "totalTokenUsage",
      value: formatCount(summary.totalTokenUsage, intlLocale),
    },
    {
      label: t("dashboard.signalLabels.averageLatency"),
      key: "averageLatencyMs",
      value: formatMilliseconds(summary.averageLatencyMs, intlLocale, "ms"),
    },
  ] as const;

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
                  <CardTitle className="text-3xl">{metric.value}</CardTitle>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm leading-6 text-[color:var(--muted)]">{metric.description}</p>
                <Badge className="mt-4" variant={metric.tone}>{t("common.liveMetric")}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px]">
          <CardHeader>
            <CardTitle>{t("dashboard.operationalMix")}</CardTitle>
            <CardDescription>{t("dashboard.operationalMixDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: t("dashboard.mixLabels.pending"), value: queueRatio, icon: TimerReset },
              { label: t("dashboard.mixLabels.escalations"), value: escalationRatio, icon: Users },
              { label: t("dashboard.mixLabels.resolved"), value: resolvedRatio, icon: DatabaseZap },
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
                    <span className="text-sm text-[color:var(--muted)]">{formatPercent(item.value, intlLocale)}</span>
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
            <CardTitle>{t("dashboard.supportSignals")}</CardTitle>
            <CardDescription>{t("dashboard.supportSignalsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportingMetrics.map((metric) => (
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] px-4 py-3"
                key={metric.key}
              >
                <p className="text-sm text-[color:var(--muted-foreground)]">{metric.label}</p>
                <p className="text-sm font-semibold">{metric.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
