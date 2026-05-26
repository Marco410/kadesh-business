/** Montos mínimos en MXN según configuración por defecto de Stripe para MSI. */
export const MSI_PLAN_MINIMUMS_MXN = [
  { months: 3, minAmount: 300 },
  { months: 6, minAmount: 600 },
  { months: 9, minAmount: 30000 },
  { months: 12, minAmount: 30000 },
] as const;

export function isMxnCurrency(currency: string | null | undefined): boolean {
  return (currency ?? "").trim().toUpperCase() === "MXN";
}

/** Plazos de MSI potencialmente disponibles según el monto (MXN). */
export function getEligibleInstallmentMonths(
  amount: number,
  currency: string | null | undefined,
): number[] {
  if (!isMxnCurrency(currency) || !Number.isFinite(amount) || amount <= 0) {
    return [];
  }
  return MSI_PLAN_MINIMUMS_MXN.filter(({ minAmount }) => amount >= minAmount).map(
    ({ months }) => months,
  );
}

export function formatInstallmentMonthsList(months: number[]): string {
  if (months.length === 0) return "";
  if (months.length === 1) return `${months[0]} meses`;
  const last = months[months.length - 1];
  const rest = months.slice(0, -1).join(", ");
  return `${rest} o ${last} meses`;
}
