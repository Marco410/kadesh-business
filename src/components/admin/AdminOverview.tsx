"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  ADMIN_OVERVIEW_QUERY,
  type AdminOverviewResponse,
} from "./queries";
import {
  ADMIN_TABS,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_CLAIM_STATUS_CLASSES,
  PET_PLACE_CLAIM_STATUS_LABELS,
  PET_PLACE_SERVICE_STATUS,
  PET_PLACE_SERVICE_STATUS_CLASSES,
  PET_PLACE_SERVICE_STATUS_LABELS,
  USERS_VISTAS,
  type AdminTab,
} from "./constants";
import {
  AdminErrorState,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "./ui";
import { cn } from "kadesh/utils/cn";
import { SUBSCRIPTION_STATUS } from "kadesh/constants/constans";

export default function AdminOverview({
  onOpenTab,
  onReviewPlace,
  onReviewService,
}: {
  onOpenTab: (tab: AdminTab, vista?: string) => void;
  onReviewPlace: (placeId: string) => void;
  onReviewService: (serviceId: string) => void;
}) {
  const { data, loading, error } = useQuery<AdminOverviewResponse>(
    ADMIN_OVERVIEW_QUERY,
    {
      fetchPolicy: "network-only",
      variables: {
        activeWhere: { status: { equals: SUBSCRIPTION_STATUS.ACTIVE } },
        pendingWhere: {
          claimStatus: { equals: PET_PLACE_CLAIM_STATUS.PENDING },
        },
        verifiedWhere: { verified: { equals: true } },
        pendingServiceWhere: {
          status: { equals: PET_PLACE_SERVICE_STATUS.PENDING },
        },
      },
    },
  );

  if (error) {
    return (
      <AdminErrorState message="No se pudo cargar el resumen. Intenta de nuevo." />
    );
  }

  const kpis = [
    {
      tab: ADMIN_TABS.USERS,
      label: "Usuarios",
      value: data?.usersCount ?? 0,
      hint: "Cuentas registradas",
      icon: UserIcon,
    },
    {
      tab: ADMIN_TABS.USERS,
      label: "Suscripciones activas",
      value: data?.activeSubscriptions ?? 0,
      hint: "Empresas con plan vigente",
      icon: CheckmarkCircle02Icon,
      vista: USERS_VISTAS.SUBSCRIPTIONS as string,
    },
    {
      tab: ADMIN_TABS.PET_PLACES,
      label: "En revisión",
      value: data?.pendingPlaces ?? 0,
      hint: "Fichas por verificar",
      icon: CheckmarkCircle02Icon,
      emphasize: (data?.pendingPlaces ?? 0) > 0,
    },
    {
      tab: ADMIN_TABS.PET_PLACES,
      label: "Servicios pedidos",
      value: data?.pendingServices ?? 0,
      hint: "Por aprobar y asignar",
      icon: CheckmarkCircle02Icon,
      emphasize: (data?.pendingServices ?? 0) > 0,
      vista: "servicios" as string,
    },
  ];

  const pending = data?.pendingPetPlaces ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onOpenTab(kpi.tab, "vista" in kpi ? kpi.vista : undefined)}
            className={cn(
              surfaceClass,
              "p-4 text-left cursor-pointer transition-colors hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              kpi.emphasize && "border-amber-300 dark:border-amber-600",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
                {kpi.label}
              </p>
              <HugeiconsIcon
                icon={kpi.icon}
                size={18}
                className="text-orange-500"
              />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-[#212121] dark:text-white">
              {loading ? "—" : kpi.value}
            </p>
            <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
              {kpi.hint}
            </p>
          </button>
        ))}
      </div>

      <section className={cn(surfaceClass, "p-4 sm:p-5")}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#212121] dark:text-white">
              Reclamos por revisar
            </h2>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
              Alguien pidió la ficha. Confirma que es suya antes de verificarla.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES)}
            className="hidden sm:inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            Ver todas
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse"
              />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="py-8 text-sm text-center text-[#616161] dark:text-[#b0b0b0]">
            No hay fichas en revisión. Las nuevas solicitudes aparecerán aquí.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onReviewPlace(place.id)}
                  className="w-full rounded-xl border border-[#e8e8e8] dark:border-[#333] p-3 text-left hover:border-orange-300 dark:hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white truncate">
                        {place.name}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {[place.municipality, place.state]
                          .filter(Boolean)
                          .join(", ") || "Sin ubicación"}
                        {" · "}
                        {formatPersonName(place.user?.name, place.user?.lastName)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_CLAIM_STATUS_LABELS[place.claimStatus ?? ""] ??
                          "Sin estado"
                        }
                        className={
                          PET_PLACE_CLAIM_STATUS_CLASSES[place.claimStatus ?? ""]
                        }
                      />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Revisar
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cn(surfaceClass, "p-4 sm:p-5")}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#212121] dark:text-white">
              Servicios por aprobar
            </h2>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
              Un dueño pidió un servicio que no estaba en el catálogo. Al
              aprobarlo, se marca en su ficha.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTab(ADMIN_TABS.PET_PLACES, "servicios")}
            className="hidden sm:inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            Ver todos
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse"
              />
            ))}
          </div>
        ) : (data?.pendingPetPlaceServices ?? []).length === 0 ? (
          <p className="py-8 text-sm text-center text-[#616161] dark:text-[#b0b0b0]">
            No hay servicios pendientes.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(data?.pendingPetPlaceServices ?? []).map((service) => (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => onReviewService(service.id)}
                  className="w-full rounded-xl border border-[#e8e8e8] dark:border-[#333] p-3 text-left hover:border-orange-300 dark:hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white truncate">
                        {service.name ?? "Servicio"}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {service.requestedFor?.name ?? "Sin clínica"}
                        {" · "}
                        {formatPersonName(
                          service.requestedBy?.name,
                          service.requestedBy?.lastName,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <AdminStatusBadge
                        label={
                          PET_PLACE_SERVICE_STATUS_LABELS[service.status ?? ""] ??
                          "Pendiente"
                        }
                        className={
                          PET_PLACE_SERVICE_STATUS_CLASSES[service.status ?? ""]
                        }
                      />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Revisar
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
