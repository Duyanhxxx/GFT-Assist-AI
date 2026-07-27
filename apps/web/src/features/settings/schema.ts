import { z } from "zod";

type Translate = (key: string) => string;

export function createOrganizationSettingsSchema(t: Translate) {
  return z
    .object({
      aiModel: z.string().trim().min(1, t("validation.aiModelRequired")).max(120, t("validation.aiModelTooLong")),
      temperature: z.coerce.number().min(0, t("validation.temperatureMin")).max(2, t("validation.temperatureMax")),
      confidenceThreshold: z.coerce.number().min(0, t("validation.confidenceMin")).max(1, t("validation.confidenceMax")),
      embeddingModel: z.string().trim().min(1, t("validation.embeddingRequired")).max(120, t("validation.embeddingTooLong")),
      chunkSize: z.coerce.number().int().min(200, t("validation.chunkSizeMin")).max(4000, t("validation.chunkSizeMax")),
      chunkOverlap: z.coerce
        .number()
        .int()
        .min(0, t("validation.chunkOverlapMin"))
        .max(2000, t("validation.chunkOverlapMax")),
      retrievalTopK: z.coerce.number().int().min(1, t("validation.topKMin")).max(20, t("validation.topKMax")),
    })
    .refine((values) => values.chunkOverlap < values.chunkSize, {
      message: t("validation.chunkOverlapSmaller"),
      path: ["chunkOverlap"],
    });
}

export type OrganizationSettingsValues = z.infer<ReturnType<typeof createOrganizationSettingsSchema>>;
