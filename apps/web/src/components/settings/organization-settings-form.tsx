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

import { createOrganizationSettingsSchema, type OrganizationSettingsValues } from "@/features/settings/schema";
import { getIntlLocale } from "@/lib/i18n/config";
import { updateOrganizationSettings } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/browser";
import { useLocale } from "@/providers/locale-provider";
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
  const { locale, t } = useLocale();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = role !== "ADMIN";
  const organizationSettingsSchema = createOrganizationSettingsSchema(t);
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
        setError(t("auth.sessionExpired"));
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
      setStatus(t("settings.saveSuccess"));
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t("system.unableUpdateSettings"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="surface-elevated rounded-[32px]">
        <CardHeader className="gap-4 p-8 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isReadOnly ? "warning" : "success"}>{isReadOnly ? t("common.readOnly") : t("common.editable")}</Badge>
            <Badge>{role}</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl md:text-3xl">{t("settings.pageTitle")}</CardTitle>
            <CardDescription className="text-sm leading-7">
              {t("settings.pageDescription")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Section
              description={t("settings.aiControlsDescription")}
              icon={Bot}
              title={t("settings.aiControls")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("settings.fields.aiModel")} error={form.formState.errors.aiModel?.message}>
                  <Input disabled={isReadOnly} {...form.register("aiModel")} />
                </Field>
                <Field label={t("settings.fields.embeddingModel")} error={form.formState.errors.embeddingModel?.message}>
                  <Input disabled={isReadOnly} {...form.register("embeddingModel")} />
                </Field>
                <Field label={t("settings.fields.temperature")} error={form.formState.errors.temperature?.message}>
                  <Input disabled={isReadOnly} step="0.01" type="number" {...form.register("temperature")} />
                </Field>
                <Field label={t("settings.fields.confidenceThreshold")} error={form.formState.errors.confidenceThreshold?.message}>
                  <Input disabled={isReadOnly} step="0.01" type="number" {...form.register("confidenceThreshold")} />
                </Field>
              </div>
            </Section>

            <Section
              description={t("settings.knowledgeRetrievalDescription")}
              icon={DatabaseZap}
              title={t("settings.knowledgeRetrieval")}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t("settings.fields.chunkSize")} error={form.formState.errors.chunkSize?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("chunkSize")} />
                </Field>
                <Field label={t("settings.fields.chunkOverlap")} error={form.formState.errors.chunkOverlap?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("chunkOverlap")} />
                </Field>
                <Field label={t("settings.fields.retrievalTopK")} error={form.formState.errors.retrievalTopK?.message}>
                  <Input disabled={isReadOnly} type="number" {...form.register("retrievalTopK")} />
                </Field>
              </div>
            </Section>

            <Section
              description={t("settings.changeWindowDescription")}
              icon={SlidersHorizontal}
              title={t("settings.changeWindow")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label={t("settings.info.created")} value={formatDate(settings.createdAt, locale)} />
                <InfoBlock label={t("settings.info.updated")} value={formatDate(settings.updatedAt, locale)} />
              </div>
              {isReadOnly ? (
                <Alert className="mt-4" icon={<Lock className="h-4 w-4" />} variant="warning">
                  {t("settings.readOnlyMessage")}
                </Alert>
              ) : null}
            </Section>

            {status ? <Alert variant="success">{status}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button disabled={isReadOnly || isSubmitting} size="lg" type="submit">
              {isSubmitting ? t("common.saving") : t("common.saveSettings")}
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
                <CardTitle>{t("settings.configurationGuardrails")}</CardTitle>
                <CardDescription>{t("settings.configurationGuardrailsDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoBlock label={t("settings.fields.temperature")} value={t("settings.guardrails.temperature")} />
            <InfoBlock label={t("settings.fields.confidenceThreshold")} value={t("settings.guardrails.confidence")} />
            <InfoBlock label={t("settings.fields.chunkSize")} value={t("settings.guardrails.chunkSize")} />
            <InfoBlock label={t("settings.fields.retrievalTopK")} value={t("settings.guardrails.topK")} />
          </CardContent>
        </Card>

        <Card className="rounded-[32px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                <History className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t("settings.recentChanges")}</CardTitle>
                <CardDescription>{t("settings.recentChangesDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentChanges.length ? (
              recentChanges.map((change) => (
                <div className="rounded-3xl border border-[color:var(--border)] p-4" key={change.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{t(`settings.actions.${change.action}`)}</p>
                    <Badge variant={change.actorType === "USER" ? "info" : change.actorType === "SYSTEM" ? "warning" : "default"}>
                      {t(`settings.actorTypes.${change.actorType}`)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{change.actorEmail ?? change.actorType}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{formatDate(change.createdAt, locale)}</p>
                </div>
              ))
            ) : (
              <EmptyState
                description={t("settings.noRecentChangesDescription")}
                icon={History}
                title={t("settings.noRecentChanges")}
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

function formatDate(value: string, locale: "en" | "vi") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
