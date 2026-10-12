"use client";

import { useQuery } from "@apollo/client";
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
import {
  ADMIN_ACQUISITION_QUERY,
  type AdminAcquisitionResponse,
  type AdminAcquisitionRow,
} from "./analytics-queries";
import { HELP } from "./help";
import ViewGuide from "./ViewGuide";

const pct = (part: number, total: number) => (total ? `${Math.round((part / total) * 100)}%` : "—");

function AcquisitionTable({
  rows,
  keyLabel,
  empty,
}: {
  rows: AdminAcquisitionRow[];
  keyLabel: string;
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-[#9e9e9e]">{empty}</p>;
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          <tr>
            <th className="py-2 pr-3 font-medium">{keyLabel}</th>
            <th className="py-2 pr-3 font-medium">Empresas</th>
            <th className="py-2 pr-3 font-medium">Extrajeron</th>
            <th className="py-2 font-medium">Pagaron</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="max-w-[16rem] truncate py-2 pr-3 text-[#212121] dark:text-white" title={row.key}>
                {row.key}
              </td>
              <td className="py-2 pr-3 tabular-nums text-[#212121] dark:text-white">{row.companies}</td>
              <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                {pct(row.activated, row.companies)} <span className="text-xs">({row.activated})</span>
              </td>
              <td className="whitespace-nowrap py-2 tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{pct(row.paid, row.companies)}</span>{" "}
                <span className="text-xs">({row.paid})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * De dónde llegan las empresas (primer contacto guardado al registrarse) y cuáles terminan
 * usando y pagando. Las registradas antes de medir esto salen como "Sin dato".
 */
export default function AcquisitionPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days = parseAnalyticsDays(searchParams.get("dias"));
  const { data, loading, error } = useQuery<AdminAcquisitionResponse>(ADMIN_ACQUISITION_QUERY, {
    variables: { input: { days: Number(days) } },
    fetchPolicy: "cache-and-network",
  });
  const acquisition = data?.adminAcquisition;

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide>
        De dónde llegan las empresas que se registran y cuáles terminan usando y pagando. Compara
        canales por &quot;Pagaron&quot;, no solo por cuántas empresas traen: un canal con muchos
        registros que no pagan cuesta más de lo que deja.
      </ViewGuide>
      <AdminFilterChips
        label="Registradas en"
        options={[...ANALYTICS_DAY_OPTIONS]}
        value={days}
        onChange={(value) => setParams({ dias: value === "90" ? null : value })}
      />

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && !acquisition ? (
        <AdminLoadingRows rows={6} />
      ) : !acquisition || acquisition.companies === 0 ? (
        <AdminEmptyState title="No hay registros en este periodo" description="Elige un periodo más largo." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <AdminStatTile label="Empresas registradas" value={formatCredits(acquisition.companies)} />
            <AdminStatTile
              label="Con origen guardado"
              help={HELP.acquisitionWithData}
              value={pct(acquisition.withData, acquisition.companies)}
              hint={`${acquisition.withData} de ${acquisition.companies}`}
            />
            <AdminStatTile
              label="Pagaron"
              help={HELP.acquisitionPaid}
              value={pct(
                acquisition.channels.reduce((sum, row) => sum + row.paid, 0),
                acquisition.companies,
              )}
            />
          </div>

          <AdminSectionCard title="Por canal" help={HELP.acquisitionChannels}>
            <AcquisitionTable rows={acquisition.channels} keyLabel="Canal" empty="Sin registros." />
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <AdminSectionCard title="Página de entrada" description="Primera página que vieron (sin parámetros)." help={HELP.acquisitionLandings}>
              <AcquisitionTable
                rows={acquisition.landings}
                keyLabel="Página"
                empty="Todavía no hay registros con página de entrada."
              />
            </AdminSectionCard>
            <AdminSectionCard title="Campañas" description="utm_campaign de los enlaces." help={HELP.acquisitionCampaigns}>
              <AcquisitionTable
                rows={acquisition.campaigns}
                keyLabel="Campaña"
                empty="Ningún registro llegó con utm_campaign."
              />
            </AdminSectionCard>
          </div>
        </>
      )}
    </div>
  );
}
