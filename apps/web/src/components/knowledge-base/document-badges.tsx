"use client";

import type { DocumentStatus, KnowledgeSourceType } from "@gft-assist/types";

import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/providers/locale-provider";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useLocale();
  const variant =
    status === "READY"
      ? "success"
      : status === "FAILED"
        ? "danger"
        : status === "PROCESSING"
          ? "warning"
          : "default";
  return <Badge variant={variant}>{t(`knowledge.statuses.${status}`)}</Badge>;
}

export function DocumentTypeBadge({ sourceType }: { sourceType: KnowledgeSourceType }) {
  const { t } = useLocale();

  return <Badge variant="info">{t(`knowledge.types.${sourceType}`)}</Badge>;
}
