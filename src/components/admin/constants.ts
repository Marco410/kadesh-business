import { PIPELINE_STATUS, Role } from "kadesh/constants/constans";

export const ADMIN_TABS = {
  OVERVIEW: "inicio",
  USERS: "usuarios",
  PLANS: "planes",
  PET_PLACES: "veterinarias",
} as const;

export type AdminTab = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];

/** Valor viejo de la tab de suscripciones; ahora es una vista dentro de Usuarios. */
const LEGACY_SUBSCRIPTIONS_TAB = "suscripciones";

export const ADMIN_TAB_ITEMS: Array<{
  id: AdminTab;
  label: string;
  description: string;
}> = [
  {
    id: ADMIN_TABS.OVERVIEW,
    label: "Inicio",
    description: "Resumen de operaciones",
  },
  {
    id: ADMIN_TABS.USERS,
    label: "Usuarios",
    description: "Cuentas y suscripciones",
  },
  {
    id: ADMIN_TABS.PLANS,
    label: "Planes",
    description: "Catálogo, precios y módulos",
  },
  {
    id: ADMIN_TABS.PET_PLACES,
    label: "Veterinarias",
    description: "Reclamos y verificación",
  },
];

/** Vistas dentro de la sección Usuarios. */
export const USERS_VISTAS = {
  ACCOUNTS: "cuentas",
  SUBSCRIPTIONS: "suscripciones",
} as const;

export type UsersVista = (typeof USERS_VISTAS)[keyof typeof USERS_VISTAS];

/** Vistas dentro de la sección Planes. */
export const PLANS_VISTAS = {
  CATALOG: "catalogo",
  MODULES: "modulos",
} as const;

export type PlansVista = (typeof PLANS_VISTAS)[keyof typeof PLANS_VISTAS];

export function parseAdminTab(value: string | null): AdminTab {
  if (value === LEGACY_SUBSCRIPTIONS_TAB) return ADMIN_TABS.USERS;
  if (
    value === ADMIN_TABS.USERS ||
    value === ADMIN_TABS.PLANS ||
    value === ADMIN_TABS.PET_PLACES
  ) {
    return value;
  }
  return ADMIN_TABS.OVERVIEW;
}

/** `?tab=suscripciones` (enlace viejo) entra directo a la vista de suscripciones. */
export function parseUsersVista(
  tab: string | null,
  vista: string | null,
): UsersVista {
  if (tab === LEGACY_SUBSCRIPTIONS_TAB) return USERS_VISTAS.SUBSCRIPTIONS;
  return vista === USERS_VISTAS.SUBSCRIPTIONS
    ? USERS_VISTAS.SUBSCRIPTIONS
    : USERS_VISTAS.ACCOUNTS;
}

export function parsePlansVista(vista: string | null): PlansVista {
  return vista === PLANS_VISTAS.MODULES
    ? PLANS_VISTAS.MODULES
    : PLANS_VISTAS.CATALOG;
}

export const ADMIN_PAGE_SIZE = 25;

export const ROLE_LABELS: Record<string, string> = {
  [Role.ADMIN]: "Admin plataforma",
  [Role.USER]: "Usuario",
  [Role.AUTHOR]: "Autor",
  [Role.ADMIN_COMPANY]: "Admin empresa",
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
