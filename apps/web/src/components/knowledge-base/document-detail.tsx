import type { KnowledgeDocumentDetail } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type DocumentDetailProps = {
  document: KnowledgeDocumentDetail;
};

export function DocumentDetail({ document }: DocumentDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-slate-950">{document.title}</h1>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="mt-1 text-slate-900">{document.sourceType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1 text-slate-900">{document.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Storage path</dt>
            <dd className="mt-1 break-all text-slate-900">{document.storagePath}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Chunks</dt>
            <dd className="mt-1 text-slate-900">{document.metadata?.chunkCount ?? document.chunks.length}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-950">Chunk preview</h2>
        <div className="mt-4 space-y-4">
          {document.chunks.map((chunk) => (
            <div className="rounded-lg border border-slate-200 p-4" key={chunk.id}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Chunk {chunk.chunkIndex}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{chunk.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
