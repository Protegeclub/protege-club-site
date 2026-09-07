import type { LeadPayload } from "./validation";
import type { LeadTier } from "./lead-scoring";

interface BitrixPushInput extends LeadPayload {
  score: number;
  tier: LeadTier;
}

export type BitrixPushResult = { ok: true; bitrixLeadId: string } | { ok: false; error: string };

export async function pushLeadToBitrix(
  webhookUrl: string,
  input: BitrixPushInput
): Promise<BitrixPushResult> {
  const [firstName, ...rest] = input.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const body = {
    fields: {
      TITLE: `Lead site - ${input.regionSlug} - ${input.fullName}`,
      NAME: firstName,
      LAST_NAME: lastName,
      STATUS_ID: "NEW",
      SOURCE_ID: "WEB",
      OPENED: "Y",
      PHONE: [{ VALUE: input.phone, VALUE_TYPE: "MOBILE" }],
      ...(input.email ? { EMAIL: [{ VALUE: input.email, VALUE_TYPE: "HOME" }] } : {}),
      UTM_SOURCE: input.utmSource,
      UTM_MEDIUM: input.utmMedium,
      UTM_CAMPAIGN: input.utmCampaign,
      COMMENTS: [
        `Veículos: ${input.vehicleCount}`,
        `Proteção atual: ${input.currentProtection}`,
        `Urgência: ${input.urgency}`,
        `Score: ${input.score} (${input.tier})`,
        `Cidade informada: ${input.cityRaw ?? "-"}`,
      ].join(" | "),
    },
  };

  try {
    const res = await fetch(`${webhookUrl.replace(/\/$/, "")}/crm.lead.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      result?: number;
      error?: string;
      error_description?: string;
    };
    if (!res.ok || json.error) {
      return { ok: false, error: json.error_description ?? json.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, bitrixLeadId: String(json.result) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}
