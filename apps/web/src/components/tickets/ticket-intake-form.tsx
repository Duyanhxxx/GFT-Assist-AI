"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, FolderKanban, Mail, UserRound } from "lucide-react";

import type { CreateTicketIntakeInput } from "@gft-assist/types";

import { ticketIntakeSchema, type TicketIntakeValues } from "@/features/tickets/schema";
import { createTicketIntake } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="w-full max-w-2xl rounded-[32px]">
      <CardHeader className="gap-3 p-8 pb-4">
        <CardTitle className="text-2xl md:text-3xl">Submit a support request</CardTitle>
        <CardDescription className="text-sm leading-7">
          Give your support team enough detail to classify, prioritize, and route the issue correctly the first time.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-8 pt-2">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FolderKanban,
              label: "Workspace",
              helper: "Tell us which organization queue should receive the request.",
            },
            {
              icon: Mail,
              label: "Contact",
              helper: "We use your email to send updates and ask for clarification if needed.",
            },
            {
              icon: UserRound,
              label: "Context",
              helper: "A clear subject and description help triage happen faster.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div className="rounded-3xl border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35" key={item.label}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.helper}</p>
              </div>
            );
          })}
        </div>

        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <section className="rounded-[28px] border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
            <div className="mb-5">
              <p className="text-sm font-semibold">Routing information</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                These fields tell the system where the request belongs and how to reach you.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={form.formState.errors.organizationSlug?.message}
                helper="The workspace identifier for your support team."
                htmlFor="organizationSlug"
                label="Organization slug"
              >
                <Input id="organizationSlug" placeholder="acme-support" {...form.register("organizationSlug")} />
              </Field>

              <Field
                error={form.formState.errors.requesterEmail?.message}
                helper="We’ll use this address for updates on your request."
                htmlFor="requesterEmail"
                label="Email"
              >
                <Input id="requesterEmail" placeholder="you@company.com" type="email" {...form.register("requesterEmail")} />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                error={form.formState.errors.requesterName?.message}
                helper="Optional, but helpful for faster routing."
                htmlFor="requesterName"
                label="Name"
              >
                <Input id="requesterName" placeholder="Jane Doe" {...form.register("requesterName")} />
              </Field>
            </div>
          </section>

          <section className="rounded-[28px] border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
            <div className="mb-5">
              <p className="text-sm font-semibold">Issue details</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Describe the problem clearly so the ticket can be triaged accurately.
              </p>
            </div>

            <div className="space-y-4">
              <Field
                error={form.formState.errors.subject?.message}
                helper="A short summary of the issue."
                htmlFor="subject"
                label="Subject"
              >
                <Input id="subject" placeholder="Unable to access billing settings" {...form.register("subject")} />
              </Field>

              <Field
                error={form.formState.errors.description?.message}
                helper="Include what happened, what you expected, and any relevant steps or errors."
                htmlFor="description"
                label="Description"
              >
                <Textarea
                  id="description"
                  placeholder="Describe the issue in as much detail as you can. Include steps to reproduce, relevant timestamps, and the impact on your work."
                  {...form.register("description")}
                />
              </Field>
            </div>
          </section>

          {status ? (
            <Alert icon={<CheckCircle2 className="h-4 w-4" />} variant="success">
              {status}
            </Alert>
          ) : null}
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
            {isSubmitting ? "Submitting..." : "Submit ticket"}
            {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  children,
  error,
  helper,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error: string | undefined;
  helper: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[color:var(--muted-foreground)]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      <p className="text-xs leading-5 text-[color:var(--muted)]">{helper}</p>
      <p className="min-h-5 text-sm text-rose-600">{error}</p>
    </div>
  );
}
