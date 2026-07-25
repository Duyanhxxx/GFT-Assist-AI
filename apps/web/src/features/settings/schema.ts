import { z } from "zod";

export const organizationSettingsSchema = z
  .object({
    aiModel: z.string().trim().min(1, "AI model is required.").max(120, "AI model is too long."),
    temperature: z.coerce.number().min(0, "Temperature must be at least 0.").max(2, "Temperature must be at most 2."),
    confidenceThreshold: z.coerce
      .number()
      .min(0, "Confidence threshold must be at least 0.")
      .max(1, "Confidence threshold must be at most 1."),
    embeddingModel: z.string().trim().min(1, "Embedding model is required.").max(120, "Embedding model is too long."),
    chunkSize: z.coerce.number().int().min(200, "Chunk size must be at least 200.").max(4000, "Chunk size must be at most 4000."),
    chunkOverlap: z.coerce
      .number()
      .int()
      .min(0, "Chunk overlap must be at least 0.")
      .max(2000, "Chunk overlap must be at most 2000."),
    retrievalTopK: z.coerce.number().int().min(1, "Top-K must be at least 1.").max(20, "Top-K must be at most 20."),
  })
  .refine((values) => values.chunkOverlap < values.chunkSize, {
    message: "Chunk overlap must be smaller than chunk size.",
    path: ["chunkOverlap"],
  });

export type OrganizationSettingsValues = z.infer<typeof organizationSettingsSchema>;
