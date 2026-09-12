export const KADESH_URIM_AI_NAME = "Kadesh AI";

export const AI_BILLING_MODE = {
  BYOK: "byok",
  MANAGED: "managed",
} as const;

export type AiBillingMode =
  (typeof AI_BILLING_MODE)[keyof typeof AI_BILLING_MODE];

export const AI_BILLING_MODE_OPTIONS = [
  {
    value: AI_BILLING_MODE.BYOK,
    label: "API key propia",
    description:
      "Usas tu cuenta de Claude, OpenAI o Gemini. Kadesh no cobra créditos por las llamadas.",
  },
  {
    value: AI_BILLING_MODE.MANAGED,
    label: "Administrado por Kadesh",
    description:
      "Kadesh llama al modelo. Se cobra de la misma bolsa de créditos que la extracción de leads.",
  },
] as const;

export const AI_PROVIDER = {
  ANTHROPIC: "anthropic",
  OPENAI: "openai",
  GEMINI: "gemini",
} as const;

export type AiProviderKey = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const AI_PROVIDER_OPTIONS = [
  { label: "Claude (Anthropic)", value: AI_PROVIDER.ANTHROPIC },
  { label: "OpenAI", value: AI_PROVIDER.OPENAI },
  { label: "Gemini (Google)", value: AI_PROVIDER.GEMINI },
] as const;

export const DEFAULT_AI_MODELS: Record<AiProviderKey, string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4o",
  gemini: "gemini-2.5-flash",
};

export const ONBOARDING_CONTEXT_FIELDS = [
  {
    key: "onboardingMainOffer",
    label: "Oferta principal",
    title: 'El "Qué" — Oferta principal',
    shortLabel: "Qué",
    placeholder:
      "En una o dos oraciones: ¿qué servicio o producto principal vendes?",
    hint: "Escríbelo en el recuadro: qué vendes y qué resultado le das al cliente.",
  },
  {
    key: "onboardingIdealCustomer",
    label: "Cliente ideal",
    title: 'El "Quién" — Cliente ideal',
    shortLabel: "Quién",
    placeholder: "Ej. clínicas dentales, constructoras, restaurantes…",
    hint: "Quién te compra de verdad: industria, cargo o tipo de empresa.",
  },
  {
    key: "onboardingAvgTicketValue",
    label: "Ticket o valor",
    title: 'El "Cuánto" — Ticket o valor',
    shortLabel: "Cuánto",
    placeholder:
      "Precio promedio, o cuánto ayudas a ganar o ahorrar a tus clientes",
    hint: "Precio, rango o valor. Si puedes, incluye moneda y si es mensual o por proyecto.",
  },
  {
    key: "onboardingSalesPain",
    label: "Adquisición y dolores al vender",
    title: 'El "Cómo" — Adquisición y dolores al vender',
    shortLabel: "Cómo",
    placeholder: "¿Cómo consigues clientes hoy y qué te cuesta más al vender?",
    hint: "Cómo llegan hoy los clientes y qué se traba al cerrar.",
  },
] as const;

export type OnboardingContextKey =
  (typeof ONBOARDING_CONTEXT_FIELDS)[number]["key"];

export function isAiBillingMode(value: string): value is AiBillingMode {
  return value === AI_BILLING_MODE.BYOK || value === AI_BILLING_MODE.MANAGED;
}

export function isAiProviderKey(value: string): value is AiProviderKey {
  return (
    value === AI_PROVIDER.ANTHROPIC ||
    value === AI_PROVIDER.OPENAI ||
    value === AI_PROVIDER.GEMINI
  );
}

/** BYOK con key guardada, o modalidad administrada. */
export function isCompanyAiConfigured(
  company:
    | {
        aiBillingMode?: string | null;
        aiApiKeyPreview?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!company) return false;
  if (company.aiBillingMode === AI_BILLING_MODE.MANAGED) return true;
  return Boolean(company.aiApiKeyPreview?.trim());
}

/**
 * Cobro y cupo de IA administrada. Deben coincidir con kadesh-back
 * (`tokenCredits.ts` y el primer eslabón de `MANAGED_GEMINI_FALLBACK`).
 */
export const AI_TOKENS_PER_CREDIT = 1_000;
export const AI_OUTPUT_TOKEN_WEIGHT = 5;
/** Créditos típicos de un digest diario corto en modalidad administrada. */
export const TYPICAL_DIGEST_CREDITS = 4;
export const AI_MANAGED_MAX_PER_MINUTE = 15;
export const AI_MANAGED_MAX_PER_DAY = 500;
