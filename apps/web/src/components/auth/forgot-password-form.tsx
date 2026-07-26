"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, MailCheck } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schema";
import { createClient } from "@/lib/supabase/browser";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    setStatus("Password reset email sent.");
  }

  return (
    <Card className="w-full max-w-lg rounded-[32px]">
      <CardHeader className="gap-3 p-8 pb-4">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]" href="/login">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <CardTitle className="text-2xl md:text-3xl">Reset password</CardTitle>
        <CardDescription className="text-sm leading-6">
          Enter your work email and we&apos;ll send a secure reset link.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-2">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--muted-foreground)]" htmlFor="email">
              Work email
            </label>
            <Input autoComplete="email" id="email" placeholder="ops@company.com" type="email" {...form.register("email")} />
            <p className="min-h-5 text-sm text-rose-600">{form.formState.errors.email?.message}</p>
          </div>

          {status ? (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              <MailCheck className="h-4 w-4" />
              {status}
            </p>
          ) : null}
          {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}

          <Button className="w-full" size="lg" type="submit">
            Send reset link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
