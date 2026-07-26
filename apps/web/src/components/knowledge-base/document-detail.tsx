import type { KnowledgeDocumentDetail } from "@gft-assist/types";
import { Database, FileCode2, FileSearch, FolderKanban, HardDrive, Text, TriangleAlert } from "lucide-react";

import { DocumentStatusBadge, DocumentTypeBadge } from "@/components/knowledge-base/document-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type DocumentDetailProps = {
  document: KnowledgeDocumentDetail;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not processed";
  }

  return new Intl.DateTimeFormat("en-US", {
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
  return (
    <div className="space-y-6">
      <Card className="surface-elevated rounded-[32px]">
        <CardHeader className="gap-4 p-8 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <DocumentTypeBadge sourceType={document.sourceType} />
            <DocumentStatusBadge status={document.status} />
            <Badge>{document.metadata?.chunkCount ?? document.chunks.length} chunks</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl leading-tight md:text-4xl">{document.title}</CardTitle>
            <CardDescription className="text-sm leading-7">
              Inspect the raw source, ingestion status, and chunk previews that power grounded response generation.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-8 pt-2 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: FileCode2,
              label: "File name",
              value: document.metadata?.fileName ?? "Unknown source",
              helper: document.mimeType,
            },
            {
              icon: HardDrive,
              label: "File size",
              value: formatBytes(document.metadata?.sizeBytes),
              helper: "Original upload size",
            },
            {
              icon: Database,
              label: "Characters",
              value: document.metadata?.characterCount?.toLocaleString("en-US") ?? "0",
              helper: "Parsed text volume",
            },
            {
              icon: FolderKanban,
              label: "Processed",
              value: formatDate(document.processedAt),
              helper: "Latest ingestion status",
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
                <CardTitle>Source metadata</CardTitle>
                <CardDescription>Storage and ingestion details for this knowledge document.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
              <p className="text-sm text-[color:var(--muted)]">Storage path</p>
              <p className="mt-2 break-all text-sm font-medium">{document.storagePath}</p>
            </div>
            {document.errorMessage ? (
              <Alert icon={<TriangleAlert className="h-4 w-4" />} variant="danger">
                {document.errorMessage}
              </Alert>
            ) : null}
            <div className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
              <p className="text-sm text-[color:var(--muted)]">Chunk coverage</p>
              <p className="mt-2 text-sm font-medium">
                {document.metadata?.chunkCount ?? document.chunks.length} chunks available for retrieval preview.
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
                <CardTitle>Chunk preview</CardTitle>
                <CardDescription>Readable chunk samples so the retrieval layer is inspectable.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.chunks.length ? document.chunks.map((chunk) => (
              <div className="rounded-[28px] border border-[color:var(--border)] p-5" key={chunk.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="info">Chunk {chunk.chunkIndex}</Badge>
                  <p className="text-xs text-[color:var(--muted)]">
                    {chunk.tokenCount !== null ? `${chunk.tokenCount} tokens` : "Token count unavailable"}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{chunk.content}</p>
              </div>
            )) : (
              <EmptyState
                description="Chunks have not been generated for this document yet."
                icon={Text}
                title="No chunk preview available"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
