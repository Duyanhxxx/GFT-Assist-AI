import type { TicketPriority, TicketStatus } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const variant =
    status === "RESOLVED"
      ? "success"
      : status === "ESCALATED" || status === "SPAM"
        ? "danger"
        : status === "WAITING_CUSTOMER"
          ? "warning"
          : "info";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const variant =
    priority === "CRITICAL" || priority === "URGENT"
      ? "danger"
      : priority === "HIGH"
        ? "warning"
        : priority === "MEDIUM"
          ? "info"
          : "default";

  return <Badge variant={variant}>{priority}</Badge>;
}

export function TicketConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge>Not scored</Badge>;
  }

  const variant = score >= 0.8 ? "success" : score >= 0.55 ? "warning" : "danger";

  return <Badge variant={variant}>{new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 }).format(score)}</Badge>;
}
