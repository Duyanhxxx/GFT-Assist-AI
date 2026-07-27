"use client";

import type { AiDecisionOutcome, AiRunListItem } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/providers/locale-provider";

export function AiRunTypeBadge({ type }: { type: AiRunListItem["type"] }) {
  const { t } = useLocale();
  const variant = type === "TRIAGE" ? "info" : type === "RESPONSE" ? "success" : "default";
  return <Badge variant={variant}>{t(`aiRuns.types.${type}`)}</Badge>;
}

export function AiRunOutcomeBadge({ outcome }: { outcome: AiDecisionOutcome | null }) {
  const { t } = useLocale();
  if (!outcome) {
    return <Badge>{t("common.noOutcome")}</Badge>;
  }

  const variant =
    outcome === "AUTO_RESOLVED"
      ? "success"
      : outcome === "ESCALATED" || outcome === "SPAM_BLOCKED"
        ? "danger"
        : outcome === "URGENT_ROUTING" || outcome === "FOLLOW_UP_REQUIRED"
          ? "warning"
          : "info";
  return <Badge variant={variant}>{t(`aiRuns.outcomes.${outcome}`)}</Badge>;
}

export function AiRunEscalationBadge({ escalated }: { escalated: boolean }) {
  const { t } = useLocale();
  return <Badge variant={escalated ? "danger" : "success"}>{escalated ? t("common.escalated") : t("common.contained")}</Badge>;
}
