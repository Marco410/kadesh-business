import { PIPELINE_STATUS, Role } from "kadesh/constants/constans";

export const ADMIN_TABS = {
  OVERVIEW: "inicio",
  CLIENTS: "clientes",
  ACTIVITY: "actividad",
  ANALYTICS: "analitica",
  PLANS: "planes",
  CONTENT: "contenido",
  PET_PLACES: "veterinarias",
} as const;

export type AdminTab = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];

export const ADMIN_TAB_ITEMS: Array<{
  id: AdminTab;
  label: string;
  description: string;
}> = [
  {
    id: ADMIN_TABS.OVERVIEW,
    label: "Inicio",
    description: "Resumen y lo que requiere atención",
  },
  {
    id: ADMIN_TABS.CLIENTS,
    label: "Clientes",
    description: "Empresas, personas, plan, CRM y consumo",
  },
  {
    id: ADMIN_TABS.ACTIVITY,
    label: "Actividad",
    description: "Lo que pasa en la plataforma, de todas las empresas",
  },
  {
    id: ADMIN_TABS.ANALYTICS,
    label: "Analítica",
    description: "Salud, activación, retención, uso, demanda y de dónde llegan",
  },
  {
    id: ADMIN_TABS.PLANS,
    label: "Planes",
    description: "Catálogo, precios y módulos",
  },
  {
    id: ADMIN_TABS.CONTENT,
    label: "Contenido",
    description: "Blog y correos",
  },
  {
    id: ADMIN_TABS.PET_PLACES,
    label: "Veterinarias",
    description: "Reclamos y verificación",
  },
];

/** Vistas dentro de Clientes. */
export const CLIENTS_VISTAS = {
  COMPANIES: "empresas",
  PEOPLE: "personas",
} as const;

export type ClientsVista = (typeof CLIENTS_VISTAS)[keyof typeof CLIENTS_VISTAS];

export function parseClientsVista(vista: string | null): ClientsVista {
  return vista === CLIENTS_VISTAS.PEOPLE
    ? CLIENTS_VISTAS.PEOPLE
    : CLIENTS_VISTAS.COMPANIES;
}

/** Secciones del detalle 360 de una empresa (`&detalle=`). */
export const CLIENT_SECTIONS = {
  SUMMARY: "resumen",
  ACTIVITY: "actividad",
  CRM: "crm",
  USAGE: "consumo",
  BILLING: "plan",
  TEAM: "equipo",
  INTEGRATIONS: "integraciones",
  NOTES: "notas",
} as const;

export type ClientSection = (typeof CLIENT_SECTIONS)[keyof typeof CLIENT_SECTIONS];

export const CLIENT_SECTION_ITEMS: Array<{ id: ClientSection; label: string }> = [
  { id: CLIENT_SECTIONS.SUMMARY, label: "Resumen" },
  { id: CLIENT_SECTIONS.ACTIVITY, label: "Actividad" },
  { id: CLIENT_SECTIONS.CRM, label: "CRM" },
  { id: CLIENT_SECTIONS.USAGE, label: "Consumo" },
  { id: CLIENT_SECTIONS.BILLING, label: "Plan y pagos" },
  { id: CLIENT_SECTIONS.TEAM, label: "Equipo" },
  { id: CLIENT_SECTIONS.INTEGRATIONS, label: "Integraciones" },
  { id: CLIENT_SECTIONS.NOTES, label: "Notas" },
];

export function parseClientSection(value: string | null): ClientSection {
  const match = CLIENT_SECTION_ITEMS.find((item) => item.id === value);
  return match?.id ?? CLIENT_SECTIONS.SUMMARY;
}

/** Subvistas de CRM (`&sub=`). */
export const CRM_SUBVIEWS = {
  LEADS: "leads",
  PIPELINE: "pipeline",
  QUOTATIONS: "cotizaciones",
  FOLLOW_UP: "seguimiento",
  WORKSPACES: "espacios",
} as const;

export type CrmSubview = (typeof CRM_SUBVIEWS)[keyof typeof CRM_SUBVIEWS];

export const CRM_SUBVIEW_ITEMS: Array<{ id: CrmSubview; label: string }> = [
  { id: CRM_SUBVIEWS.LEADS, label: "Leads" },
  { id: CRM_SUBVIEWS.PIPELINE, label: "Pipeline" },
  { id: CRM_SUBVIEWS.QUOTATIONS, label: "Cotizaciones" },
  { id: CRM_SUBVIEWS.FOLLOW_UP, label: "Seguimiento" },
  { id: CRM_SUBVIEWS.WORKSPACES, label: "Espacios" },
];

export function parseCrmSubview(value: string | null): CrmSubview {
  return CRM_SUBVIEW_ITEMS.find((item) => item.id === value)?.id ?? CRM_SUBVIEWS.LEADS;
}

/** Subvistas de Consumo (`&sub=`). */
export const USAGE_SUBVIEWS = {
  CREDITS: "creditos",
  EXTRACTIONS: "extracciones",
  AI: "ia",
} as const;

export type UsageSubview = (typeof USAGE_SUBVIEWS)[keyof typeof USAGE_SUBVIEWS];

export const USAGE_SUBVIEW_ITEMS: Array<{ id: UsageSubview; label: string }> = [
  { id: USAGE_SUBVIEWS.CREDITS, label: "Créditos" },
  { id: USAGE_SUBVIEWS.EXTRACTIONS, label: "Extracciones" },
  { id: USAGE_SUBVIEWS.AI, label: "IA" },
];

export function parseUsageSubview(value: string | null): UsageSubview {
  return USAGE_SUBVIEW_ITEMS.find((item) => item.id === value)?.id ?? USAGE_SUBVIEWS.CREDITS;
}

/** Filtro de extracciones (Consumo → Extracciones). */
export const SYNC_STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "failed", label: "Falló" },
  { value: "ok", label: "OK" },
] as const;

export type SyncStatusFilter = (typeof SYNC_STATUS_FILTERS)[number]["value"];

/** Estado vigente de la empresa (filtro de `adminCompanies`). `none` = sin suscripción. */
export const COMPANY_STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "trialing", label: "Prueba" },
  { value: "past_due", label: "Vencidas" },
  { value: "unpaid", label: "No pagadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "none", label: "Sin plan" },
] as const;

export type CompanyStatusFilter = (typeof COMPANY_STATUS_FILTERS)[number]["value"];

export function parseCompanyStatusFilter(value: string | null): CompanyStatusFilter {
  return (
    COMPANY_STATUS_FILTERS.find((option) => option.value === value)?.value ?? "all"
  );
}

export const COMPANY_SORT_OPTIONS = [
  { value: "recent", label: "Alta reciente" },
  { value: "activity", label: "Último acceso" },
  { value: "health", label: "Salud (peor primero)" },
  { value: "name", label: "Nombre" },
] as const;

export type CompanySort = (typeof COMPANY_SORT_OPTIONS)[number]["value"];

/** Filtro por dueño de cuenta de Kadesh (`&cuentas=mias`). */
export const COMPANY_OWNER_FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "mias", label: "Mis cuentas" },
] as const;

export type CompanyOwnerFilter = (typeof COMPANY_OWNER_FILTERS)[number]["value"];

export function parseCompanyOwnerFilter(value: string | null): CompanyOwnerFilter {
  return value === "mias" ? "mias" : "todas";
}

export function parseCompanySort(value: string | null): CompanySort {
  return COMPANY_SORT_OPTIONS.find((option) => option.value === value)?.value ?? "recent";
}

/**
 * Tipos del feed de actividad: `slug` va en la URL (`&tipo=`), `type` es el del API
 * (`adminActivityFeed`). En UI no decimos "auth" ni "billing".
 */
export const ACTIVITY_TYPES = [
  { slug: "accesos", type: "auth", label: "Accesos" },
  { slug: "extraccion", type: "extraction", label: "Extracción" },
  { slug: "crm", type: "crm", label: "CRM" },
  { slug: "equipo", type: "team", label: "Equipo" },
  { slug: "ia", type: "ai", label: "IA" },
  { slug: "creditos", type: "credits", label: "Créditos" },
  { slug: "pagos", type: "billing", label: "Pagos" },
  { slug: "whatsapp", type: "whatsapp", label: "WhatsApp" },
  { slug: "calendario", type: "calendar", label: "Calendario" },
  { slug: "admin", type: "admin", label: "Kadesh" },
  // Secciones que abren: mucho volumen, por eso "Todo" no la incluye (el back la excluye).
  { slug: "navegacion", type: "product", label: "Navegación" },
] as const;

export type ActivityTypeSlug = (typeof ACTIVITY_TYPES)[number]["slug"];
export type ActivityApiType = (typeof ACTIVITY_TYPES)[number]["type"];

export const ACTIVITY_TYPE_FILTERS: Array<{ value: ActivityTypeSlug | "todo"; label: string }> = [
  { value: "todo", label: "Todo" },
  ...ACTIVITY_TYPES.map((t) => ({ value: t.slug, label: t.label })),
];

export function parseActivityTypeSlug(value: string | null): ActivityTypeSlug | "todo" {
  return ACTIVITY_TYPES.find((t) => t.slug === value)?.slug ?? "todo";
}

export function activityApiTypes(slug: ActivityTypeSlug | "todo"): ActivityApiType[] | null {
  if (slug === "todo") return null;
  const match = ACTIVITY_TYPES.find((t) => t.slug === slug);
  return match ? [match.type] : null;
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.type, t.label]),
);

/** Secciones del panel del cliente (`section` de `ui.section_viewed`). Las demás se muestran tal cual. */
export const PANEL_SECTION_LABELS: Record<string, string> = {
  extraccion: "Extracción (mapa)",
  inicio: "Inicio",
  profile: "Datos del perfil",
  usuarios: "Usuarios",
  ai: "IA",
  clientes: "Clientes",
  vendedores: "Vendedores",
  archivos: "Archivos",
  proyectos: "Proyectos",
  cotizaciones: "Cotizaciones",
  calendar: "Calendario",
  workspaces: "Espacios de trabajo",
  whatsapp: "WhatsApp",
  referidos: "Referidos",
  novedades: "Novedades",
  creditos: "Créditos",
  "google-calendar": "Google Calendar",
};

/** Filtro del feed: todas o solo errores. */
export const ACTIVITY_STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "errors", label: "Con error" },
] as const;

/** Motivos de "Requiere atención" (`adminOpsSummary.attention`). */
export const ATTENTION_REASON_LABELS: Record<string, string> = {
  past_due: "Pago vencido",
  unpaid: "No pagada",
  trial_expired: "Prueba terminada",
  trial_ending: "Prueba por vencer",
  no_credits: "Sin créditos",
  sync_failures: "Extracciones fallando",
  checkout_failed: "Pago sin completar",
  inactive: "Sin actividad",
  churn_risk: "Riesgo de baja",
  upsell: "Oportunidad de venta",
};

/** Vistas de Analítica (`&vista=`). */
export const ANALYTICS_VISTAS = {
  HEALTH: "salud",
  ACTIVATION: "activacion",
  RETENTION: "retencion",
  ENGAGEMENT: "uso",
  DEMAND: "demanda",
  ACQUISITION: "adquisicion",
} as const;

export type AnalyticsVista = (typeof ANALYTICS_VISTAS)[keyof typeof ANALYTICS_VISTAS];

export const ANALYTICS_VISTA_ITEMS: Array<{ id: AnalyticsVista; label: string }> = [
  { id: ANALYTICS_VISTAS.HEALTH, label: "Salud" },
  { id: ANALYTICS_VISTAS.ACTIVATION, label: "Activación" },
  { id: ANALYTICS_VISTAS.RETENTION, label: "Retención" },
  { id: ANALYTICS_VISTAS.ENGAGEMENT, label: "Uso" },
  { id: ANALYTICS_VISTAS.DEMAND, label: "Demanda" },
  { id: ANALYTICS_VISTAS.ACQUISITION, label: "Adquisición" },
];

export function parseAnalyticsVista(value: string | null): AnalyticsVista {
  return ANALYTICS_VISTA_ITEMS.find((item) => item.id === value)?.id ?? ANALYTICS_VISTAS.HEALTH;
}

/** Nivel de salud (`label` de `adminHealth`). `slug` va en la URL (`&nivel=`). */
export const HEALTH_LEVELS = [
  { slug: "sana", value: "healthy", label: "Sana" },
  { slug: "observar", value: "watch", label: "Por observar" },
  { slug: "riesgo", value: "risk", label: "En riesgo" },
] as const;

export const HEALTH_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  HEALTH_LEVELS.map((level) => [level.value, level.label]),
);

export const HEALTH_LEVEL_CLASSES: Record<string, string> = {
  healthy: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  watch: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  risk: "bg-red-500/15 text-red-700 dark:text-red-300",
};

/** Señales de la salud (`flags[].key`). `slug` va en la URL (`&senal=`). */
export const HEALTH_SIGNALS = [
  { slug: "baja", value: "churn_risk", label: "Riesgo de baja" },
  { slug: "venta", value: "upsell", label: "Oportunidad de venta" },
] as const;

export const HEALTH_SIGNAL_LABELS: Record<string, string> = Object.fromEntries(
  HEALTH_SIGNALS.map((signal) => [signal.value, signal.label]),
);

export const HEALTH_TREND_LABELS: Record<string, string> = {
  up: "Subiendo",
  down: "Bajando",
  stable: "Estable",
  new: "Nueva",
  inactive: "Sin uso",
};

/** Partes de la salud y su máximo (mismo orden que en el back). */
export const HEALTH_COMPONENTS = [
  { key: "activity", label: "Constancia", max: 30, hint: "Días con actividad" },
  { key: "adoption", label: "Equipo", max: 15, hint: "Parte del equipo que entra" },
  { key: "usage", label: "Uso", max: 25, hint: "Extracciones, CRM, cotizaciones, WhatsApp" },
  { key: "engagement", label: "Tiempo", max: 15, hint: "Minutos con el panel abierto por persona" },
  { key: "billing", label: "Pago", max: 15, hint: "Plan activo y sin pagos fallidos" },
] as const;

export const HEALTH_SORT_OPTIONS = [
  { value: "risk", label: "Peor salud" },
  { value: "drop", label: "Mayor caída" },
  { value: "best", label: "Mejor salud" },
  { value: "name", label: "Nombre" },
] as const;

export type HealthSort = (typeof HEALTH_SORT_OPTIONS)[number]["value"];

export function parseHealthSort(value: string | null): HealthSort {
  return HEALTH_SORT_OPTIONS.find((option) => option.value === value)?.value ?? "risk";
}

/** Periodos (días) de las vistas de Analítica. */
export const ANALYTICS_DAY_OPTIONS = [
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
  { value: "180", label: "6 meses" },
  { value: "365", label: "1 año" },
] as const;

export function parseAnalyticsDays(value: string | null, fallback = "90"): string {
  return ANALYTICS_DAY_OPTIONS.find((option) => option.value === value)?.value ?? fallback;
}

/** Módulos de `adminEngagement.plans[].modules`. */
export const PRODUCT_MODULE_LABELS: Record<string, string> = {
  extraction: "Extracción",
  crm: "Pipeline y leads",
  activities: "Actividades",
  quotations: "Cotizaciones",
  whatsapp: "WhatsApp",
  ai: "IA",
};

/** Pasos de `UserAuthLog` (historial de accesos). */
export const AUTH_STEP_LABELS: Record<string, string> = {
  REGISTER_SUCCESS: "Se registró",
  REGISTER_FAIL: "Falló el registro",
  REGISTER_FAIL_INVALID_REFERRER: "Código de referido inválido",
  CUSTOM_AUTH_LOGIN: "Inició sesión con contraseña",
  CUSTOM_AUTH_SIGNUP: "Se registró",
  CUSTOM_AUTH_FAIL: "Falló el inicio de sesión",
  GOOGLE_AUTH_LOGIN: "Inició sesión con Google",
  GOOGLE_AUTH_SIGNUP: "Se registró con Google",
  GOOGLE_AUTH_FAIL: "Falló el inicio con Google",
};

/** Pestañas del panel de una persona. */
export const PERSON_TABS = {
  PROFILE: "perfil",
  ACCESS: "accesos",
  ACTIVITY: "actividad",
  CONTROL: "control",
} as const;

export type PersonTab = (typeof PERSON_TABS)[keyof typeof PERSON_TABS];

/** Vistas dentro de Contenido (blog + correos). */
export const CONTENT_VISTAS = {
  ARTICLES: "articulos",
  CATEGORIES: "categorias",
  TAGS: "etiquetas",
  EMAILS: "correos",
} as const;

export type ContentVista = (typeof CONTENT_VISTAS)[keyof typeof CONTENT_VISTAS];

export function parseContentVista(vista: string | null): ContentVista {
  if (vista === CONTENT_VISTAS.CATEGORIES) return CONTENT_VISTAS.CATEGORIES;
  if (vista === CONTENT_VISTAS.TAGS) return CONTENT_VISTAS.TAGS;
  if (vista === CONTENT_VISTAS.EMAILS) return CONTENT_VISTAS.EMAILS;
  return CONTENT_VISTAS.ARTICLES;
}

/** Etiquetas del ledger de créditos (UI en español). */
export const CREDIT_LEDGER_TYPE_LABELS: Record<string, string> = {
  GRANT_PLAN: "Alta del plan",
  GRANT_PURCHASE: "Recarga",
  GRANT_ADMIN: "Crédito admin",
  CONSUME_SYNC: "Gasto sync",
  CONSUME_AI: "Gasto IA",
  ADJUST: "Ajuste",
};

/** Funciones de IA (`TechAiCallLog.feature`). */
export const AI_FEATURE_LABELS: Record<string, string> = {
  connection_test: "Prueba de conexión",
  daily_digest: "Resumen diario",
  monthly_narrative: "Narrativa mensual",
  file_analysis: "Análisis de archivo",
  profile_playbook: "Playbook de perfil",
  company_brief: "Brief de empresa",
  market_analysis: "Análisis de mercado",
};

/** Vistas dentro de la sección Planes. */
export const PLANS_VISTAS = {
  CATALOG: "catalogo",
  MODULES: "modulos",
} as const;

export type PlansVista = (typeof PLANS_VISTAS)[keyof typeof PLANS_VISTAS];

export const POST_PRODUCT = {
  PET: "pet",
  SAAS: "saas",
  ALL: "all",
} as const;

export const POST_PRODUCT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: POST_PRODUCT.PET, label: "Pet" },
  { value: POST_PRODUCT.SAAS, label: "SaaS" },
  { value: POST_PRODUCT.ALL, label: "Ambos" },
];

export const POST_PRODUCT_LABELS: Record<string, string> = {
  [POST_PRODUCT.PET]: "Pet",
  [POST_PRODUCT.SAAS]: "SaaS",
  [POST_PRODUCT.ALL]: "Ambos",
};

export const POST_PRODUCT_BADGE: Record<string, string> = {
  [POST_PRODUCT.PET]:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-500/20",
  [POST_PRODUCT.SAAS]:
    "bg-orange-500/15 text-orange-800 dark:text-orange-300 dark:bg-orange-500/20",
  [POST_PRODUCT.ALL]:
    "bg-black/5 dark:bg-white/10 text-[#424242] dark:text-[#e0e0e0]",
};

export const POST_STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
] as const;

export function parseAdminTab(value: string | null): AdminTab {
  return ADMIN_TAB_ITEMS.find((item) => item.id === value)?.id ?? ADMIN_TABS.OVERVIEW;
}

export function parsePlansVista(vista: string | null): PlansVista {
  return vista === PLANS_VISTAS.MODULES
    ? PLANS_VISTAS.MODULES
    : PLANS_VISTAS.CATALOG;
}

/**
 * Enlaces viejos de Operaciones (antes de juntar Usuarios + Empresas y Blog + Correos).
 * Devuelve los params nuevos o `null` si la URL ya es actual.
 */
export function normalizeLegacyAdminParams(
  params: URLSearchParams,
): URLSearchParams | null {
  const tab = params.get("tab");
  const vista = params.get("vista");
  const next = new URLSearchParams(params.toString());

  if (tab === "usuarios") {
    next.set("tab", ADMIN_TABS.CLIENTS);
    if (vista === "suscripciones") next.delete("vista");
    else next.set("vista", CLIENTS_VISTAS.PEOPLE);
    return next;
  }
  if (tab === "suscripciones") {
    next.set("tab", ADMIN_TABS.CLIENTS);
    next.delete("vista");
    return next;
  }
  if (tab === "empresas") {
    if (vista === "sync" && !params.get("empresa")) {
      next.set("tab", ADMIN_TABS.ACTIVITY);
      next.delete("vista");
      next.set("tipo", "extraccion");
      return next;
    }
    next.set("tab", ADMIN_TABS.CLIENTS);
    next.delete("vista");
    const detalle = params.get("detalle");
    if (detalle === "creditos") {
      next.set("detalle", CLIENT_SECTIONS.USAGE);
      next.set("sub", USAGE_SUBVIEWS.CREDITS);
    } else if (detalle === "sync") {
      next.set("detalle", CLIENT_SECTIONS.USAGE);
      next.set("sub", USAGE_SUBVIEWS.EXTRACTIONS);
    } else if (detalle === "leads") {
      next.set("detalle", CLIENT_SECTIONS.CRM);
      next.set("sub", CRM_SUBVIEWS.LEADS);
    } else {
      next.delete("detalle");
    }
    return next;
  }
  if (tab === "blog") {
    next.set("tab", ADMIN_TABS.CONTENT);
    return next;
  }
  if (tab === "correos") {
    next.set("tab", ADMIN_TABS.CONTENT);
    next.set("vista", CONTENT_VISTAS.EMAILS);
    return next;
  }
  return null;
}

/** Params que pertenecen a una sección: se limpian al cambiar de tab. */
export const ADMIN_SCOPED_PARAMS = [
  "cuentas",
  "vista",
  "empresa",
  "usuario",
  "persona",
  "detalle",
  "sub",
  "estado",
  "orden",
  "rol",
  "conEmpresa",
  "q",
  "pagina",
  "tipo",
  "error",
  "para",
  "nivel",
  "senal",
  "dias",
  "meses",
  "umbral",
] as const;

/** Arma un enlace interno de Operaciones (siempre sobre `Routes.panelAdmin`). */
export function buildAdminHref(
  base: string,
  params: Record<string, string | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

export const ADMIN_PAGE_SIZE = 25;

export const ROLE_LABELS: Record<string, string> = {
  [Role.ADMIN]: "Admin plataforma",
  [Role.USER]: "Usuario",
  [Role.AUTHOR]: "Autor",
  [Role.ADMIN_COMPANY]: "Admin empresa",
  [Role.GERENCIA]: "Gerencia",
  [Role.VENDEDOR]: "Vendedor",
  [Role.USER_COMPANY]: "Usuario empresa",
};

export const BLOG_PRODUCT_OPTIONS: Array<{
  value: string;
  label: string;
  description: string;
}> = [
  { value: "pet", label: "Blog de Pet", description: "Veterinarias y mascotas" },
  { value: "saas", label: "Blog de SaaS", description: "Ventas y prospección" },
];

export const PET_PLACE_CLAIM_STATUS = {
  UNCLAIMED: "unclaimed",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

/** Origen de la ficha pública en Kadesh Pet (`/veterinarias/{slug}`). */
export const PET_PLACE_PUBLIC_ORIGIN = "https://pet.kadesh.com.mx";

export function petPlacePublicUrl(place: {
  id: string;
  slug?: string | null;
}): string {
  const path = place.slug?.trim() || place.id;
  return `${PET_PLACE_PUBLIC_ORIGIN}/veterinarias/${path}`;
}

/** Días del horario semanal. Los valores coinciden con `dayOfWeek` en el backend. */
export const PET_PLACE_WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const PET_PLACE_SCHEDULE_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** Tipos de negocio del directorio Pet (mismo catálogo que `TYPES_PET_SHELTER` en back). */
export const PET_PLACE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "veterinary", label: "Veterinaria" },
  { value: "pet_shelter", label: "Refugio" },
  { value: "pet_store", label: "Tienda" },
  { value: "pet_boarding", label: "Hotel/Guardería" },
  { value: "pet_park", label: "Parque" },
  { value: "other", label: "Otro" },
];

export type PetPlaceClaimStatus =
  (typeof PET_PLACE_CLAIM_STATUS)[keyof typeof PET_PLACE_CLAIM_STATUS];

export const PET_PLACE_CLAIM_STATUS_OPTIONS: Array<{
  value: PetPlaceClaimStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Todas" },
  { value: PET_PLACE_CLAIM_STATUS.PENDING, label: "En revisión" },
  { value: PET_PLACE_CLAIM_STATUS.VERIFIED, label: "Verificadas" },
  { value: PET_PLACE_CLAIM_STATUS.UNCLAIMED, label: "Sin reclamar" },
  { value: PET_PLACE_CLAIM_STATUS.REJECTED, label: "Rechazadas" },
];

export const PET_PLACE_CLAIM_STATUS_LABELS: Record<string, string> = {
  [PET_PLACE_CLAIM_STATUS.UNCLAIMED]: "Sin reclamar",
  [PET_PLACE_CLAIM_STATUS.PENDING]: "En revisión",
  [PET_PLACE_CLAIM_STATUS.VERIFIED]: "Verificada",
  [PET_PLACE_CLAIM_STATUS.REJECTED]: "Rechazada",
};

export const PET_PLACE_CLAIM_STATUS_CLASSES: Record<string, string> = {
  [PET_PLACE_CLAIM_STATUS.UNCLAIMED]:
    "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]",
  [PET_PLACE_CLAIM_STATUS.PENDING]:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 dark:bg-amber-500/20",
  [PET_PLACE_CLAIM_STATUS.VERIFIED]:
    "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20",
  [PET_PLACE_CLAIM_STATUS.REJECTED]:
    "bg-red-500/15 text-red-700 dark:text-red-400 dark:bg-red-500/20",
};

/** Pipeline comercial interno (mismo que los leads del CRM). Solo lo ve y edita el admin. */
export const PET_PLACE_PIPELINE_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  ...Object.values(PIPELINE_STATUS).map((value) => ({ value, label: value })),
];

export const PET_PLACE_CLAIM_ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  manager: "Encargado",
  vet: "Veterinario",
};

export const PET_PLACE_SERVICE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PetPlaceServiceStatus =
  (typeof PET_PLACE_SERVICE_STATUS)[keyof typeof PET_PLACE_SERVICE_STATUS];

export const PET_PLACE_SERVICE_STATUS_OPTIONS: Array<{
  value: PetPlaceServiceStatus | "all";
  label: string;
}> = [
  { value: PET_PLACE_SERVICE_STATUS.PENDING, label: "Pendientes" },
  { value: PET_PLACE_SERVICE_STATUS.APPROVED, label: "Aprobados" },
  { value: PET_PLACE_SERVICE_STATUS.REJECTED, label: "Rechazados" },
  { value: "all", label: "Todos" },
];

export const PET_PLACE_SERVICE_STATUS_LABELS: Record<string, string> = {
  [PET_PLACE_SERVICE_STATUS.PENDING]: "Pendiente",
  [PET_PLACE_SERVICE_STATUS.APPROVED]: "Aprobado",
  [PET_PLACE_SERVICE_STATUS.REJECTED]: "Rechazado",
};

export const PET_PLACE_SERVICE_STATUS_CLASSES: Record<string, string> = {
  [PET_PLACE_SERVICE_STATUS.PENDING]:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 dark:bg-amber-500/20",
  [PET_PLACE_SERVICE_STATUS.APPROVED]:
    "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20",
  [PET_PLACE_SERVICE_STATUS.REJECTED]:
    "bg-red-500/15 text-red-700 dark:text-red-400 dark:bg-red-500/20",
};

export const ADMIN_CREDIT_GRANT_PRESETS = [250, 1000, 3000] as const;
export const ADMIN_CREDIT_GRANT_MAX = 50_000;

/** Frecuencias de cobro de un plan (mismos valores que PLAN_FREQUENCY del backend). */
export const PLAN_FREQUENCY_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "monthly", label: "Mensual" },
  { value: "annual", label: "Anual" },
  { value: "weekly", label: "Semanal" },
  { value: "once", label: "Pago único" },
];

/** Campos que cambian lo que se le cobra a la gente: exigen verificar con Stripe. */
export const PLAN_BILLING_FIELDS = [
  "cost",
  "currency",
  "frequency",
  "stripePriceId",
] as const;

export const PLAN_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Apagados" },
] as const;

export const SUBSCRIPTION_STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "trialing", label: "Prueba" },
  { value: "past_due", label: "Vencidas" },
  { value: "unpaid", label: "No pagadas" },
  { value: "cancelled", label: "Canceladas" },
] as const;
