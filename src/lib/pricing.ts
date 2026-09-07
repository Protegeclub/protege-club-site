export interface SavingsRates {
  monthlyRatePercentOfVehicleValue: number;
  averageInsuranceRatePercentOfVehicleValue: number;
}

export interface SavingsResult {
  protectionMonthly: number;
  insuranceMonthly: number;
  monthlySavings: number;
  annualSavings: number;
}

export function computeSavings(vehicleValue: number, rates: SavingsRates): SavingsResult {
  const protectionMonthly = vehicleValue * rates.monthlyRatePercentOfVehicleValue;
  const insuranceMonthly = vehicleValue * rates.averageInsuranceRatePercentOfVehicleValue;
  const monthlySavings = Math.max(insuranceMonthly - protectionMonthly, 0);
  return {
    protectionMonthly,
    insuranceMonthly,
    monthlySavings,
    annualSavings: monthlySavings * 12,
  };
}
