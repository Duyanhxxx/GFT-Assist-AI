"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Bot, DatabaseZap, History, Lock, Settings2, SlidersHorizontal } from "lucide-react";

import type {
  AppRole,
  OrganizationSettings,
  SettingsChangeItem,
  UpdateOrganizationSettingsInput,
} from "@gft-assist/types";

import { organizationSettingsSchema, type OrganizationSettingsValues } from "@/features/settings/schema";
import { updateOrganizationSettings } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

type OrganizationSettingsFormProps = {
  role: AppRole;
  settings: OrganizationSettings;
  recentChanges: SettingsChangeItem[];
};

export function OrganizationSettingsForm({ role, settings, recentChanges }: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = role !== "ADMIN";
  const form = useForm<OrganizationSettingsValues>({
    defaultValues: {
      aiModel: settings.aiModel,
      temperature: settings.temperature,
      confidenceThreshold: settings.confidenceThreshold,
      embeddingModel: settings.embeddingModel,
      chunkSize: settings.chunkSize,
      chunkOverlap: settings.chunkOverlap,
      retrievalTopK: settings.retrievalTopK,
    },
  });

  async function onSubmit(values: OrganizationSettingsValues) {
    setStatus(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = organizationSettingsSchema.safeParse(values);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0];

          if (
            field === "aiModel" ||
            field === "temperature" ||
            field === "confidenceThreshold" ||
            field === "embeddingModel" ||
            field === "chunkSize" ||
            field === "chunkOverlap" ||
            field === "retrievalTopK"
          ) {
            form.setError(field, { message: issue.message });
          }
        });

        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Your session has expired.");
        return;
      }

      const payload: UpdateOrganizationSettingsInput = {
        aiModel: result.data.aiModel,
        temperature: result.data.temperature,
        confidenceThreshold: result.data.confidenceThreshold,
        embeddingModel: result.data.embeddingModel,
        chunkSize: result.data.chunkSize,
        chunkOverlap: result.data.chunkOverlap,
        retrievalTopK: result.data.retrievalTopK,
      };

      const response = await updateOrganizationSettings(payload, session.access_token);
      form.reset({
        aiModel: response.data.settings.aiModel,
        temperature: response.data.settings.temperature,
        confidenceThreshold: response.data.settings.confidenceThreshold,
        embeddingModel: response.data.settings.embeddingModel,
        chunkSize: response.data.settings.chunkSize,
        chunkOverlap: response.data.settings.chunkOverlap,
        retrievalTopK: response.data.settings.retrievalTopK,
      });
      setStatus("Settings updated successfully.");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to update settings.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="surface-elevated rounded-[32px]">
        <CardHeader className="gap-4 p-8 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isReadOnly ? "warning" : "success"}>{isReadOnly ? "Read only" : "Editable"}</Badge>
            <Badge>{role}</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl md:text-3xl">Organization settings</CardTitle>
            <CardDescription className="text-sm leading-7">
              Configure model behavior, retrieval tuning, and knowledge chunking for this workspace without changing backend contracts.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Section
              description="Core runtime settings for response generation and decision confidence."
              icon={Bot}
              title="AI controls"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="AI model" error={form.formState.errors.aiModel?.message}>
                  <Input disabled={isReadOnly} {...form.register("aiModel")} />
                </Field>
                <Field label="Embedding model" error={form.formState.errors.embeddingModel?.message}>
                  <Input disabled={isReadOnly} {...form.register("embeddingModel")} />
                </Field>
                <Field label="Temperature" error={form.formState.errors.temperature?.message}>
                  <Input disabled={isReadOnly} step="0.01" type="number" {...form.register("temperature")} />
                </Field>
                <Field label="Confidence threshold" error={form.formState.errors.confidenceThreshold?.message}>
                  <Input disabled={isReadOnly} step="0.01" type="number" {...form.register("confidenceThreshold")} />
                </Field>
              </div>
            </Section>

            <Section
              description="Knowledge extraction and retrieval behavior for grounded answers."
              icon={DatabaseZap}
              title="Knowledge retrieval"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Chunk size" error={form.formState.errors.chunkSize?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("chunkSize")} />
                </Field>
                <Field label="Chunk overlap" error={form.formState.errors.chunkOverlap?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("chunkOverlap")} />
                </Field>
                <Field label="Retrieval top-K" error={form.formState.errors.retrievalTopK?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("retrievalTopK")} />
                </Field>
              </div>
            </Section>

            <Section
              description="Created and updated timestamps for configuration governance."
              icon={SlidersHorizontal}
              title="Change window"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label="Created" value={formatDate(settings.createdAt)} />
                <InfoBlock label="Updated" value={formatDate(settings.updatedAt)} />
              </div>
              {isReadOnly ? (
                <Alert className="mt-4" icon={<Lock className="h-4 w-4" />} variant="warning">
                  Only admins can update organization settings.
                </Alert>
              ) : null}
            </Section>

            {status ? <Alert variant="success">{status}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button disabled={isReadOnly || isSubmitting} size="lg" type="submit">
              {isSubmitting ? "Saving..." : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Configuration guardrails</CardTitle>
                <CardDescription>Recommended ranges to keep AI behavior stable and explainable.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoBlock label="Temperature" value="0 to 2" />
            <InfoBlock label="Confidence threshold" value="0 to 1" />
            <InfoBlock label="Chunk size" value="200 to 4000" />
            <InfoBlock label="Top-K" value="1 to 20" />
          </CardContent>
        </Card>

        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <History className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Recent changes</CardTitle>
                <CardDescription>Latest configuration events recorded by the existing audit trail.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentChanges.length ? (
              recentChanges.map((change) => (
                <div className="rounded-3xl border border-[color:var(--border)] p-4" key={change.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{change.action}</p>
                    <Badge variant={change.actorType === "USER" ? "info" : change.actorType === "SYSTEM" ? "warning" : "default"}>
                      {change.actorType}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{change.actorEmail ?? change.actorType}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{formatDate(change.createdAt)}</p>
                </div>
              ))
            ) : (
              <EmptyState
                description="Configuration updates will appear here after the first saved change."
                icon={History}
                title="No recent changes"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  error: string | undefined;
  children: ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[color:var(--muted-foreground)]">{label}</label>
      {children}
      <p className="min-h-5 text-sm text-rose-600">{error}</p>
    </div>
  );
}

function Section({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: (props: { className?: string }) => ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-[color:var(--border)] bg-white/55 p-5 dark:bg-slate-950/35">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
