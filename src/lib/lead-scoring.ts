import type { LeadPayload } from "./validation";

export type LeadTier = "hot" | "warm" | "cold" | "unqualified";

// Regions currently live -- keep in sync with src/content/regions/*.json `isActive: true` entries.
const ACTIVE_REGIONS = new Set(["rio-verde-go"]);

export interface LeadScoreResult {
  score: number;
  tier: LeadTier;
}

export function computeLeadScore(input: LeadPayload): LeadScoreResult {
  if (!input.ownsVehicle) {
    return { score: 0, tier: "unqualified" };
  }

  let score = 0;
  if (ACTIVE_REGIONS.has(input.regionSlug)) score += 30;
  if (input.urgency === "immediate") score += 30;
  else if (input.urgency === "this_month") score += 15;
  if (input.currentProtection === "none") score += 20;
  if (input.vehicleCount > 1) score += 10;
  if (input.phone.replace(/\D/g, "").length >= 10) score += 10;

  const tier: LeadTier = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
  return { score, tier };
}
