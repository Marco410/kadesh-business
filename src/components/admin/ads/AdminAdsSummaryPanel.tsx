"use client";

import { useQuery } from "@apollo/client";
import { ColumnBars, HBarList } from "kadesh/components/app-shell";
import { formatDateShort } from "kadesh/utils/format-date";
import ViewGuide from "../analytics/ViewGuide";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { storeSummaryDelta } from "../store/constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
} from "../ui";
import { AD_PLACEMENT_LABELS, AD_STATS_DAY_OPTIONS, AD_STATS_DEFAULT_DAYS, formatCtr } from "./constants";
import { ADMIN_AD_STATS_QUERY, type AdminAdStats } from "./queries";

const HELP = {
  impressions:
    "Veces que un anuncio quedó al menos a la mitad en pantalla durante 1 segundo. La misma persona cuenta una vez cada 30 minutos por anuncio y lugar. No cuentan los admins ni los buscadores.",
  clicks: "Toques en el anuncio, con la misma regla de 30 minutos por persona.",
  ctr: "Clics entre impresiones. En anuncios de este tipo, 0.5 % a 2 % es lo normal.",
  active: "Anuncios en estado Activo ahora, estén o no dentro de sus fechas.",
};

const count = (value: number) => value.toLocaleString("es-MX");

/**
 * Anuncios → Resumen: impressions and clicks of every ad in a period, by day, by placement and the
 * top 10. One request when it opens or the period changes; the backend keeps it 5 minutes.
 */
export default function AdminAdsSummaryPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const days =
    AD_STATS_DAY_OPTIONS.find((option) => option.value === searchParams.get("dias"))?.value ?? String(AD_STATS_DEFAULT_DAYS);
  const { data, loading, error } = useQuery<{ adminAdStats: AdminAdStats }>(ADMIN_AD_STATS_QUERY, {
    variables: { days: Number(days) },
    fetchPolicy: "cache-and-network",
  });
  const stats = data?.adminAdStats;

  if (error && !stats) return <AdminErrorState message={adminErrorText(error, "No se pudo cargar el resumen. Intenta de nuevo.")} />;
  if (!stats) return loading ? <AdminLoadingRows rows={6} /> : null;

  const lastKey = stats.series[stats.series.length - 1]?.key;
  const periodLabel = AD_STATS_DAY_OPTIONS.find((option) => option.value === String(stats.days))?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      <ViewGuide note="Hora del centro de México. Se actualiza cada 5 minutos.">
        Cuántas veces se vieron los anuncios de Kadesh Pet (web y app) y cuántas personas los tocaron.
      </ViewGuide>

      <div className="flex justify-end">
        <AdminFilterChips
          options={[...AD_STATS_DAY_OPTIONS]}
          value={days}
          onChange={(value) => setParams({ dias: value === String(AD_STATS_DEFAULT_DAYS) ? null : value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <AdminStatTile
          variant="dark"
          label="Impresiones"
          value={count(stats.impressions)}
          help={HELP.impressions}
          delta={storeSummaryDelta(stats.impressions, stats.previousImpressions, count)}
        />
        <AdminStatTile
          variant="tint"
          label="Clics"
          value={count(stats.clicks)}
          help={HELP.clicks}
          delta={storeSummaryDelta(stats.clicks, stats.previousClicks, count)}
        />
        <AdminStatTile label="Tasa de clic" value={formatCtr(stats.clicks, stats.impressions)} help={HELP.ctr} />
        <AdminStatTile
          label="Anuncios activos"
          value={count(stats.activeAds)}
          help={HELP.active}
          onClick={() => setParams({ seccion: null, estado: "active", dias: null })}
        />
      </div>

      {stats.impressions === 0 && stats.clicks === 0 ? (
        <AdminEmptyState
          title={`Sin impresiones en ${periodLabel}`}
          description={
            stats.activeAds === 0
              ? "No hay anuncios activos. Crea uno o activa uno de la lista."
              : "Los anuncios activos todavía no se han visto en este periodo."
          }
        />
      ) : (
        <>
          <AdminSectionCard title="Impresiones por día">
            <ColumnBars
              points={stats.series.map((point) => ({
                key: point.key,
                label: formatDateShort(`${point.key}T12:00:00`, false),
                value: point.impressions,
                title: `${formatDateShort(`${point.key}T12:00:00`, false)}: ${count(point.impressions)} impresiones y ${count(point.clicks)} clics`,
                current: point.key === lastKey,
              }))}
              ariaLabel="Impresiones por día"
              unitLabel="impresiones"
              heightClass="h-44"
              formatValue={count}
            />
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <AdminSectionCard title="Por lugar" description="Dónde se vieron y la tasa de clic de cada lugar." index={1}>
              <HBarList
                items={stats.byPlacement.map((row) => ({
                  key: row.key,
                  label: `${AD_PLACEMENT_LABELS[row.key] ?? row.key} · ${count(row.clicks)} clics · ${formatCtr(row.clicks, row.impressions)}`,
                  count: row.impressions,
                }))}
                emptyLabel="Sin impresiones en este periodo."
                formatValue={count}
              />
            </AdminSectionCard>
            <AdminSectionCard title="Anuncios con más impresiones" index={2}>
              {stats.topAds.length === 0 ? (
                <p className="text-sm text-dash-muted">Sin impresiones en este periodo.</p>
              ) : (
                <ul className="-mx-1.5 divide-y divide-dash-line">
                  {stats.topAds.map((ad) => (
                    <li key={ad.adId}>
                      <button
                        type="button"
                        onClick={() => setParams({ seccion: null, anuncio: ad.adId }, "push")}
                        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1.5 py-2 text-left text-sm transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                      >
                        <span className="min-w-0 truncate font-semibold text-dash-ink">{ad.title}</span>
                        <span className="shrink-0 tabular-nums text-dash-muted">
                          {count(ad.impressions)} · {count(ad.clicks)} clics · {formatCtr(ad.clicks, ad.impressions)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSectionCard>
          </div>
        </>
      )}
    </div>
  );
}
