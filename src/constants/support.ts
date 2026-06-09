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
