import Link from "next/link";

import type { KnowledgeDocumentListItem } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type DocumentListProps = {
  documents: KnowledgeDocumentListItem[];
};

export function DocumentList({ documents }: DocumentListProps) {
  if (!documents.length) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">No knowledge documents uploaded yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Chunks</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="px-4 py-3">
                <Link className="font-medium text-slate-900 hover:underline" href={`/knowledge-base/${document.id}`}>
                  {document.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{document.sourceType}</td>
              <td className="px-4 py-3 text-slate-600">{document.status}</td>
              <td className="px-4 py-3 text-slate-600">{document.metadata?.chunkCount ?? 0}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(document.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
