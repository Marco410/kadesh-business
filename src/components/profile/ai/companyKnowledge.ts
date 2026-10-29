import {
  ONBOARDING_CONTEXT_FIELDS,
  isOnboardingContextKey,
  type OnboardingContextKey,
} from "./constants";
import type { CompanyAiSettings, CompanyAiBriefPillar } from "./queries";

/** Lo mínimo que la IA necesita oír en cada pregunta. También es la guía del paso a paso. */
export const PILLAR_GUIDE_POINTS: Record<OnboardingContextKey, string[]> = {
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

/** Puntos por pregunta: uno por cada punto de `PILLAR_GUIDE_POINTS`. */
export const PILLAR_POINTS = 3;

const EMPTY_SUMMARY: Record<OnboardingContextKey, string> = {
  onboardingMainOffer: "Todavía no describiste qué vendes.",
  onboardingIdealCustomer: "Todavía no dijiste a quién le vendes.",
  onboardingAvgTicketValue: "Todavía no hay un ticket o valor de referencia.",
  onboardingSalesPain:
    "Todavía no contaste cómo consigues clientes ni qué te cuesta vender.",
};

/** Puntos que un texto de esta longitud suele dejar sin cubrir (misma regla que el backend). */
function gapCountForLength(length: number): number {
  if (length === 0) return PILLAR_POINTS;
  if (length < 80) return 2;
  if (length < 160) return 1;
  return 0;
}

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
        gaps: PILLAR_GUIDE_POINTS[field.key],
      };
    }
    const summary = raw.length > 220 ? `${raw.slice(0, 217).trim()}…` : raw;
    const gaps = PILLAR_GUIDE_POINTS[field.key].slice(
      0,
      gapCountForLength(raw.length),
    );
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

/** Mismo hash que `companyBriefSourceHash` en kadesh-back: si cambia, el brief quedó viejo. */
export function companyBriefSourceHash(
  company: CompanyAiSettings | null,
): string {
  return ONBOARDING_CONTEXT_FIELDS.map(
    (field) => company?.[field.key]?.trim() ?? "",
  ).join("\n---\n");
}

export type PillarState = "complete" | "partial" | "empty";

export type PillarCoverage = {
  key: OnboardingContextKey;
  /** 0 a `PILLAR_POINTS`. */
  covered: number;
  state: PillarState;
  gaps: string[];
  summary: string;
  /** Resumen y huecos vienen del brief de IA vigente (no de la lectura local). */
  fromAi: boolean;
};

/**
 * Qué tanto cubre cada respuesta. Sin texto = 0; con texto, cada hueco que
 * detecta la IA (o la regla de longitud) resta un punto, sin bajar de 1.
 */
export function buildPillarCoverage(
  pillars: CompanyAiBriefPillar[],
  company: CompanyAiSettings | null,
  aiKeys: ReadonlySet<string> = new Set(),
): PillarCoverage[] {
  return pillars
    .filter((pillar) => isOnboardingContextKey(pillar.key))
    .map((pillar) => {
      const key = pillar.key as OnboardingContextKey;
      const filled = Boolean(company?.[key]?.trim());
      if (!filled) {
        return {
          key,
          covered: 0,
          state: "empty",
          gaps: [],
          summary: "",
          fromAi: false,
        };
      }
      const covered = Math.max(
        1,
        PILLAR_POINTS - Math.min(pillar.gaps.length, PILLAR_POINTS),
      );
      return {
        key,
        covered,
        state: covered >= PILLAR_POINTS ? "complete" : "partial",
        gaps: pillar.gaps,
        summary: pillar.summary,
        fromAi: aiKeys.has(key),
      };
    });
}

export function knowledgePercent(coverage: PillarCoverage[]): number {
  const total = ONBOARDING_CONTEXT_FIELDS.length * PILLAR_POINTS;
  const covered = coverage.reduce((sum, pillar) => sum + pillar.covered, 0);
  return Math.round((covered / total) * 100);
}

/** Nivel de detalle mientras se escribe (antes de que la IA lo lea). */
export function draftCoverage(text: string): number {
  return PILLAR_POINTS - gapCountForLength(text.trim().length);
}
