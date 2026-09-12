import {
  ONBOARDING_CONTEXT_FIELDS,
  type OnboardingContextKey,
} from "./constants";
import type { CompanyAiSettings, CompanyAiBriefPillar } from "./queries";

const EMPTY_GAPS: Record<OnboardingContextKey, string[]> = {
  onboardingMainOffer: [
    "Qué producto o servicio ofreces, en una frase",
    "Qué resultado concreto le das al cliente",
    "Si es un SaaS, un servicio o un producto",
  ],
  onboardingIdealCustomer: [
    "Industria o tipo de empresa que sí te compra",
    "Cargo de quien decide la compra",
    "Tamaño o geografía del cliente ideal",
  ],
  onboardingAvgTicketValue: [
    "Precio o rango (y moneda)",
    "Si es mensual, por proyecto o por resultado",
    "Qué incluye ese precio",
  ],
  onboardingSalesPain: [
    "Canal con el que hoy llegan clientes (demo, referidos, frío…)",
    "Qué se traba más al cerrar",
    "Cuál es el siguiente paso después del primer contacto",
  ],
};

const EMPTY_SUMMARY: Record<OnboardingContextKey, string> = {
  onboardingMainOffer: "Todavía no describiste qué vendes.",
  onboardingIdealCustomer: "Todavía no dijiste a quién le vendes.",
  onboardingAvgTicketValue: "Todavía no hay un ticket o valor de referencia.",
  onboardingSalesPain:
    "Todavía no contaste cómo consigues clientes ni qué te cuesta vender.",
};

/**
 * Lo que ya se ve en el perfil, sin llamar al modelo. Se usa si aún no hay brief de IA.
 */
export function buildCompanyKnowledgePillars(
  company: CompanyAiSettings | null,
): CompanyAiBriefPillar[] {
  return ONBOARDING_CONTEXT_FIELDS.map((field) => {
    const raw = company?.[field.key]?.trim() ?? "";
    if (!raw) {
      return {
        key: field.key,
        title: field.title,
        summary: EMPTY_SUMMARY[field.key],
        gaps: EMPTY_GAPS[field.key],
      };
    }
    const summary = raw.length > 220 ? `${raw.slice(0, 217).trim()}…` : raw;
    const gaps =
      raw.length < 80
        ? EMPTY_GAPS[field.key].slice(0, 2)
        : raw.length < 160
          ? EMPTY_GAPS[field.key].slice(0, 1)
          : [];
    return { key: field.key, title: field.title, summary, gaps };
  });
}

export function companyHasOnboardingText(
  company: CompanyAiSettings | null,
): boolean {
  if (!company) return false;
  return ONBOARDING_CONTEXT_FIELDS.some((field) =>
    Boolean(company[field.key]?.trim()),
  );
}
