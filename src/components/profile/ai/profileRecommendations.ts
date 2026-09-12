import { Routes } from "kadesh/core/routes";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { KADESH_URIM_AI_NAME, ONBOARDING_CONTEXT_FIELDS } from "./constants";
import type { CompanyAiSettings } from "./queries";

export type ProfileRecommendation = {
  title: string;
  detail: string;
  href?: string;
  action?: "info";
};

const CATEGORY_LABELS = new Map<string, string>(
  GOOGLE_PLACE_CATEGORIES.map((item) => [item.value, item.label]),
);

function snippet(value: string, max = 80): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function industryHint(text: string): ProfileRecommendation | null {
  const haystack = text.toLowerCase();
  if (/(web|sitio|ecommerce|e-commerce|tienda en línea|landing)/.test(haystack)) {
    return {
      title: "Prospecta negocios locales sin presencia digital fuerte",
      detail:
        "En tu industria ganan los que ya venden pero se ven mal online. Extrae negocios con teléfono y sin web, o con web antigua, y ábreles con una auditoría de 2 minutos.",
    };
  }
  if (/(inmueble|inmobili|bienes raíces|propiedad)/.test(haystack)) {
    return {
      title: "Habla de tiempo de cierre, no de listados",
      detail:
        "A tu cliente ideal le duele el inventario parado. Abre con cuántos días tarda un anuncio similar en moverse y qué harías en la primera semana.",
    };
  }
  if (/(clínic|médic|salud|dental|odont)/.test(haystack)) {
    return {
      title: "Vende agenda llena, no software",
      detail:
        "En salud el gancho es menos no-shows y más pacientes nuevos. Pregunta cuántas citas se pierden por semana antes de hablar de tu oferta.",
    };
  }
  if (/(agencia|marketing|publicidad|redes sociales)/.test(haystack)) {
    return {
      title: "Entra por un canal, no por un retainer enorme",
      detail:
        "Ofrece un piloto de 30 días en un canal (Google, Meta o WhatsApp). Las agencias cierran más fácil cuando el riesgo de la primera factura es pequeño.",
    };
  }
  if (/(restaur|hotel|turismo|food)/.test(haystack)) {
    return {
      title: "Prioriza plazas con reseñas y sin sistema",
      detail:
        "Hotelería y food service compran cuando duele la ocupación o el ticket promedio. Usa reseñas y horario como pretexto de contacto, no un pitch genérico.",
    };
  }
  return null;
}

/**
 * Recomendaciones accionables a partir del onboarding y los nichos de la empresa.
 */
export function buildProfileRecommendations(
  company: CompanyAiSettings | null,
): ProfileRecommendation[] {
  const recs: ProfileRecommendation[] = [];
  const offer = company?.onboardingMainOffer?.trim() ?? "";
  const customer = company?.onboardingIdealCustomer?.trim() ?? "";
  const ticket = company?.onboardingAvgTicketValue?.trim() ?? "";
  const pain = company?.onboardingSalesPain?.trim() ?? "";
  const categories = Array.isArray(company?.allowedGooglePlaceCategories)
    ? company.allowedGooglePlaceCategories.filter(Boolean)
    : [];

  const missing = ONBOARDING_CONTEXT_FIELDS.filter((field) => {
    const value = company?.[field.key];
    return !value?.trim();
  }).map((field) => field.label);

  if (missing.length > 0) {
    recs.push({
      title: "Completa el contexto de tu negocio",
      detail: `Falta ${missing.join(", ")}. Completa tu perfil para que ${KADESH_URIM_AI_NAME} tenga el mismo contexto de negocio que tu equipo.`,
      href: Routes.panelProfile,
      action: "info",
    });
  }

  if (offer) {
    recs.push({
      title: "Abre la conversación con tu oferta, no con Kadesh",
      detail: `Cuando contactes, nombra lo que vendes (“${snippet(offer, 70)}”) y un resultado concreto. El lead debe entender el valor en la primera línea.`,
    });
  }

  if (customer) {
    recs.push({
      title: "Filtra leads que no son tu cliente ideal",
      detail: `Tu perfil dice que buscas: ${snippet(customer, 90)}. Descarta rápido a quien no encaje; el pipeline se ensucia más por mala calificación que por falta de leads.`,
    });
  }

  if (ticket) {
    recs.push({
      title: "Califica por presupuesto en el primer contacto",
      detail: `Con un ticket de ${snippet(ticket, 40)}, pregunta rango o urgencia antes de armar propuesta. Así no quemas seguimiento en quien no puede pagar.`,
    });
  }

  if (pain) {
    recs.push({
      title: "Convierte tu dolor de adquisición en un proceso",
      detail: `Hoy consigues clientes así: ${snippet(pain, 90)}. Define el siguiente paso repetible (WhatsApp, llamada o demo) para que el equipo no improvise cada vez.`,
    });
  }

  if (categories.length > 0) {
    const labels = categories
      .slice(0, 3)
      .map((value) => CATEGORY_LABELS.get(value) ?? value);
    recs.push({
      title: "Extrae solo en los nichos que ya elegiste",
      detail: `Tus categorías (${labels.join(", ")}) son el mapa. Un radio más chico y mejor calificado rinde más que ampliar a todo el directorio.`,
      href: `${Routes.panel}?tab=clientes`,
    });
  }

  const industry = industryHint([offer, customer, pain].join(" "));
  if (industry) recs.push(industry);

  const unique = recs.filter(
    (item, index, list) =>
      list.findIndex((other) => other.title === item.title) === index,
  );
  return unique.slice(0, 4);
}
