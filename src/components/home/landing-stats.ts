/**
 * Cifras públicas de la landing (`landingStats` en kadesh-back): conteos agregados de la base.
 * Se piden en el servidor con ISR de 6 h (el back también cachea 6 h). Si el API falla, `null`
 * y la franja no se muestra: mejor nada que un número inventado.
 */
export type LandingStats = {
  leadsTotal: number;
  leadsWithPhone: number;
  categories: number;
  cities: number;
  companies: number;
};

const REVALIDATE_SECONDS = 6 * 60 * 60;

const LANDING_STATS_QUERY = `
  query LandingStats {
    landingStats {
      leadsTotal
      leadsWithPhone
      categories
      cities
      companies
    }
  }
`;

export async function fetchLandingStats(): Promise<LandingStats | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: LANDING_STATS_QUERY }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      data?: { landingStats?: LandingStats | null };
      errors?: unknown[];
    };
    if (payload.errors?.length) return null;
    return payload.data?.landingStats ?? null;
  } catch {
    return null;
  }
}

/** Redondea hacia abajo para presumir sin exagerar: 48,321 → "48,000+", 734 → "700+". */
export function roundDownForDisplay(value: number): number {
  if (value >= 10_000) return Math.floor(value / 1_000) * 1_000;
  if (value >= 1_000) return Math.floor(value / 100) * 100;
  if (value >= 100) return Math.floor(value / 10) * 10;
  return value;
}
