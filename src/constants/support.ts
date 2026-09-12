export const KADESH_SUPPORT = {
  phoneDisplay: "+52 1 443 938 2330",
  phoneE164: "5214439382330",
  email: "contacto@kadesh.com.mx",
  tel: "tel:+5214439382330",
} as const;

export const DEFAULT_SUPPORT_WHATSAPP_MESSAGE =
  "Hola KADESH, tengo una consulta sobre mi suscripción o plan.";

export const DEFAULT_SUPPORT_EMAIL_SUBJECT =
  "Consulta sobre suscripción — KADESH";

export const PANEL_SUPPORT_WHATSAPP_MESSAGE =
  "Hola KADESH, estoy en el panel y necesito ayuda.";

/** Globos que aparecen de vez en cuando junto al FAB del panel. El `message` es el texto que se prellena en WhatsApp. */
export const PANEL_SUPPORT_PROMPTS = [
  {
    id: "tech",
    teaser: "¿Algo no carga o se ve raro? Escríbenos y lo vemos.",
    message: "Hola KADESH, tengo un problema técnico en el panel.",
  },
  {
    id: "help",
    teaser: "¿Te trabaste extrayendo leads o en el CRM? Te ayudamos.",
    message: "Hola KADESH, necesito ayuda para usar la plataforma.",
  },
  {
    id: "improve",
    teaser: "¿Se te ocurre una mejora para Kadesh? La leemos.",
    message: "Hola KADESH, quiero proponer una mejora para la plataforma.",
  },
  {
    id: "plan",
    teaser: "¿Dudas con Kadesh AI, créditos o tu plan?",
    message: "Hola KADESH, tengo una duda sobre Kadesh AI, créditos o mi plan.",
  },
] as const;

export function buildSupportWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${KADESH_SUPPORT.phoneE164}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildSupportMailtoUrl(subject?: string): string {
  const base = `mailto:${KADESH_SUPPORT.email}`;
  if (!subject?.trim()) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}
