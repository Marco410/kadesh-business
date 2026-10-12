/**
 * De dónde llegó la persona antes de registrarse (primer contacto): parámetros UTM, el sitio
 * que la mandó y la primera página que vio. Se guarda en el navegador en la primera visita y
 * se manda una sola vez, al registrarse (`registerUser` / `authenticateUserWithGoogle`).
 *
 * - Primer contacto: si ya hay uno guardado no se pisa (dura 90 días).
 * - Del referrer solo se guarda el dominio y de la página la ruta sin query: la URL completa
 *   puede traer datos de la persona. El back vuelve a limpiar todo (`cleanAttribution`).
 * - Si la persona rechazó las cookies no se guarda nada (ver `AttributionTracker`).
 */

export const ATTRIBUTION_STORAGE_KEY = "kadesh-attribution";

const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_TEXT = 200;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type SignupAttribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  referrer?: string;
  landingPath?: string;
  firstSeenAt: string;
};

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");

/** Dominio del sitio que mandó a la persona; vacío si llegó directo o desde el mismo sitio. */
function externalReferrer(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).hostname;
    if (!host || bareHost(host) === bareHost(window.location.hostname)) return undefined;
    return host.toLowerCase();
  } catch {
    return undefined;
  }
}

/** Lo guardado, si sigue vigente. */
export function readAttribution(): SignupAttribution | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupAttribution;
    const age = Date.now() - new Date(parsed?.firstSeenAt).getTime();
    if (!parsed?.firstSeenAt || Number.isNaN(age) || age > MAX_AGE_MS) {
      store.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda el primer contacto con la URL actual. Si ya hay uno vigente, no hace nada. */
export function captureFirstTouch(): void {
  const store = storage();
  if (!store || readAttribution()) return;
  const url = new URL(window.location.href);
  const attribution: SignupAttribution = {
    firstSeenAt: new Date().toISOString(),
    landingPath: url.pathname.slice(0, 300),
  };
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, MAX_TEXT);
  }
  const referrer = externalReferrer();
  if (referrer) attribution.referrer = referrer;
  try {
    store.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    /* modo privado o sin espacio: sin atribución */
  }
}

export function clearAttribution(): void {
  try {
    storage()?.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * El back todavía no acepta `attribution` (se publicó el front antes que el back). Con esto el
 * registro se reintenta sin ese dato en vez de fallar. Se puede quitar cuando el back con
 * atribución ya esté en producción.
 */
export function isAttributionArgumentError(error: unknown): boolean {
  const e = error as {
    message?: string;
    graphQLErrors?: ReadonlyArray<{ message?: string }>;
    networkError?: { result?: unknown } | null;
  } | null;
  const messages = [e?.message ?? "", ...(e?.graphQLErrors ?? []).map((g) => g?.message ?? "")];
  const result = e?.networkError?.result as { errors?: Array<{ message?: string }> } | undefined;
  if (result && typeof result === "object" && Array.isArray(result.errors)) {
    messages.push(...result.errors.map((g) => g?.message ?? ""));
  }
  return messages.some((message) => message.includes('Unknown argument "attribution"'));
}
