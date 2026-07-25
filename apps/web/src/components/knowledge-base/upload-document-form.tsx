"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { uploadKnowledgeDocument } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UploadDocumentForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!file) {
      setError("Select a file to upload.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Your session has expired.");
        return;
      }

      await uploadKnowledgeDocument(file, session.access_token);
      setStatus("Document uploaded and chunked successfully.");
      setFile(null);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to upload document.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Upload document</h2>
        <p className="mt-1 text-sm text-slate-600">Supports PDF, DOCX, TXT, and Markdown.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          accept=".pdf,.docx,.txt,.md,.markdown,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full text-sm text-slate-700"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </Card>
  );
}
