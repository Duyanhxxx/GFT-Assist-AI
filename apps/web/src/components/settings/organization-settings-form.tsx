"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";

import type {
  AppRole,
  OrganizationSettings,
  SettingsChangeItem,
  UpdateOrganizationSettingsInput,
} from "@gft-assist/types";

import { organizationSettingsSchema, type OrganizationSettingsValues } from "@/features/settings/schema";
import { updateOrganizationSettings } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">Organization settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure the AI model, grounding thresholds, and knowledge chunking behavior for this workspace.
          </p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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

          <div className="space-y-2 text-sm text-slate-600">
            <p>Created: {formatDate(settings.createdAt)}</p>
            <p>Updated: {formatDate(settings.updatedAt)}</p>
            {isReadOnly ? <p>Only admins can update organization settings.</p> : null}
          </div>

          {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <Button disabled={isReadOnly || isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save settings"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-950">Recent changes</h2>
        <div className="mt-4 space-y-4">
          {recentChanges.length ? (
            recentChanges.map((change) => (
              <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0" key={change.id}>
                <p className="text-sm font-medium text-slate-900">{change.action}</p>
                <p className="mt-1 text-sm text-slate-600">{change.actorEmail ?? change.actorType}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(change.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No configuration changes have been recorded yet.</p>
          )}
        </div>
      </Card>
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
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      <p className="text-sm text-rose-600">{error}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
