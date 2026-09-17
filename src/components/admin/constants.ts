import { Role } from "kadesh/constants/constans";

export const ADMIN_TABS = {
  OVERVIEW: "inicio",
  USERS: "usuarios",
  SUBSCRIPTIONS: "suscripciones",
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
    description: "Resumen de operaciones",
  },
  {
    id: ADMIN_TABS.USERS,
    label: "Usuarios",
    description: "Cuentas de la plataforma",
  },
  {
    id: ADMIN_TABS.SUBSCRIPTIONS,
    label: "Planes",
    description: "Suscripciones y features",
  },
  {
    id: ADMIN_TABS.PET_PLACES,
    label: "Veterinarias",
    description: "Reclamos y verificación",
  },
];

export function parseAdminTab(value: string | null): AdminTab {
  if (
    value === ADMIN_TABS.USERS ||
    value === ADMIN_TABS.SUBSCRIPTIONS ||
    value === ADMIN_TABS.PET_PLACES
  ) {
    return value;
  }
  return ADMIN_TABS.OVERVIEW;
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

export const PET_PLACE_CLAIM_ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  manager: "Encargado",
  vet: "Veterinario",
};

export const SUBSCRIPTION_STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "trialing", label: "Prueba" },
  { value: "past_due", label: "Vencidas" },
  { value: "unpaid", label: "No pagadas" },
  { value: "cancelled", label: "Canceladas" },
] as const;
