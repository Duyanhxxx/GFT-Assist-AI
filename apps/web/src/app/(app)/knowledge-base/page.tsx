import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Upload } from "lucide-react";

import { DocumentList } from "@/components/knowledge-base/document-list";
import { UploadDocumentForm } from "@/components/knowledge-base/upload-document-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchKnowledgeDocuments, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Authentication must be configured before the document ingestion workspace can load."
            icon={BookOpen}
            title="Configure Supabase to continue"
          />
        </Card>
      </main>
    );
  }

  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const response = await fetchKnowledgeDocuments(accessToken).catch(() => null);

  return (
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <>
            <Link href="/tickets">
              <Button variant="secondary">
                <BookOpen className="h-4 w-4" />
                Ticket queue
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        }
        description="Manage the content pipeline behind grounded support answers, from upload through chunk inspection and retrieval readiness."
        eyebrow="Knowledge base"
        title="Document ingestion"
      />

      <Card className="surface-elevated rounded-[32px] p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">RAG content workflow</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              Upload operator-approved sources, monitor processing state, and inspect the exact chunked content available to the AI layer.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
            <Upload className="h-4 w-4" />
            Premium ingestion workspace
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <UploadDocumentForm />
        {response ? (
          <DocumentList documents={response.data} />
        ) : (
          <Card className="rounded-[28px] p-6">
            <EmptyState
              description="The document library request did not return successfully."
              icon={Upload}
              title="Unable to load knowledge documents"
            />
          </Card>
        )}
      </div>
    </main>
  );
}
