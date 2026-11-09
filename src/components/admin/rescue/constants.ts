import { PET_PLACE_PUBLIC_ORIGIN } from "kadesh/components/admin/constants";

/**
 * Espacios de rescate de Kadesh Pet (rescatistas, refugios, hogares temporales, colectivos y
 * asociaciones). Mismos valores que kadesh-back (`models/Pet/RescueOrganization/constants.ts`).
 */

export const RESCUE_ORG_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

export type RescueOrgStatus = (typeof RESCUE_ORG_STATUS)[keyof typeof RESCUE_ORG_STATUS];

export const RESCUE_ORG_STATUS_LABELS: Record<string, string> = {
  [RESCUE_ORG_STATUS.PENDING]: "En revisión",
  [RESCUE_ORG_STATUS.VERIFIED]: "Verificado",
  [RESCUE_ORG_STATUS.REJECTED]: "Rechazado",
  [RESCUE_ORG_STATUS.SUSPENDED]: "Suspendido",
};

export const RESCUE_ORG_STATUS_TONE: Record<string, "neutral" | "ok" | "warning" | "danger"> = {
  [RESCUE_ORG_STATUS.PENDING]: "warning",
  [RESCUE_ORG_STATUS.VERIFIED]: "ok",
  [RESCUE_ORG_STATUS.REJECTED]: "danger",
  [RESCUE_ORG_STATUS.SUSPENDED]: "neutral",
};

/** Filtro de la lista. `allies` = verificados y aliados. Default: En revisión. */
export type RescueOrgFilter = RescueOrgStatus | "allies";

export const RESCUE_ORG_FILTERS: Array<{ value: RescueOrgFilter; label: string }> = [
  { value: RESCUE_ORG_STATUS.PENDING, label: "En revisión" },
  { value: RESCUE_ORG_STATUS.VERIFIED, label: "Verificados" },
  { value: "allies", label: "Aliados" },
  { value: RESCUE_ORG_STATUS.REJECTED, label: "Rechazados" },
  { value: RESCUE_ORG_STATUS.SUSPENDED, label: "Suspendidos" },
];

export const RESCUE_ORG_TYPE_LABELS: Record<string, string> = {
  independent: "Rescatista independiente",
  shelter: "Refugio o santuario",
  foster_home: "Hogar temporal",
  collective: "Colectivo",
  civil_association: "A.C. o fundación",
};

export const RESCUE_SPECIES_LABELS: Record<string, string> = {
  dog: "Perros",
  cat: "Gatos",
  bird: "Aves",
  fish: "Peces",
  reptil: "Reptiles",
  mammal: "Mamíferos",
};

export const RESCUE_ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordinador",
  volunteer: "Voluntario",
  foster: "Hogar temporal",
};

export const ADMIN_RESCUE_PAGE_SIZE = 20;
/** Igual que el backend (`RESCUE_ORG_LIMITS.STATUS_NOTE_MAX`). */
export const RESCUE_STATUS_NOTE_MAX = 500;
/** Rechazar o suspender exige explicarle el motivo al espacio. */
export const RESCUE_STATUS_NOTE_MIN = 10;

export function rescueStatusWhere(filter: RescueOrgFilter) {
  if (filter === "allies") return { status: { equals: RESCUE_ORG_STATUS.VERIFIED }, isAlly: { equals: true } };
  return { status: { equals: filter } };
}

/** Perfil público en Kadesh Pet (solo existe si está verificado). */
export function rescueOrgPublicUrl(slug: string): string {
  return `${PET_PLACE_PUBLIC_ORIGIN}/organizaciones/${slug}`;
}

/** WhatsApp del espacio (10 dígitos de México). */
export function rescueWhatsAppUrl(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  const base = `https://wa.me/52${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
