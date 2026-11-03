"use client";

import AdminPetPlaceServicesPanel from "../AdminPetPlaceServicesPanel";
import AdminPetPlacesPanel from "../AdminPetPlacesPanel";
import AdminAnimalsPanel from "../animals/AdminAnimalsPanel";
import { PET_VISTAS, type PetVista } from "./constants";
import AdminPetOverview from "./overview/AdminPetOverview";

/**
 * Operaciones → Kadesh Pet: Resumen (entrada), Animales, Veterinarias y Servicios. La vista vive
 * en `?vista=` y se elige en el menú lateral; solo se monta la vista abierta, así cada una pide
 * solo sus datos.
 */
export default function AdminPetSection({
  vista,
  initialPlaceId,
  onConsumedInitialPlace,
  initialServiceId,
  onConsumedInitialService,
}: {
  vista: PetVista;
  initialPlaceId?: string | null;
  onConsumedInitialPlace?: () => void;
  initialServiceId?: string | null;
  onConsumedInitialService?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {vista === PET_VISTAS.SUMMARY ? <AdminPetOverview /> : null}
      {vista === PET_VISTAS.ANIMALS ? <AdminAnimalsPanel /> : null}
      {vista === PET_VISTAS.PLACES ? (
        <AdminPetPlacesPanel
          initialPlaceId={initialPlaceId}
          onConsumedInitialPlace={onConsumedInitialPlace}
        />
      ) : null}
      {vista === PET_VISTAS.SERVICES ? (
        <AdminPetPlaceServicesPanel
          initialServiceId={initialServiceId}
          onConsumedInitialService={onConsumedInitialService}
        />
      ) : null}
    </div>
  );
}
