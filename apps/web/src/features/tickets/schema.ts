import { z } from "zod";

export const ticketIntakeSchema = z.object({
  organizationSlug: z.string().min(3, "Organization slug is required."),
  subject: z.string().min(3, "Subject is required.").max(240, "Subject is too long."),
  description: z.string().min(10, "Description is required.").max(10000, "Description is too long."),
  requesterEmail: z.email("Enter a valid email address."),
  requesterName: z.string().max(120, "Name is too long.").optional().or(z.literal("")),
});

export type TicketIntakeValues = z.infer<typeof ticketIntakeSchema>;
