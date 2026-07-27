"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText } from "lucide-react";

import { runGroundedResponse } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { useLocale } from "@/providers/locale-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type RunGroundedResponseButtonProps = {
  ticketId: string;
};

export function RunGroundedResponseButton({ ticketId }: RunGroundedResponseButtonProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onRun() {
    setError(null);
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

      await runGroundedResponse(ticketId, session.access_token);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t("system.unableGenerateGroundedResponse"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" disabled={isSubmitting} onClick={onRun} size="lg" variant="secondary">
        <FileText className="h-4 w-4" />
        {isSubmitting ? t("common.generatingResponse") : t("common.generateGroundedResponse")}
      </Button>
      {error ? <Alert className="py-2" variant="danger">{error}</Alert> : null}
    </div>
  );
}
