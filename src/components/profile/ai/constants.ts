import { formatDate } from "kadesh/utils/format-date";

export const KADESH_URIM_AI_NAME = "Kadesh AI";

/** `formatDate` para ir a media frase: “Generado hoy a las 1:05 AM”, “Actualizado hace 1 mes”. */
export function formatAiDateInline(dateString: string): string {
  const label = formatDate(dateString);
  return label.charAt(0).toLowerCase() + label.slice(1);
}

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

/** Pasos y consola oficial para BYOK. No promete precios ni cupos de esos proveedores. */
export const AI_PROVIDER_KEY_GUIDES: Record<
  AiProviderKey,
  {
    name: string;
    consoleLabel: string;
    href: string;
    steps: readonly [string, string, string];
  }
> = {
  anthropic: {
    name: "Claude",
    consoleLabel: "Crear key en Claude",
    href: "https://platform.claude.com/settings/keys",
    steps: [
      "Entra a platform.claude.com e inicia sesión (o crea una cuenta).",
      "Abre Settings → API keys.",
      "Pulsa Create key, ponle un nombre y copia la key. Solo la ves una vez.",
    ],
  },
  openai: {
    name: "OpenAI",
    consoleLabel: "Crear key en OpenAI",
    href: "https://platform.openai.com/api-keys",
    steps: [
      "Entra a platform.openai.com e inicia sesión (o crea una cuenta).",
      "Abre API keys.",
      "Pulsa Create new secret key, cópiala y pégala abajo. El cobro va a tu cuenta de OpenAI.",
    ],
  },
  gemini: {
    name: "Gemini",
    consoleLabel: "Crear key en Google",
    href: "https://aistudio.google.com/apikey",
    steps: [
      "Entra a aistudio.google.com/apikey con tu cuenta de Google.",
      "Pulsa Create API key y elige (o crea) un proyecto.",
      "Copia la key y pégala abajo. El cobro va a tu cuenta de Google.",
    ],
  },
};

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
    question: "¿Qué vendes?",
    placeholder:
      "En una o dos oraciones: ¿qué servicio o producto principal vendes?",
    example:
      "Ej. Instalamos paneles solares en negocios y les bajamos hasta 70% el recibo de luz.",
    hint: "Escríbelo en el recuadro: qué vendes y qué resultado le das al cliente.",
  },
  {
    key: "onboardingIdealCustomer",
    label: "Cliente ideal",
    title: 'El "Quién" — Cliente ideal',
    shortLabel: "Quién",
    question: "¿A quién le vendes?",
    placeholder: "Ej. clínicas dentales, constructoras, restaurantes…",
    example:
      "Ej. Restaurantes y hoteles de Querétaro con 10 a 50 empleados. Decide el dueño o el gerente general.",
    hint: "Quién te compra de verdad: industria, cargo o tipo de empresa.",
  },
  {
    key: "onboardingAvgTicketValue",
    label: "Ticket o valor",
    title: 'El "Cuánto" — Ticket o valor',
    shortLabel: "Cuánto",
    question: "¿Cuánto cuesta lo que vendes?",
    placeholder:
      "Precio promedio, o cuánto ayudas a ganar o ahorrar a tus clientes",
    example:
      "Ej. Desde $45,000 MXN por proyecto, pago único. Incluye instalación y 5 años de garantía.",
    hint: "Precio, rango o valor. Si puedes, incluye moneda y si es mensual o por proyecto.",
  },
  {
    key: "onboardingSalesPain",
    label: "Adquisición y dolores al vender",
    title: 'El "Cómo" — Adquisición y dolores al vender',
    shortLabel: "Cómo",
    question: "¿Cómo consigues clientes y qué se te traba al vender?",
    placeholder: "¿Cómo consigues clientes hoy y qué te cuesta más al vender?",
    example:
      "Ej. Llegan por referidos y Facebook. Se traba cuando piden cotización y dejan de contestar.",
    hint: "Cómo llegan hoy los clientes y qué se traba al cerrar.",
  },
] as const;

export function isOnboardingContextKey(
  value: string,
): value is OnboardingContextKey {
  return ONBOARDING_CONTEXT_FIELDS.some((field) => field.key === value);
}

/**
 * Lo que revisa el resumen del día, en el orden en que el backend lo prioriza
 * (`DAILY_DIGEST_FEATURE_PROMPT` en kadesh-back).
 */
export const AI_PIPELINE_SIGNALS = [
  {
    key: "overdueFollowUps",
    label: "Seguimientos vencidos",
    hint: "Clientes que esperaban tu llamada",
  },
  {
    key: "quotesWithoutReply",
    label: "Cotizaciones sin respuesta",
    hint: "Enviadas y sin aceptar ni rechazar",
  },
  {
    key: "uncontactedLeads",
    label: "Sin primer contacto",
    hint: "Detectados o seleccionados",
  },
  {
    key: "coldLeads",
    label: "Leads fríos",
    hint: "Sin respuesta o sin movimiento",
  },
] as const;

export type AiPipelineSignalKey = (typeof AI_PIPELINE_SIGNALS)[number]["key"];

/** Debe coincidir con `COLD_LEAD_DAYS` de kadesh-back (`utils/ai/dailyDigest.ts`). */
export const AI_COLD_LEAD_DAYS = 14;

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

/** Copy de empaque en precios y tooltips: IA en todos los planes, misma bolsa que leads. */
export const KADESH_AI_CREDIT_HINT =
  "Incluido. La modalidad administrada usa los mismos créditos que extraer leads. Con tu API key no se descuentan.";
export const AI_MANAGED_MAX_PER_MINUTE = 15;
export const AI_MANAGED_MAX_PER_DAY = 500;
