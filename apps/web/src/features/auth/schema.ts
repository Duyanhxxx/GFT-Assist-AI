import { z } from "zod";

type Translate = (key: string) => string;

export function createLoginSchema(t: Translate) {
  return z.object({
    email: z.email(t("validation.validEmail")),
    password: z.string().min(8, t("validation.passwordMin")),
  });
}

export function createForgotPasswordSchema(t: Translate) {
  return z.object({
    email: z.email(t("validation.validEmail")),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type ForgotPasswordValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
