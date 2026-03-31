export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export function formatMoney(
  n: number | null | undefined,
  currency = "MXN",
): string {
  if (n == null || Number.isNaN(n)) return "—";
  const code = (currency?.trim() || "MXN").toUpperCase();
  try {
    const formatted = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).format(n);
    return `${formatted} ${code}`;
  } catch {
    const formatted = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      currencyDisplay: "narrowSymbol",
    }).format(n);
    return `${formatted} MXN`;
  }
}
