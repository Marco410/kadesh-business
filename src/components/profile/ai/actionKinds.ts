import {
  Calendar03Icon,
  Call02Icon,
  Clock01Icon,
  FilterIcon,
  Invoice01Icon,
  Message01Icon,
  Radar01Icon,
  SparklesIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import type { AiPipelineSignalKey } from "./constants";

export type AiActionKind =
  | "followUp"
  | "quote"
  | "cold"
  | "qualify"
  | "firstContact"
  | "prospect"
  | "profile"
  | "message"
  | "general";

/** Pantalla del panel a la que lleva cada tipo de acción. `info` abre la tab Información. */
export type AiActionTarget =
  | "calendar"
  | "cotizaciones"
  | "clientes"
  | "extraccion"
  | "info";

type AiActionKindMeta = {
  label: string;
  icon: typeof SparklesIcon;
  target: AiActionTarget | null;
  cta: string | null;
};

export const AI_ACTION_KINDS: Record<AiActionKind, AiActionKindMeta> = {
  followUp: {
    label: "Seguimiento",
    icon: Calendar03Icon,
    target: "calendar",
    cta: "Abrir calendario",
  },
  quote: {
    label: "Cotización",
    icon: Invoice01Icon,
    target: "cotizaciones",
    cta: "Ver cotizaciones",
  },
  cold: {
    label: "Reactivar",
    icon: Clock01Icon,
    target: "clientes",
    cta: "Ver clientes",
  },
  qualify: {
    label: "Calificar",
    icon: FilterIcon,
    target: "clientes",
    cta: "Ver clientes",
  },
  firstContact: {
    label: "Primer contacto",
    icon: Call02Icon,
    target: "clientes",
    cta: "Ver clientes",
  },
  prospect: {
    label: "Prospección",
    icon: Radar01Icon,
    target: "extraccion",
    cta: "Ir a extracción",
  },
  profile: {
    label: "Perfil",
    icon: UserEdit01Icon,
    target: "info",
    cta: "Completar perfil",
  },
  message: {
    label: "Mensaje",
    icon: Message01Icon,
    target: null,
    cta: null,
  },
  general: {
    label: "Siguiente paso",
    icon: SparklesIcon,
    target: null,
    cta: null,
  },
};

/** Cada señal del pipeline cae en el mismo tipo que la acción que la resuelve. */
export const AI_SIGNAL_KIND: Record<AiPipelineSignalKey, AiActionKind> = {
  overdueFollowUps: "followUp",
  quotesWithoutReply: "quote",
  uncontactedLeads: "firstContact",
  coldLeads: "cold",
};

// El orden importa: el primer patrón que coincide gana.
const KIND_PATTERNS: Array<[AiActionKind, RegExp]> = [
  ["followUp", /seguimiento|vencid|recordatorio/],
  ["quote", /cotizaci|propuesta/],
  ["cold", /fr[ií]o|enfri|sin respuesta|reactiva|retoma/],
  ["qualify", /califica|filtra|descarta/],
  ["firstContact", /primer contacto|sin contacto|contacta/],
  ["prospect", /prospect|extrae|extracci|nicho/],
  ["profile", /perfil/],
  ["message", /mensaje|conversaci|abre con|gancho/],
];

function matchKind(text: string): AiActionKind | null {
  const haystack = text.toLowerCase();
  for (const [kind, pattern] of KIND_PATTERNS) {
    if (pattern.test(haystack)) return kind;
  }
  return null;
}

/**
 * Tipo de una acción escrita por la IA (o por las heurísticas), para darle
 * ícono, etiqueta y a dónde ir. El título manda; el detalle desempata.
 */
export function classifyAiAction(title: string, detail: string): AiActionKind {
  return matchKind(title) ?? matchKind(detail) ?? "general";
}
