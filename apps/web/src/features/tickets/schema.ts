import { z } from "zod";

type Translate = (key: string) => string;

export function createTicketIntakeSchema(t: Translate) {
  return z.object({
    organizationSlug: z.string().min(3, t("validation.organizationSlugRequired")),
    subject: z.string().min(3, t("validation.subjectRequired")).max(240, t("validation.subjectTooLong")),
    description: z.string().min(10, t("validation.descriptionRequired")).max(10000, t("validation.descriptionTooLong")),
    requesterEmail: z.email(t("validation.validEmail")),
    requesterName: z.string().max(120, t("validation.nameTooLong")).optional().or(z.literal("")),
  });
}

export type TicketIntakeValues = z.infer<ReturnType<typeof createTicketIntakeSchema>>;
