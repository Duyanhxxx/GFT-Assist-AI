"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginValues } from "@/features/auth/schema";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <Card className="w-full max-w-md p-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
        <p className="text-sm text-slate-600">Access the support operations workspace.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-sm text-rose-600">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" {...form.register("password")} />
          <p className="text-sm text-rose-600">{form.formState.errors.password?.message}</p>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
