import { z } from "zod";

export const leadPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  ownsVehicle: z.boolean(),
  vehicleCount: z.number().int().min(1).max(20).default(1),
  currentProtection: z.enum(["none", "seguro", "protecao_veicular", "other"]),
  urgency: z.enum(["immediate", "this_month", "researching"]),
  regionSlug: z.string().default("rio-verde-go"),
  cityRaw: z.string().trim().max(120).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  utmTerm: z.string().trim().max(120).optional(),
  utmContent: z.string().trim().max(120).optional(),
  landingPage: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(300).optional(),
});

export type LeadPayload = z.infer<typeof leadPayloadSchema>;
