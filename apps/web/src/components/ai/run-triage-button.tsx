"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { runTicketTriage } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type RunTriageButtonProps = {
  ticketId: string;
};

export function RunTriageButton({ ticketId }: RunTriageButtonProps) {
  const router = useRouter();
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
        setError("Your session has expired.");
        return;
      }

      await runTicketTriage(ticketId, session.access_token);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to run triage.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button disabled={isSubmitting} onClick={onRun}>
        {isSubmitting ? "Running triage..." : "Run Gemini triage"}
      </Button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
