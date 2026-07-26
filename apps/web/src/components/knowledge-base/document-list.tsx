"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, Database, FileSearch, Search } from "lucide-react";

import type { KnowledgeDocumentListItem } from "@gft-assist/types";

import { DocumentStatusBadge, DocumentTypeBadge } from "@/components/knowledge-base/document-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DocumentListProps = {
  documents: KnowledgeDocumentListItem[];
};

function formatDate(value: string) {
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

export function DocumentList({ documents }: DocumentListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const matchesQuery =
          !query ||
          document.title.toLowerCase().includes(query.toLowerCase()) ||
          document.metadata?.fileName.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || document.status === statusFilter;

        return matchesQuery && matchesStatus;
      }),
    [documents, query, statusFilter],
  );

  if (!documents.length) {
    return (
      <Card className="rounded-[28px] p-6">
        <EmptyState
          description="Upload a PDF, DOCX, TXT, or Markdown file to start building the retrieval library."
          icon={Database}
          title="No documents uploaded"
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[32px]">
      <CardHeader className="gap-4 border-b border-[color:var(--border)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Document library</CardTitle>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Review ingestion status, chunk readiness, and source metadata before using documents in grounded responses.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{filteredDocuments.length} visible</Badge>
            <Badge variant="info">{documents.filter((document) => document.status === "READY").length} ready</Badge>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
            <Input
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or file name"
              value={query}
            />
          </div>
          <Select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="ALL">All statuses</option>
            {Array.from(new Set(documents.map((document) => document.status))).map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/70">
              <tr className="border-b border-[color:var(--border)] text-left text-[color:var(--muted)]">
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Chunks</th>
                <th className="px-6 py-4 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length ? filteredDocuments.map((document) => (
                <tr
                  className="border-b border-[color:var(--border)] align-top hover:bg-slate-950/[0.03] dark:hover:bg-white/[0.03]"
                  key={document.id}
                >
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <Link className="text-sm font-semibold hover:opacity-75" href={`/knowledge-base/${document.id}`}>
                        {document.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                        <span>{document.metadata?.fileName ?? "Unknown file"}</span>
                        <span>•</span>
                        <span>{formatBytes(document.metadata?.sizeBytes)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <DocumentTypeBadge sourceType={document.sourceType} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <DocumentStatusBadge status={document.status} />
                      {document.processedAt ? (
                        <div className="inline-flex items-center gap-2 text-xs text-[color:var(--muted)]">
                          <Clock3 className="h-3.5 w-3.5" />
                          Processed {formatDate(document.processedAt)}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] px-3 py-2 text-sm">
                      <Database className="h-4 w-4 text-[color:var(--muted)]" />
                      {document.metadata?.chunkCount ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <p className="text-sm text-[color:var(--muted-foreground)]">{formatDate(document.createdAt)}</p>
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] hover:opacity-75"
                        href={`/knowledge-base/${document.id}`}
                      >
                        <FileSearch className="h-4 w-4" />
                        Inspect chunks
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10" colSpan={5}>
                    <EmptyState
                      description="Try adjusting the search query or clearing the status filter."
                      icon={Search}
                      title="No matching documents"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
