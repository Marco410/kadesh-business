"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapPinIcon } from "@hugeicons/core-free-icons";
import { getCategoryLabel } from "kadesh/components/profile/sales/helpers/category";
import { formatDate } from "kadesh/utils/format-date";
import { ANALYTICS_DAY_OPTIONS, parseAnalyticsDays } from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
  formatCredits,
} from "../ui";
import { ADMIN_DEMAND_GAPS_QUERY, type AdminDemandGapsResponse } from "./analytics-queries";

const THRESHOLD_OPTIONS = [
  { value: "0", label: "Sin resultados" },
  { value: "5", label: "5 o menos" },
  { value: "10", label: "10 o menos" },
] as const;

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
}

function ZoneLink({ lat, lng }: { lat: number; lng: number }) {
  return (
    <a
      href={mapsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-orange-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded dark:text-orange-400"
    >
      <HugeiconsIcon icon={MapPinIcon} size={14} aria-hidden />
      {lat.toFixed(1)}, {lng.toFixed(1)}
      <span className="sr-only">(abre Google Maps)</span>
    </a>
  );
}

/**
 * Demanda no cubierta: extracciones que trajeron pocos resultados. Dice dónde falta cobertura
 * de Google Maps / INEGI o qué giros buscan los clientes sin encontrar.
 */
export default function DemandPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days = parseAnalyticsDays(searchParams.get("dias"));
  const threshold =
    THRESHOLD_OPTIONS.find((option) => option.value === searchParams.get("umbral"))?.value ?? "5";
  const { data, loading, error } = useQuery<AdminDemandGapsResponse>(ADMIN_DEMAND_GAPS_QUERY, {
    variables: { input: { days: Number(days), threshold: Number(threshold) } },
    fetchPolicy: "cache-and-network",
  });
  const demand = data?.adminDemandGaps;
  const lowPct = demand?.runs ? Math.round((demand.lowRuns / demand.runs) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
        Extracciones exitosas que trajeron pocos negocios (nuevos + los que ya estaban en Kadesh).
        Las corridas con error y las de cuentas de prueba no cuentan. Zona = cuadro de unos 11 km.
      </p>
      <div className="flex flex-col gap-3">
        <AdminFilterChips
          label="Periodo"
          options={[...ANALYTICS_DAY_OPTIONS]}
          value={days}
          onChange={(value) => setParams({ dias: value === "90" ? null : value })}
        />
        <AdminFilterChips
          label="Pocos ="
          options={[...THRESHOLD_OPTIONS]}
          value={threshold}
          onChange={(value) => setParams({ umbral: value === "5" ? null : value })}
        />
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && !demand ? (
        <AdminLoadingRows rows={6} />
      ) : !demand || demand.runs === 0 ? (
        <AdminEmptyState title="No hay extracciones en este periodo" description="Elige un periodo más largo." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <AdminStatTile label="Extracciones" value={formatCredits(demand.runs)} />
            <AdminStatTile label="Con pocos resultados" value={formatCredits(demand.lowRuns)} tone={demand.lowRuns ? "warning" : "default"} />
            <AdminStatTile label="Porcentaje" value={`${lowPct}%`} />
          </div>

          <AdminSectionCard
            title="Huecos: giro + zona"
            description="Lo que se buscó 2 veces o más en la misma zona y salió con pocos resultados."
          >
            {demand.gaps.length === 0 ? (
              <p className="text-sm text-[#9e9e9e]">Ningún giro se repitió con pocos resultados en una misma zona.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {demand.gaps.map((gap) => (
                  <li key={`${gap.category}-${gap.lat}-${gap.lng}`} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#212121] dark:text-white">{getCategoryLabel(gap.category)}</p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {gap.lowRuns} de {gap.runs} con pocos resultados · promedio {gap.avgResults} ·{" "}
                        {gap.companies} empresa{gap.companies === 1 ? "" : "s"}
                        {gap.lastAt ? ` · última ${formatDate(gap.lastAt)}` : ""}
                      </p>
                    </div>
                    <ZoneLink lat={gap.lat} lng={gap.lng} />
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <AdminSectionCard title="Por giro" description="Giros con más extracciones flojas.">
              <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Giro</th>
                      <th className="py-2 pr-3 font-medium">Flojas</th>
                      <th className="py-2 pr-3 font-medium">Promedio</th>
                      <th className="py-2 font-medium">Empresas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                    {demand.categories.map((row) => (
                      <tr key={row.category}>
                        <td className="py-2 pr-3 text-[#212121] dark:text-white">{getCategoryLabel(row.category)}</td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#212121] dark:text-white">
                          {row.lowRuns} <span className="text-xs text-[#9e9e9e]">de {row.runs}</span>
                        </td>
                        <td className="py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">{row.avgResults}</td>
                        <td className="py-2 tabular-nums text-[#616161] dark:text-[#b0b0b0]">{row.companies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Por zona" description="Zonas con más extracciones flojas y qué se buscó ahí.">
              <ul className="flex flex-col divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {demand.zones.map((zone) => (
                  <li key={`${zone.lat}-${zone.lng}`} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-[#212121] dark:text-white">
                        {zone.topCategories.map((category) => getCategoryLabel(category)).join(", ") || "Varios giros"}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {zone.lowRuns} de {zone.runs} flojas · {zone.companies} empresa{zone.companies === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ZoneLink lat={zone.lat} lng={zone.lng} />
                  </li>
                ))}
              </ul>
            </AdminSectionCard>
          </div>
        </>
      )}
    </div>
  );
}
