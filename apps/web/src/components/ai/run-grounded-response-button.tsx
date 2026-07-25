"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { runGroundedResponse } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type RunGroundedResponseButtonProps = {
  ticketId: string;
};

export function RunGroundedResponseButton({ ticketId }: RunGroundedResponseButtonProps) {
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

      await runGroundedResponse(ticketId, session.access_token);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to generate grounded response.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50" disabled={isSubmitting} onClick={onRun}>
        {isSubmitting ? "Generating response..." : "Generate grounded response"}
      </Button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
