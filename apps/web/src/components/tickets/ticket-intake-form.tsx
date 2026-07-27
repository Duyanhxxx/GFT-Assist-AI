"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, FolderKanban, Mail, UserRound } from "lucide-react";

import type { CreateTicketIntakeInput } from "@gft-assist/types";

import { createTicketIntakeSchema, type TicketIntakeValues } from "@/features/tickets/schema";
import { createTicketIntake } from "@/lib/api/client";
import { useLocale } from "@/providers/locale-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TicketIntakeForm() {
  const { t } = useLocale();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ticketIntakeSchema = createTicketIntakeSchema(t);
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
      setStatus(t("publicIntake.success"));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl rounded-[32px]">
      <CardHeader className="gap-3 p-8 pb-4">
        <CardTitle className="text-2xl md:text-3xl">{t("publicIntake.formTitle")}</CardTitle>
        <CardDescription className="text-sm leading-7">
          {t("publicIntake.formDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-8 pt-2">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FolderKanban,
              label: t("publicIntake.cards.workspace.label"),
              helper: t("publicIntake.cards.workspace.helper"),
            },
            {
              icon: Mail,
              label: t("publicIntake.cards.contact.label"),
              helper: t("publicIntake.cards.contact.helper"),
            },
            {
              icon: UserRound,
              label: t("publicIntake.cards.context.label"),
              helper: t("publicIntake.cards.context.helper"),
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
              <p className="text-sm font-semibold">{t("publicIntake.routingTitle")}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {t("publicIntake.routingDescription")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={form.formState.errors.organizationSlug?.message}
                helper={t("publicIntake.organizationSlugHelper")}
                htmlFor="organizationSlug"
                label={t("publicIntake.organizationSlug")}
              >
                <Input id="organizationSlug" placeholder={t("publicIntake.placeholders.organizationSlug")} {...form.register("organizationSlug")} />
              </Field>

              <Field
                error={form.formState.errors.requesterEmail?.message}
                helper={t("publicIntake.emailHelper")}
                htmlFor="requesterEmail"
                label={t("common.email")}
              >
                <Input id="requesterEmail" placeholder={t("publicIntake.placeholders.email")} type="email" {...form.register("requesterEmail")} />
              </Field>
            </div>

            <div className="mt-4">
              <Field
                error={form.formState.errors.requesterName?.message}
                helper={t("publicIntake.nameHelper")}
                htmlFor="requesterName"
                label={t("publicIntake.name")}
              >
                <Input id="requesterName" placeholder={t("publicIntake.placeholders.name")} {...form.register("requesterName")} />
              </Field>
            </div>
          </section>

          <section className="rounded-[28px] border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
            <div className="mb-5">
              <p className="text-sm font-semibold">{t("publicIntake.issueTitle")}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {t("publicIntake.issueDescription")}
              </p>
            </div>

            <div className="space-y-4">
              <Field
                error={form.formState.errors.subject?.message}
                helper={t("publicIntake.subjectHelper")}
                htmlFor="subject"
                label={t("publicIntake.subject")}
              >
                <Input id="subject" placeholder={t("publicIntake.placeholders.subject")} {...form.register("subject")} />
              </Field>

              <Field
                error={form.formState.errors.description?.message}
                helper={t("publicIntake.descriptionHelper")}
                htmlFor="description"
                label={t("publicIntake.descriptionField")}
              >
                <Textarea
                  id="description"
                  placeholder={t("publicIntake.placeholders.description")}
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
            {isSubmitting ? t("common.submitting") : t("common.submitTicket")}
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
