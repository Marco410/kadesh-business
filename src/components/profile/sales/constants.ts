export const GOOGLE_PLACE_CATEGORIES = [
  { value: "abogados", label: "Abogados" },
  { value: "agencias de viajes", label: "Agencias de viajes" },
  { value: "autoescuelas", label: "Autoescuelas" },
  { value: "bancos", label: "Bancos" },
  { value: "bares", label: "Bares" },
  { value: "cafeterías", label: "Cafeterías" },
  { value: "carpinterías", label: "Carpinterías" },
  { value: "clínicas", label: "Clínicas" },
  { value: "dentistas", label: "Dentistas" },
  { value: "electricistas", label: "Electricistas" },
  { value: "electrónica", label: "Electrónica" },
  { value: "escuelas", label: "Escuelas" },
  { value: "farmacias", label: "Farmacias" },
  { value: "ferreterías", label: "Ferreterías" },
  { value: "florerías", label: "Florerías" },
  { value: "funerarias", label: "Funerarias" },
  { value: "gasolineras", label: "Gasolineras" },
  { value: "gimnasios", label: "Gimnasios" },
  { value: "gimnasios de box", label: "Gimnasios de box" },
  { value: "guarderías", label: "Guarderías" },
  { value: "hoteles", label: "Hoteles" },
  { value: "iglesias", label: "Iglesias" },
  { value: "inmobiliarias", label: "Inmobiliarias" },
  { value: "joyerías", label: "Joyerías" },
  { value: "laboratorios", label: "Laboratorios" },
  { value: "lavanderías", label: "Lavanderías" },
  { value: "librerías", label: "Librerías" },
  { value: "médicos", label: "Médicos" },
  { value: "mueblerías", label: "Mueblerías" },
  { value: "mudanzas", label: "Mudanzas" },
  { value: "negocios locales", label: "Negocios locales" },
  { value: "ópticas", label: "Ópticas" },
  { value: "panaderías", label: "Panaderías" },
  { value: "pastelerías", label: "Pastelerías" },
  { value: "peluquerías", label: "Peluquerías" },
  { value: "plomeros", label: "Plomeros" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "salones de belleza", label: "Salones de belleza" },
  { value: "seguros", label: "Seguros" },
  { value: "spa", label: "Spa" },
  { value: "supermercados", label: "Supermercados" },
  { value: "talleres mecánicos", label: "Talleres mecánicos" },
  { value: "tiendas de mascotas", label: "Tiendas de mascotas" },
  { value: "tiendas de ropa", label: "Tiendas de ropa" },
  { value: "veterinarias", label: "Veterinarias" },
] as const;

export const PIPELINE_STATUS = {
    DETECTADO: "01 - Detectado",
    SELECCIONADO: "02 - Seleccionado",
    CONTACTADO: "03 - Contactado",
    SIN_RESPUESTA: "04 - Sin Respuesta",
    INTERESADO: "05 - Interesado",
    CREANDO_PROYECTO_PROPUESTA: "06 - Creando proyecto propuesta",
    PROPUESTA_ENVIADA: "07 - Propuesta Enviada",
    SEGUIMIENTO: "08 - Seguimiento",
    EN_NEGOCIACION: "09 - En Negociación",
    PROPUESTA_ACEPTADA: "10 - Propuesta Aceptada",
    PROPUESTA_RECHAZADA: "11 - Propuesta Rechazada",
    CERRADO_GANADO: "12 - Cerrado Ganado",
    CERRADO_PERDIDO: "13 - Cerrado Perdido",
    DESCARTADO: "14 - Descartado",
  } as const;
  
  /** Tailwind classes for pipeline status badge (text + bg). Unknown status falls back to neutral. */
  export const PIPELINE_STATUS_COLORS: Record<string, string> = {
    [PIPELINE_STATUS.DETECTADO]:
      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    [PIPELINE_STATUS.SELECCIONADO]:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    [PIPELINE_STATUS.CONTACTADO]:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
    [PIPELINE_STATUS.SIN_RESPUESTA]:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    [PIPELINE_STATUS.INTERESADO]:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]:
      "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
    [PIPELINE_STATUS.PROPUESTA_ENVIADA]:
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200",
    [PIPELINE_STATUS.SEGUIMIENTO]:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
    [PIPELINE_STATUS.EN_NEGOCIACION]:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
    [PIPELINE_STATUS.PROPUESTA_ACEPTADA]:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
    [PIPELINE_STATUS.PROPUESTA_RECHAZADA]:
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    [PIPELINE_STATUS.CERRADO_GANADO]:
      "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 font-semibold",
    [PIPELINE_STATUS.CERRADO_PERDIDO]:
      "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100 font-semibold",
    [PIPELINE_STATUS.DESCARTADO]:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
  };

/** Base classes for pipeline filter ring (apply when selected). */
export const PIPELINE_RING_BASE =
  "ring-2 ring-offset-2 dark:ring-offset-[#1e1e1e]";

/** Solo el color (ej. slate-500). Usar con PIPELINE_RING_BASE como ring-${color}. */
export const PIPELINE_STATUS_RING: Record<string, string> = {
  [PIPELINE_STATUS.DETECTADO]: "slate-500",
  [PIPELINE_STATUS.SELECCIONADO]: "blue-500",
  [PIPELINE_STATUS.CONTACTADO]: "indigo-500",
  [PIPELINE_STATUS.SIN_RESPUESTA]: "amber-500",
  [PIPELINE_STATUS.INTERESADO]: "emerald-500",
  [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]: "sky-500",
  [PIPELINE_STATUS.PROPUESTA_ENVIADA]: "cyan-500",
  [PIPELINE_STATUS.SEGUIMIENTO]: "violet-500",
  [PIPELINE_STATUS.EN_NEGOCIACION]: "orange-500",
  [PIPELINE_STATUS.PROPUESTA_ACEPTADA]: "green-500",
  [PIPELINE_STATUS.PROPUESTA_RECHAZADA]: "red-500",
  [PIPELINE_STATUS.CERRADO_GANADO]: "green-600",
  [PIPELINE_STATUS.CERRADO_PERDIDO]: "red-600",
  [PIPELINE_STATUS.DESCARTADO]: "neutral-500",
};

export const SALES_ACTIVITY_TYPE = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  REUNION: "Reunión",
} as const;

export const PROPOSAL_STATUS = {
  ENVIADA: "Enviada",
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  COMPRADA: "Comprada",
} as const;

export const FOLLOW_UP_TASK_STATUS = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
  POSPUESTO: "Pospuesto",
} as const;

export const TASK_PRIORITY = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
} as const;

export const EVENT_COLORS = {
  activity: "bg-orange-500",
  proposal: "bg-blue-500",
  followup: "bg-emerald-500",
} as const;

export const EVENT_LABELS = {
  activity: "Actividad",
  proposal: "Propuesta",
  followup: "Seguimiento",
} as const;

/** Subscription status (aligned with Stripe subscription status) */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELLED: "cancelled",
  UNPAID: "unpaid",
  TRIALING: "trialing",
} as const;

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { label: "Activa", value: SUBSCRIPTION_STATUS.ACTIVE },
  { label: "Vencida", value: SUBSCRIPTION_STATUS.PAST_DUE },
  { label: "Cancelada", value: SUBSCRIPTION_STATUS.CANCELLED },
  { label: "No pagada", value: SUBSCRIPTION_STATUS.UNPAID },
  { label: "En prueba", value: SUBSCRIPTION_STATUS.TRIALING },
] as const;

/** Badge classes for subscription status. Unknown status uses neutral. */
export const SUBSCRIPTION_STATUS_CLASSES: Record<string, string> = {
  [SUBSCRIPTION_STATUS.ACTIVE]:
    "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20",
  [SUBSCRIPTION_STATUS.PAST_DUE]:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20",
  [SUBSCRIPTION_STATUS.CANCELLED]:
    "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]",
  [SUBSCRIPTION_STATUS.UNPAID]:
    "bg-red-500/15 text-red-700 dark:text-red-400 dark:bg-red-500/20",
  [SUBSCRIPTION_STATUS.TRIALING]:
    "bg-blue-500/15 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20",
};

/** Plan feature keys (secciones/funcionalidades del sistema). Añadir aquí al agregar nuevas. */
export const PLAN_FEATURE_KEYS = {
  CRM: "crm",
  LEAD_SYNC: "lead_sync",//ready
  SALES_PERSON_MANAGEMENT: "sales_person_management",//ready
  EDIT_LEAD_DATA: "edit_lead_data",
  SALES_ACTIVITIES: "sales_activities",//ready
  ASSIGN_SALES_PERSON: "assign_sales_person",//ready
  FOLLOW_UP_TASKS: "follow_up_tasks",//ready
  PROPOSALS: "proposals",//ready
  CALENDAR_CRM: "calendar_crm",
  SALES_COMMISSION: "sales_commission",
} as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[keyof typeof PLAN_FEATURE_KEYS];

/** Metadatos por feature (nombre y descripción para UI). Añadir entradas al agregar funcionalidades. */
export const PLAN_FEATURES_MAP: Record<
  PlanFeatureKey,
  { name: string; description: string }
> = {
  [PLAN_FEATURE_KEYS.LEAD_SYNC]: {
    name: "Búsqueda de leads en mapa",
    description: "Búsqueda de leads",
  },
  [PLAN_FEATURE_KEYS.CRM]: {
    name: "CRM",
    description: "Gestión de leads y ventas",
  },
  [PLAN_FEATURE_KEYS.EDIT_LEAD_DATA]: {
    name: "Editar datos del lead",
    description: "Editar datos del lead",
  },
  [PLAN_FEATURE_KEYS.SALES_ACTIVITIES]: {
    name: "Actividades de ventas",
    description: "Registrar actividades de ventas",
  },
  [PLAN_FEATURE_KEYS.FOLLOW_UP_TASKS]: {
    name: "Tareas de seguimiento",
    description: "Crear tareas de seguimiento",
  },
  [PLAN_FEATURE_KEYS.PROPOSALS]: {
    name: "Propuestas",
    description: "Crear y gestionar propuestas",
  },
  [PLAN_FEATURE_KEYS.CALENDAR_CRM]: {
    name: "Gestión de calendario",
    description:
      "Gestión de propuestas, actividades de ventas y tareas de seguimiento",
  },
  [PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT]: {
    name: "Gestión de vendedores",
    description: "Gestión de vendedores",
  },
  [PLAN_FEATURE_KEYS.SALES_COMMISSION]: {
    name: "Comisión de ventas",
    description: "Configurar comisión de ventas",
  },
  [PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON]: {
    name: "Asignar vendedor",
    description: "Asignar vendedor al lead",
  },
};