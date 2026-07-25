import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DocumentDetail } from "@/components/knowledge-base/document-detail";
import { Card } from "@/components/ui/card";
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
        <Card className="p-8">
          <p className="text-sm text-slate-600">Configure Supabase before opening knowledge documents.</p>
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link className="text-sm text-slate-600 hover:text-slate-900" href="/knowledge-base">
        Back to knowledge base
      </Link>

      <div className="mt-6">
        <DocumentDetail document={response.data} />
      </div>
    </main>
  );
}
