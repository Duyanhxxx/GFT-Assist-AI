import Link from "next/link";
import { redirect } from "next/navigation";

import { DocumentList } from "@/components/knowledge-base/document-list";
import { UploadDocumentForm } from "@/components/knowledge-base/upload-document-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchKnowledgeDocuments, getServerAccessToken } from "@/lib/api/server";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Card className="p-8">
          <p className="text-sm text-slate-600">Configure Supabase before using the knowledge base.</p>
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Knowledge Base</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Document ingestion</h1>
        </div>
        <Link href="/tickets">
          <Button>Open tickets</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <UploadDocumentForm />
        {response ? (
          <DocumentList documents={response.data} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-slate-600">Unable to load knowledge documents.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
