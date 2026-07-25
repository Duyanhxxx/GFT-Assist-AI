"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import type { CreateTicketIntakeInput } from "@gft-assist/types";

import { ticketIntakeSchema, type TicketIntakeValues } from "@/features/tickets/schema";
import { createTicketIntake } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TicketIntakeForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TicketIntakeValues>({
    defaultValues: {
      organizationSlug: "",
      subject: "",
      description: "",
      requesterEmail: "",
      requesterName: "",
    },
  });

  async function onSubmit(values: TicketIntakeValues) {
    setStatus(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = ticketIntakeSchema.safeParse(values);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0];

          if (
            field === "organizationSlug" ||
            field === "subject" ||
            field === "description" ||
            field === "requesterEmail" ||
            field === "requesterName"
          ) {
            form.setError(field, { message: issue.message });
          }
        });

        return;
      }

      const payload: CreateTicketIntakeInput = {
        organizationSlug: result.data.organizationSlug,
        subject: result.data.subject,
        description: result.data.description,
        requesterEmail: result.data.requesterEmail,
        ...(result.data.requesterName ? { requesterName: result.data.requesterName } : {}),
      };

      await createTicketIntake(payload);
      form.reset();
      setStatus("Your request has been received.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950">Submit a support request</h1>
        <p className="text-sm text-slate-600">Create a new ticket for your support team.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="organizationSlug">
              Organization slug
            </label>
            <Input id="organizationSlug" {...form.register("organizationSlug")} />
            <p className="text-sm text-rose-600">{form.formState.errors.organizationSlug?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="requesterEmail">
              Email
            </label>
            <Input id="requesterEmail" type="email" {...form.register("requesterEmail")} />
            <p className="text-sm text-rose-600">{form.formState.errors.requesterEmail?.message}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="requesterName">
            Name
          </label>
          <Input id="requesterName" {...form.register("requesterName")} />
          <p className="text-sm text-rose-600">{form.formState.errors.requesterName?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="subject">
            Subject
          </label>
          <Input id="subject" {...form.register("subject")} />
          <p className="text-sm text-rose-600">{form.formState.errors.subject?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="description">
            Description
          </label>
          <Textarea id="description" {...form.register("description")} />
          <p className="text-sm text-rose-600">{form.formState.errors.description?.message}</p>
        </div>

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit ticket"}
        </Button>
      </form>
    </Card>
  );
}
