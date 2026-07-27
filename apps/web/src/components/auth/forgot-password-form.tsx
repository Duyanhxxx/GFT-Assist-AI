"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, MailCheck } from "lucide-react";

import { createForgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schema";
import { createClient } from "@/lib/supabase/browser";
import { env } from "@/lib/env";
import { useLocale } from "@/providers/locale-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const forgotPasswordSchema = createForgotPasswordSchema(t);
  const form = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setStatus(null);
    setError(null);

    const result = forgotPasswordSchema.safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") {
          form.setError("email", {
            message: issue.message,
          });
        }
      });

      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${env.appUrl}/login`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStatus(t("auth.passwordResetSent"));
  }

  return (
    <Card className="w-full max-w-lg rounded-[32px]">
      <CardHeader className="gap-3 p-8 pb-4">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]" href="/login">
          <ArrowLeft className="h-4 w-4" />
          {t("auth.backToSignIn")}
        </Link>
        <CardTitle className="text-2xl md:text-3xl">{t("auth.resetPassword")}</CardTitle>
        <CardDescription className="text-sm leading-6">
          {t("auth.resetPasswordDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-2">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--muted-foreground)]" htmlFor="email">
              {t("auth.workEmail")}
            </label>
            <Input autoComplete="email" id="email" placeholder="ops@company.com" type="email" {...form.register("email")} />
            <p className="min-h-5 text-sm text-rose-600">{form.formState.errors.email?.message}</p>
          </div>

          {status ? (
            <Alert icon={<MailCheck className="h-4 w-4" />} variant="success">
              {status}
            </Alert>
          ) : null}
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button className="w-full" size="lg" type="submit">
            {t("common.sendResetLink")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
