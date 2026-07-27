"use client";

import type { TicketPriority, TicketStatus } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";
import { getIntlLocale } from "@/lib/i18n/config";
import { useLocale } from "@/providers/locale-provider";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useLocale();
  const variant =
    status === "RESOLVED"
      ? "success"
      : status === "ESCALATED" || status === "SPAM"
        ? "danger"
        : status === "WAITING_CUSTOMER"
          ? "warning"
          : "info";
  return <Badge variant={variant}>{t(`tickets.statuses.${status}`)}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const { t } = useLocale();
  const variant =
    priority === "CRITICAL" || priority === "URGENT"
      ? "danger"
      : priority === "HIGH"
        ? "warning"
        : priority === "MEDIUM"
          ? "info"
          : "default";
  return <Badge variant={variant}>{t(`tickets.priorities.${priority}`)}</Badge>;
}

export function TicketConfidenceBadge({ score }: { score: number | null }) {
  const { locale, t } = useLocale();

  if (score === null) {
    return <Badge>{t("common.notScored")}</Badge>;
  }

  const variant = score >= 0.8 ? "success" : score >= 0.55 ? "warning" : "danger";

  return <Badge variant={variant}>{new Intl.NumberFormat(getIntlLocale(locale), { style: "percent", maximumFractionDigits: 0 }).format(score)}</Badge>;
}
