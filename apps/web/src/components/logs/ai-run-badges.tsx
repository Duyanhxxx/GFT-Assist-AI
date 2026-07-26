import type { AiDecisionOutcome, AiRunListItem } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";

export function AiRunTypeBadge({ type }: { type: AiRunListItem["type"] }) {
  const variant = type === "TRIAGE" ? "info" : type === "RESPONSE" ? "success" : "default";
  return <Badge variant={variant}>{type.replaceAll("_", " ")}</Badge>;
}

export function AiRunOutcomeBadge({ outcome }: { outcome: AiDecisionOutcome | null }) {
  if (!outcome) {
    return <Badge>No outcome</Badge>;
  }

  const variant =
    outcome === "AUTO_RESOLVED"
      ? "success"
      : outcome === "ESCALATED" || outcome === "SPAM_BLOCKED"
        ? "danger"
        : outcome === "URGENT_ROUTING" || outcome === "FOLLOW_UP_REQUIRED"
          ? "warning"
          : "info";

  return <Badge variant={variant}>{outcome.replaceAll("_", " ")}</Badge>;
}

export function AiRunEscalationBadge({ escalated }: { escalated: boolean }) {
  return <Badge variant={escalated ? "danger" : "success"}>{escalated ? "Escalated" : "Contained"}</Badge>;
}
