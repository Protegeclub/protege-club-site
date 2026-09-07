import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const regions = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/regions" }),
  schema: z.object({
    slug: z.string(),
    displayName: z.string(),
    state: z.string(),
    isActive: z.boolean(),
    heroHeadline: z.string(),
    heroSubheadline: z.string(),
    protectedResidentsCount: z.number(),
    whatsappNumber: z.string(),
    testimonialsRef: z.array(z.string()).default([]),
    tagline: z.string(),
    startingPriceLabel: z.string(),
    dailyPriceHint: z.string(),
    gracePeriodDays: z.number().optional(),
    supportHoursLabel: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/testimonials" }),
  schema: z.object({
    name: z.string(),
    city: z.string(),
    quote: z.string(),
    vehicle: z.string().optional(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

const plans = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/plans" }),
  schema: z.object({
    regionSlug: z.string(),
    monthlyRatePercentOfVehicleValue: z.number(),
    averageInsuranceRatePercentOfVehicleValue: z.number(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { regions, testimonials, faq, plans };
