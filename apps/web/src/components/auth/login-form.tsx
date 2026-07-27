"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";

import { createLoginSchema, type LoginValues } from "@/features/auth/schema";
import { createClient } from "@/lib/supabase/browser";
import { useLocale } from "@/providers/locale-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginSchema = createLoginSchema(t);
  const form = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = loginSchema.safeParse(values);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0];

          if (field === "email" || field === "password") {
            form.setError(field, {
              message: issue.message,
            });
          }
        });

        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword(result.data);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      window.location.href = "/dashboard";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg rounded-[32px]">
      <CardHeader className="gap-3 p-8 pb-4">
        <CardTitle className="text-2xl md:text-3xl">{t("auth.signIn")}</CardTitle>
        <CardDescription className="text-sm leading-6">
          {t("auth.signInDescription")}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-[color:var(--muted-foreground)]" htmlFor="password">
                {t("auth.password")}
              </label>
              <Link className="text-sm font-medium text-[color:var(--foreground)] hover:opacity-75" href="/forgot-password">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Input autoComplete="current-password" id="password" type="password" {...form.register("password")} />
            <p className="min-h-5 text-sm text-rose-600">{form.formState.errors.password?.message}</p>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
            {isSubmitting ? t("common.signingIn") : t("common.enterWorkspace")}
            {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
