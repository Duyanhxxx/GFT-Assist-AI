"use client";

import type { KnowledgeDocumentDetail } from "@gft-assist/types";
import { Database, FileCode2, FileSearch, FolderKanban, HardDrive, Text, TriangleAlert } from "lucide-react";

import { DocumentStatusBadge, DocumentTypeBadge } from "@/components/knowledge-base/document-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getIntlLocale } from "@/lib/i18n/config";
import { useLocale } from "@/providers/locale-provider";

type DocumentDetailProps = {
  document: KnowledgeDocumentDetail;
};

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return "0 B";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetail({ document }: DocumentDetailProps) {
  const { locale, t } = useLocale();
  const intlLocale = getIntlLocale(locale);

  return (
    <div className="space-y-6">
      <Card className="surface-elevated rounded-[32px]">
        <CardHeader className="gap-4 p-8 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <DocumentTypeBadge sourceType={document.sourceType} />
            <DocumentStatusBadge status={document.status} />
            <Badge>{t("knowledge.sourceMetadata.chunkCoverageDescription", { count: document.metadata?.chunkCount ?? document.chunks.length })}</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl leading-tight md:text-4xl">{document.title}</CardTitle>
            <CardDescription className="text-sm leading-7">
              {t("knowledge.detailHeroDescription")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-8 pt-2 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: FileCode2,
              label: t("knowledge.sourceMetadata.fileName"),
              value: document.metadata?.fileName ?? t("knowledge.sourceMetadata.unknownSource"),
              helper: document.mimeType,
            },
            {
              icon: HardDrive,
              label: t("knowledge.sourceMetadata.fileSize"),
              value: formatBytes(document.metadata?.sizeBytes),
              helper: t("knowledge.sourceMetadata.originalUploadSize"),
            },
            {
              icon: Database,
              label: t("knowledge.sourceMetadata.characters"),
              value: document.metadata?.characterCount?.toLocaleString(intlLocale) ?? "0",
              helper: t("knowledge.sourceMetadata.parsedTextVolume"),
            },
            {
              icon: FolderKanban,
              label: t("knowledge.sourceMetadata.processed"),
              value: formatDate(document.processedAt, intlLocale, t("common.notScored")),
              helper: t("knowledge.sourceMetadata.latestIngestionStatus"),
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35" key={item.label}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                <p className="mt-2 break-words text-sm font-semibold leading-6">{item.value}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{item.helper}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <FileSearch className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t("knowledge.metadataTitle")}</CardTitle>
                <CardDescription>{t("knowledge.metadataDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
              <p className="text-sm text-[color:var(--muted)]">{t("knowledge.sourceMetadata.storagePath")}</p>
              <p className="mt-2 break-all text-sm font-medium">{document.storagePath}</p>
            </div>
            {document.errorMessage ? (
              <Alert icon={<TriangleAlert className="h-4 w-4" />} variant="danger">
                {document.errorMessage}
              </Alert>
            ) : null}
            <div className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
              <p className="text-sm text-[color:var(--muted)]">{t("knowledge.sourceMetadata.chunkCoverage")}</p>
              <p className="mt-2 text-sm font-medium">
                {t("knowledge.sourceMetadata.chunkCoverageDescription", { count: document.metadata?.chunkCount ?? document.chunks.length })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <Text className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t("knowledge.chunkPreviewTitle")}</CardTitle>
                <CardDescription>{t("knowledge.chunkPreviewDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.chunks.length ? document.chunks.map((chunk) => (
              <div className="rounded-[28px] border border-[color:var(--border)] p-5" key={chunk.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="info">{t("knowledge.chunkLabel", { index: chunk.chunkIndex })}</Badge>
                  <p className="text-xs text-[color:var(--muted)]">
                    {chunk.tokenCount !== null ? `${chunk.tokenCount} ${t("common.tokens")}` : t("knowledge.tokenCountUnavailable")}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{chunk.content}</p>
              </div>
            )) : (
              <EmptyState
                description={t("knowledge.noChunkPreviewDescription")}
                icon={Text}
                title={t("knowledge.noChunkPreview")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
