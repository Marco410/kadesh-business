/** Vistas de Kadesh Pet en Operaciones (`?tab=veterinarias&vista=`). Sin `vista` = Resumen. */
export const PET_VISTAS = {
  SUMMARY: "resumen",
  ANIMALS: "animales",
  PLACES: "fichas",
  SERVICES: "servicios",
} as const;

export type PetVista = (typeof PET_VISTAS)[keyof typeof PET_VISTAS];

export const PET_VISTA_ITEMS: Array<{ id: PetVista; label: string }> = [
  { id: PET_VISTAS.SUMMARY, label: "Resumen" },
  { id: PET_VISTAS.ANIMALS, label: "Animales" },
  { id: PET_VISTAS.PLACES, label: "Veterinarias" },
  { id: PET_VISTAS.SERVICES, label: "Servicios" },
];

/** `fichas` se queda como valor de Veterinarias para no romper enlaces viejos. */
export function parsePetVista(value: string | null): PetVista {
  if (
    value === PET_VISTAS.ANIMALS ||
    value === PET_VISTAS.PLACES ||
    value === PET_VISTAS.SERVICES
  ) {
    return value;
  }
  return PET_VISTAS.SUMMARY;
}
