"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schema";
import { createClient } from "@/lib/supabase/browser";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="w-full max-w-md p-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950">Forgot password</h1>
        <p className="text-sm text-slate-600">We will send a reset link to your email.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-sm text-rose-600">{form.formState.errors.email?.message}</p>
        </div>

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button className="w-full" type="submit">
          Send reset link
        </Button>
      </form>
    </Card>
  );
}
