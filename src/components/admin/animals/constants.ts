import { PET_PLACE_PUBLIC_ORIGIN } from "kadesh/components/admin/constants";

/** Mismos valores que `ANIMAL_LOGS_OPTIONS` en kadesh-back. */
export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  register: "Registrado",
  adopted: "Adoptado",
  abandoned: "Abandonado",
  rescued: "Rescatado",
  in_family: "En familia",
  lost: "Perdido",
  found: "Encontrado",
  in_adoption: "En adopción",
};

/** Filtro por estatus actual (el registro más reciente de la bitácora); `""` = todos. */
export const ANIMAL_STATUS_FILTER_OPTIONS = Object.entries(ANIMAL_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const ANIMAL_STATUS_CLASS: Record<string, string> = {
  lost: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  found: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  in_adoption: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  adopted: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  rescued: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

export const ANIMAL_STATUS_DEFAULT_CLASS =
  "bg-[#eeeeee] text-[#424242] dark:bg-[#2a2a2a] dark:text-[#d6d6d6]";

/** Sin bitácora o con un valor que no está en `ANIMAL_LOGS_OPTIONS` (lo devuelve `adminPetSummary`). */
export const ANIMAL_STATUS_NONE = "none";

export function animalStatusLabel(status: string): string {
  if (status === ANIMAL_STATUS_NONE) return "Sin estatus";
  return ANIMAL_STATUS_LABELS[status] ?? status;
}

/**
 * Orden de los estatus en gráficas: primero los casos abiertos (perdido, encontrado, en la
 * calle, en adopción), luego los que ya tienen hogar y al final los que no dicen nada.
 */
export const ANIMAL_STATUS_CHART_ORDER = [
  "lost",
  "found",
  "abandoned",
  "rescued",
  "in_adoption",
  "adopted",
  "in_family",
  "register",
  ANIMAL_STATUS_NONE,
];

/** Color sólido de cada estatus para barras (mismo tono que su badge). */
export const ANIMAL_STATUS_BAR_CLASS: Record<string, string> = {
  lost: "bg-red-500 dark:bg-red-400",
  found: "bg-emerald-500 dark:bg-emerald-400",
  abandoned: "bg-stone-500 dark:bg-stone-400",
  rescued: "bg-amber-500 dark:bg-amber-400",
  in_adoption: "bg-sky-500 dark:bg-sky-400",
  adopted: "bg-violet-500 dark:bg-violet-400",
  in_family: "bg-teal-500 dark:bg-teal-400",
  register: "bg-[#9e9e9e] dark:bg-[#757575]",
  [ANIMAL_STATUS_NONE]: "bg-[#d6d6d6] dark:bg-[#4a4a4a]",
};

/** `AnimalType.name` guarda el valor ("dog"); mismas etiquetas que `ANIMAL_TYPE_OPTIONS` en kadesh-back. */
export const ANIMAL_TYPE_LABELS: Record<string, string> = {
  dog: "Perro",
  cat: "Gato",
  bird: "Ave",
  fish: "Pez",
  reptil: "Reptil",
  mammal: "Mamífero",
};

export const REPORTED_BY_LABELS: Record<string, string> = {
  owner: "Dueño",
  volunteer: "Voluntario",
};

export const SEX_LABELS: Record<string, string> = {
  male: "Macho",
  female: "Hembra",
  unknown: "Desconocido",
};

export type AnimalCreatorFilter = "todos" | "usuario" | "admin";
export type AnimalFacebookFilter = "todos" | "pendiente" | "publicado";

export const CREATOR_FILTER_OPTIONS: Array<{ value: AnimalCreatorFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "usuario", label: "De usuarios" },
  { value: "admin", label: "Del admin" },
];

export const FACEBOOK_FILTER_OPTIONS: Array<{ value: AnimalFacebookFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Sin publicar" },
  { value: "publicado", label: "Publicados" },
];

/** Valores que entiende `adminAnimals` en el back. */
export const CREATOR_FILTER_API: Record<AnimalCreatorFilter, string | null> = {
  todos: null,
  usuario: "user",
  admin: "admin",
};

export const FACEBOOK_FILTER_API: Record<AnimalFacebookFilter, string | null> = {
  todos: null,
  pendiente: "pending",
  publicado: "published",
};

export const ADMIN_ANIMALS_PAGE_SIZE = 20;

/** Ficha pública y formulario de edición en Kadesh Pet (kadesh-landing). */
export function petAnimalUrl(slug: string): string {
  return `${PET_PLACE_PUBLIC_ORIGIN}/animales/${encodeURIComponent(slug)}`;
}

export function petAnimalEditUrl(slug: string): string {
  return `${petAnimalUrl(slug)}/editar`;
}

export function facebookPostUrl(postId: string): string {
  return `https://www.facebook.com/${postId}`;
}
