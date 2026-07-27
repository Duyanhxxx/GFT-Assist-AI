"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, FileUp, Sparkles } from "lucide-react";

import { uploadKnowledgeDocument } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { useLocale } from "@/providers/locale-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDocumentForm() {
  const router = useRouter();
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function updateSelectedFile(nextFile: File | null) {
    setFile(nextFile);
    setError(null);
    setStatus(null);
  }

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
        setError(t("auth.sessionExpired"));
        return;
      }

      await uploadKnowledgeDocument(file, session.access_token);
      setStatus(t("knowledge.uploadSuccess"));
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to upload document.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="surface-elevated rounded-[32px]">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{t("knowledge.uploadTitle")}</CardTitle>
            <CardDescription>{t("knowledge.uploadDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-8 pt-2">
        <form className="space-y-5" onSubmit={onSubmit}>
          <button
            className={`flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-10 text-center outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] ${
              isDragging
                ? "border-[color:var(--primary)] bg-blue-500/8"
                : "border-[color:var(--border-strong)] bg-white/55 hover:border-[color:var(--primary)] hover:bg-white/70 dark:bg-slate-950/35 dark:hover:bg-slate-950/45"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              updateSelectedFile(event.dataTransfer.files?.[0] ?? null);
            }}
            type="button"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[color:var(--foreground)] text-white">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-semibold">{t("knowledge.dragTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {t("knowledge.dragDescription")}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              PDF · DOCX · TXT · Markdown
            </p>
          </button>

          <input
            accept=".pdf,.docx,.txt,.md,.markdown,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => updateSelectedFile(event.target.files?.[0] ?? null)}
            ref={inputRef}
            type="file"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
              <p className="text-sm text-[color:var(--muted)]">{t("knowledge.selectedFile")}</p>
              <p className="mt-2 break-words text-sm font-semibold">{file?.name ?? t("common.noFileSelected")}</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                {file ? formatFileSize(file.size) : t("knowledge.chooseFileHint")}
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                {t("knowledge.ingestionFlow")}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {t("knowledge.ingestionFlowDescription")}
              </p>
            </div>
          </div>

          {status ? <Alert variant="success">{status}</Alert> : null}
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button disabled={isSubmitting} size="lg" type="submit">
            {isSubmitting ? t("common.uploading") : t("common.uploadKnowledgeDocument")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
