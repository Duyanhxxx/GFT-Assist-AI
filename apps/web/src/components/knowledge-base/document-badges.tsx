import type { DocumentStatus, KnowledgeSourceType } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const variant =
    status === "READY"
      ? "success"
      : status === "FAILED"
        ? "danger"
        : status === "PROCESSING"
          ? "warning"
          : "default";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}

export function DocumentTypeBadge({ sourceType }: { sourceType: KnowledgeSourceType }) {
  return <Badge variant="info">{sourceType}</Badge>;
}
