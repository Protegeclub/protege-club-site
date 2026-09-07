export const prerender = false;

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getSupabaseClient } from "../../lib/supabase";
import { pushLeadToBitrix } from "../../lib/bitrix";
import { computeLeadScore } from "../../lib/lead-scoring";
import { leadPayloadSchema } from "../../lib/validation";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const parsed = leadPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, { ok: false, error: "validation_failed", details: parsed.error.flatten() });
  }
  const input = parsed.data;
  const { score, tier } = computeLeadScore(input);

  const supabase = getSupabaseClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert({
      full_name: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      owns_vehicle: input.ownsVehicle,
      vehicle_count: input.vehicleCount,
      current_protection: input.currentProtection,
      urgency: input.urgency,
      region_slug: input.regionSlug,
      city_raw: input.cityRaw ?? null,
      lead_score: score,
      lead_tier: tier,
      utm_source: input.utmSource ?? null,
      utm_medium: input.utmMedium ?? null,
      utm_campaign: input.utmCampaign ?? null,
      utm_term: input.utmTerm ?? null,
      utm_content: input.utmContent ?? null,
      landing_page: input.landingPage ?? null,
      referrer: input.referrer ?? null,
      status: "new",
      raw_payload: input,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return json(500, { ok: false, error: "db_write_failed" });
  }

  const leadId = inserted.id as string;

  if ((tier === "hot" || tier === "warm") && env.BITRIX24_WEBHOOK_URL) {
    const bitrixResult = await pushLeadToBitrix(env.BITRIX24_WEBHOOK_URL, { ...input, score, tier });
    if (bitrixResult.ok) {
      await supabase
        .from("leads")
        .update({ status: "sent_to_bitrix", bitrix_lead_id: bitrixResult.bitrixLeadId })
        .eq("id", leadId);
    } else {
      await supabase
        .from("leads")
        .update({ status: "bitrix_failed", bitrix_error: bitrixResult.error })
        .eq("id", leadId);
    }
  }

  return json(200, { ok: true, leadId, tier });
};
