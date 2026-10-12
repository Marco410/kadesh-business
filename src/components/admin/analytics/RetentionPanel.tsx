"use client";

import { useQuery } from "@apollo/client";
import { cn } from "kadesh/utils/cn";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
} from "../ui";
import { monthLabel } from "../clients/company/format";
import { ADMIN_COHORTS_QUERY, type AdminCohortsResponse } from "./analytics-queries";
import { HELP } from "./help";
import ViewGuide from "./ViewGuide";

const MONTH_OPTIONS = [
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
] as const;

/** Más uso, más intenso el naranja. Texto oscuro hasta que el fondo lo pide claro. */
function cellClass(ratio: number) {
  if (ratio >= 0.8) return "bg-orange-600 text-white";
  if (ratio >= 0.6) return "bg-orange-500 text-white";
  if (ratio >= 0.4) return "bg-orange-400/80 text-[#212121]";
  if (ratio >= 0.2) return "bg-orange-300/60 text-[#212121] dark:text-white";
  if (ratio > 0) return "bg-orange-200/50 text-[#212121] dark:bg-orange-300/20 dark:text-white";
  return "bg-[#f5f5f5] text-[#9e9e9e] dark:bg-[#2a2a2a]";
}

/**
 * Retención por mes de registro: de las empresas que se dieron de alta en un mes, qué parte
 * siguió usando Kadesh cada mes después (mes 0 = el de registro).
 */
export default function RetentionPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const months = searchParams.get("meses") === "12" ? "12" : "6";
  const { data, loading, error } = useQuery<AdminCohortsResponse>(ADMIN_COHORTS_QUERY, {
    variables: { input: { months: Number(months) } },
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.adminCohorts.rows ?? [];
  const columns = Math.max(0, ...rows.map((row) => row.active.length));

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide>
        Cada fila es un mes de registro. Cada columna, qué parte de esas empresas usó Kadesh ese
        mes: entró al panel, extrajo, movió algo del CRM o cotizó. Léela de izquierda a derecha: si
        el naranja se apaga rápido, las empresas se van pronto.
      </ViewGuide>
      <AdminFilterChips
        label="Meses"
        options={[...MONTH_OPTIONS]}
        value={months}
        onChange={(value) => setParams({ meses: value === "6" ? null : value })}
      />

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.every((row) => row.size === 0) ? (
        <AdminEmptyState title="No hay registros en estos meses" description="Prueba con 12 meses." />
      ) : (
        <AdminSectionCard
          title="Retención por mes de registro"
          description="Mes 0 = el mes en que se registraron."
          help={HELP.retention}
        >
          <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-left text-sm">
              <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                <tr>
                  <th className="py-1 pr-2 font-medium">Registro</th>
                  <th className="py-1 pr-2 font-medium">Empresas</th>
                  {Array.from({ length: columns }, (_, index) => (
                    <th key={index} className="py-1 text-center font-medium">
                      Mes {index}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const [year, month] = row.month.split("-").map(Number);
                  return (
                    <tr key={row.month}>
                      <td className="whitespace-nowrap py-1 pr-2 capitalize text-[#212121] dark:text-white">
                        {monthLabel(year, month)}
                      </td>
                      <td className="py-1 pr-2 tabular-nums text-[#616161] dark:text-[#b0b0b0]">{row.size}</td>
                      {Array.from({ length: columns }, (_, index) => {
                        if (index >= row.active.length) return <td key={index} aria-hidden />;
                        const active = row.active[index];
                        const ratio = row.size ? active / row.size : 0;
                        return (
                          <td
                            key={index}
                            title={`${active} de ${row.size}`}
                            className={cn(
                              "h-9 min-w-12 rounded-md text-center text-xs font-semibold tabular-nums",
                              row.size ? cellClass(ratio) : "text-[#9e9e9e]",
                            )}
                          >
                            {row.size ? `${Math.round(ratio * 100)}%` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#9e9e9e]">
            El mes actual va a medias. Las cuentas de prueba interna no cuentan.
          </p>
        </AdminSectionCard>
      )}
    </div>
  );
}
