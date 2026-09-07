import { useMemo, useState } from "preact/hooks";
import { computeSavings, type SavingsRates } from "../../lib/pricing";

interface Props {
  rates: SavingsRates;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function SavingsCalculator({ rates }: Props) {
  const [vehicleValue, setVehicleValue] = useState(40000);

  const result = useMemo(() => computeSavings(vehicleValue, rates), [vehicleValue, rates]);

  return (
    <div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <label for="vehicle-value" class="block font-semibold text-brand-navy">
        Valor aproximado do seu veículo
      </label>
      <p class="mt-1 text-2xl font-bold text-brand-blue">{currency.format(vehicleValue)}</p>
      <input
        id="vehicle-value"
        type="range"
        min={10000}
        max={150000}
        step={5000}
        value={vehicleValue}
        onInput={(e) => setVehicleValue(Number((e.target as HTMLInputElement).value))}
        class="mt-3 w-full accent-brand-orange"
      />

      <div class="mt-8 grid grid-cols-2 gap-4 text-center">
        <div class="rounded-xl bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Seguro tradicional (média)</p>
          <p class="mt-1 text-lg font-bold text-slate-700">{currency.format(result.insuranceMonthly)}/mês</p>
        </div>
        <div class="rounded-xl bg-brand-blue/10 p-4">
          <p class="text-sm text-brand-navy">Protege Club (estimado)</p>
          <p class="mt-1 text-lg font-bold text-brand-navy">{currency.format(result.protectionMonthly)}/mês</p>
        </div>
      </div>

      <div class="mt-6 rounded-xl bg-brand-orange/10 p-4 text-center">
        <p class="text-sm text-brand-navy">Economia estimada</p>
        <p class="mt-1 text-2xl font-extrabold text-brand-orange">
          {currency.format(result.monthlySavings)}/mês
        </p>
        <p class="text-sm text-slate-600">até {currency.format(result.annualSavings)} por ano</p>
      </div>

      <p class="mt-4 text-center text-xs text-slate-400">
        Valores ilustrativos para fins de simulação. As mensalidades reais dependem do plano
        contratado e podem variar — confirme os valores exatos com um consultor.
      </p>

      <a
        href="#quero-proteger"
        class="mt-6 block w-full rounded-full bg-brand-orange py-3 text-center font-semibold text-white transition hover:brightness-110"
      >
        Quero confirmar meu valor real
      </a>
    </div>
  );
}
