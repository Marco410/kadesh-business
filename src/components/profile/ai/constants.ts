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
      "Kadesh llama al modelo. Se cobra de la misma bolsa de créditos que la extracción de leads. 1 crédito = 1000 tokens de IA.",
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
    placeholder:
      "En una o dos oraciones: ¿qué servicio o producto principal vendes?",
  },
  {
    key: "onboardingIdealCustomer",
    label: "Cliente ideal",
    title: 'El "Quién" — Cliente ideal',
    placeholder: "Ej. clínicas dentales, constructoras, restaurantes…",
  },
  {
    key: "onboardingAvgTicketValue",
    label: "Ticket o valor",
    title: 'El "Cuánto" — Ticket o valor',
    placeholder:
      "Precio promedio, o cuánto ayudas a ganar o ahorrar a tus clientes",
  },
  {
    key: "onboardingSalesPain",
    label: "Adquisición y dolores al vender",
    title: 'El "Cómo" — Adquisición y dolores al vender',
    placeholder: "¿Cómo consigues clientes hoy y qué te cuesta más al vender?",
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

/** Créditos típicos de un digest diario corto en modalidad administrada. */
export const TYPICAL_DIGEST_CREDITS = 4;
