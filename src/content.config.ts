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
  }),
});

export const collections = { regions };
