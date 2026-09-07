import { useState } from "preact/hooks";

interface Props {
  regionSlug: string;
  regionDisplayName: string;
  whatsappNumber: string;
}

type CurrentProtection = "none" | "seguro" | "protecao_veicular" | "other";
type Urgency = "immediate" | "this_month" | "researching";
type Phase = "form" | "disqualified" | "submitting" | "success" | "error";

const STEP_COUNT = 5;

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

function waLink(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
  };
}

export default function LeadForm({ regionSlug, regionDisplayName, whatsappNumber }: Props) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [vehicleCount, setVehicleCount] = useState(1);
  const [currentProtection, setCurrentProtection] = useState<CurrentProtection | null>(null);
  const [cityRaw, setCityRaw] = useState(regionDisplayName);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function chooseOwnsVehicle(value: boolean) {
    if (!value) {
      setPhase("disqualified");
      return;
    }
    setStep(1);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setPhase("submitting");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone: normalizePhone(phone),
          email: email || undefined,
          ownsVehicle: true,
          vehicleCount,
          currentProtection,
          urgency,
          regionSlug,
          cityRaw,
          landingPage: window.location.href,
          referrer: document.referrer || undefined,
          ...getUtmParams(),
        }),
      });
      const json = (await res.json()) as { ok: boolean };
      if (!res.ok || !json.ok) throw new Error("submit_failed");
      setPhase("success");
      window.location.href = "/obrigado";
    } catch {
      setPhase("error");
    }
  }

  if (phase === "disqualified") {
    return (
      <div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p class="text-lg font-semibold text-brand-navy">
          Por enquanto a Protege Club atende quem já possui um veículo próprio.
        </p>
        <p class="mt-2 text-slate-600">
          Se quiser, fale com um consultor mesmo assim — ele pode te orientar melhor.
        </p>
        <a
          href={waLink(whatsappNumber, "Olá! Ainda não tenho veículo, mas quero saber mais sobre a Protege Club.")}
          target="_blank"
          rel="noopener noreferrer"
          class="mt-6 inline-block rounded-full bg-brand-orange px-6 py-3 font-semibold text-white transition hover:brightness-110"
        >
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p class="text-lg font-semibold text-brand-navy">Recebemos seus dados! Redirecionando...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div class="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full bg-brand-orange transition-all"
          style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Você já possui um veículo?</legend>
          <div class="mt-4 flex gap-3">
            <button type="button" onClick={() => chooseOwnsVehicle(true)} class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-brand-navy hover:border-brand-blue hover:bg-brand-blue/5">
              Sim
            </button>
            <button type="button" onClick={() => chooseOwnsVehicle(false)} class="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-brand-navy hover:border-brand-blue hover:bg-brand-blue/5">
              Ainda não
            </button>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Quantos veículos você quer proteger?</legend>
          <div class="mt-4 flex items-center justify-center gap-6">
            <button type="button" onClick={() => setVehicleCount((n) => Math.max(1, n - 1))} class="h-10 w-10 rounded-full border border-slate-200 text-xl font-bold text-brand-navy">
              -
            </button>
            <span class="text-2xl font-bold text-brand-navy">{vehicleCount}</span>
            <button type="button" onClick={() => setVehicleCount((n) => Math.min(10, n + 1))} class="h-10 w-10 rounded-full border border-slate-200 text-xl font-bold text-brand-navy">
              +
            </button>
          </div>
          <button type="button" onClick={() => setStep(2)} class="mt-6 w-full rounded-full bg-brand-orange py-3 font-semibold text-white hover:brightness-110">
            Continuar
          </button>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Você já tem seguro ou proteção veicular hoje?</legend>
          <div class="mt-4 grid gap-2">
            {(
              [
                ["none", "Não tenho nenhuma proteção"],
                ["seguro", "Tenho seguro tradicional"],
                ["protecao_veicular", "Já tenho proteção veicular (outra empresa)"],
                ["other", "Outro"],
              ] as [CurrentProtection, string][]
            ).map(([value, label]) => (
              <button
                type="button"
                onClick={() => {
                  setCurrentProtection(value);
                  setStep(3);
                }}
                class={`rounded-xl border py-3 text-left px-4 font-medium hover:border-brand-blue hover:bg-brand-blue/5 ${currentProtection === value ? "border-brand-blue bg-brand-blue/5" : "border-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Em qual cidade você mora?</legend>
          <input
            type="text"
            value={cityRaw}
            onInput={(e) => setCityRaw((e.target as HTMLInputElement).value)}
            class="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
            placeholder="Sua cidade"
          />
          <button
            type="button"
            disabled={!cityRaw.trim()}
            onClick={() => setStep(4)}
            class="mt-6 w-full rounded-full bg-brand-orange py-3 font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            Continuar
          </button>
        </fieldset>
      )}

      {step === 4 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Quando pretende contratar?</legend>
          <div class="mt-4 grid gap-2">
            {(
              [
                ["immediate", "O quanto antes"],
                ["this_month", "Ainda este mês"],
                ["researching", "Só pesquisando por enquanto"],
              ] as [Urgency, string][]
            ).map(([value, label]) => (
              <button
                type="button"
                onClick={() => {
                  setUrgency(value);
                  setStep(5);
                }}
                class={`rounded-xl border py-3 text-left px-4 font-medium hover:border-brand-blue hover:bg-brand-blue/5 ${urgency === value ? "border-brand-blue bg-brand-blue/5" : "border-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 5 && (
        <fieldset>
          <legend class="text-lg font-semibold text-brand-navy">Quase lá! Como podemos te chamar?</legend>
          <div class="mt-4 space-y-3">
            <input
              type="text"
              required
              value={fullName}
              onInput={(e) => setFullName((e.target as HTMLInputElement).value)}
              placeholder="Seu nome"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
            />
            <input
              type="tel"
              required
              value={phone}
              onInput={(e) => setPhone((e.target as HTMLInputElement).value)}
              placeholder="Seu WhatsApp, com DDD"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="E-mail (opcional)"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-brand-blue focus:outline-none"
            />
          </div>

          {phase === "error" && (
            <p class="mt-3 text-sm text-red-600">
              Não conseguimos enviar agora. Tente novamente ou fale direto no WhatsApp.
            </p>
          )}

          <button
            type="submit"
            disabled={phase === "submitting" || !fullName.trim() || !phone.trim()}
            class="mt-6 w-full rounded-full bg-brand-orange py-3 font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            {phase === "submitting" ? "Enviando..." : "Quero ser Protege Club"}
          </button>
        </fieldset>
      )}

      {step > 0 && phase === "form" && (
        <button type="button" onClick={() => setStep((s) => s - 1)} class="mt-4 text-sm text-slate-400 hover:text-slate-600">
          Voltar
        </button>
      )}
    </form>
  );
}
