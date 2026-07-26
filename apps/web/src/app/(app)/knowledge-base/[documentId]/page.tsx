import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DocumentDetail } from "@/components/knowledge-base/document-detail";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchKnowledgeDocument, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type KnowledgeDocumentPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function KnowledgeDocumentPage({ params }: KnowledgeDocumentPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="rounded-[28px] p-8">
          <EmptyState
            description="Authentication must be configured before document inspection can load."
            icon={ArrowLeft}
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

  const { documentId } = await params;
  const response = await fetchKnowledgeDocument(documentId, accessToken).catch(() => null);

  if (!response) {
    notFound();
  }

  return (
    <main className="space-y-8 pb-10">
      <PageHeader
        actions={
          <Link href="/knowledge-base">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to library
            </Button>
          </Link>
        }
        description="Inspect document readiness, source metadata, and chunk-level previews used by the retrieval layer."
        eyebrow="Knowledge document"
        title={response.data.title}
      />

      <DocumentDetail document={response.data} />
    </main>
  );
}
