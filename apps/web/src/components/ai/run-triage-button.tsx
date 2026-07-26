"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrainCircuit } from "lucide-react";

import { runTicketTriage } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Alert } from "@/components/ui/alert";
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
      <Button className="w-full" disabled={isSubmitting} onClick={onRun} size="lg">
        <BrainCircuit className="h-4 w-4" />
        {isSubmitting ? "Running triage..." : "Run Gemini triage"}
      </Button>
      {error ? <Alert className="py-2" variant="danger">{error}</Alert> : null}
    </div>
  );
}
