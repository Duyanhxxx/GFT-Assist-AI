import { SupportIntakeShell } from "@/components/tickets/support-intake-shell";
import { TicketIntakeForm } from "@/components/tickets/ticket-intake-form";

export default function SubmitTicketPage() {
  return (
    <SupportIntakeShell>
      <TicketIntakeForm />
    </SupportIntakeShell>
  );
}
