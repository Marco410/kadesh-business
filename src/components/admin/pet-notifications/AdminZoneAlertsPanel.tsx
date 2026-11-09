"use client";

import { useMemo, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapsLocation01Icon, Radar01Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  adminInputClass,
  formatPersonName,
  surfaceClass,
} from "../ui";
import {
  ADMIN_ZONE_ALERT_PREVIEW_QUERY,
  ADMIN_ZONE_ALERTS_QUERY,
  type AdminZoneAlertRow,
  type AdminZoneAlertsResponse,
  type AdminZonePreviewResponse,
} from "./queries";
import {
  ZONE_ALERTS_PAGE_SIZE,
  ZONE_STATUS_API,
  ZONE_STATUS_OPTIONS,
  ZONE_WHATSAPP,
  mapsUrl,
  parseLatLng,
  type ZoneStatusFilter,
} from "./constants";
import ZoneAlertEditorDrawer from "./ZoneAlertEditorDrawer";
import { adminErrorText } from "../errors";

const fmt = (value: number) => value.toLocaleString("es-MX");

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-xl border border-dash-line text-dash-soft transition-colors hover:border-orange-400 hover:text-orange-800 dark:hover:text-orange-300";

/** ¿Quién recibiría una alerta en un punto? Mismas reglas que la alerta real; no manda nada. */
function ZonePreview() {
  const [point, setPoint] = useState("");
  const [run, { data, loading, error, called }] = useLazyQuery<AdminZonePreviewResponse>(
    ADMIN_ZONE_ALERT_PREVIEW_QUERY,
    { fetchPolicy: "network-only" },
  );
  const parsed = parseLatLng(point);
  const preview = data?.adminZoneAlertPreview;

  return (
    <AdminSectionCard
      title="¿Quién recibiría una alerta aquí?"
      description="Pega un punto («latitud, longitud») o un enlace de Google Maps. No se manda nada."
      help="Mismas reglas que la alerta real: alertas encendidas, el punto dentro de su radio y cuentas activas. Quien ya llegó al tope del día no la recibiría hoy. En un reporte real tampoco le llega a quien lo publicó."
    >
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (parsed) void run({ variables: parsed });
        }}
      >
        <input
          value={point}
          onChange={(e) => setPoint(e.target.value)}
          placeholder="19.7027, -101.1923"
          aria-label="Punto"
          className={adminInputClass}
        />
        <AdminButton type="submit" variant="dark" icon={Radar01Icon} disabled={!parsed || loading}>
          {loading ? "Buscando…" : "Ver quién"}
        </AdminButton>
      </form>
      {point && !parsed ? (
        <p className="mt-2 text-xs text-red-700 dark:text-red-400">No reconocemos ese punto. Usa «latitud, longitud».</p>
      ) : null}

      {error ? (
        <div className="mt-4">
          <AdminErrorState message={adminErrorText(error, "No se pudo cargar esta sección. Intenta de nuevo.")} />
        </div>
      ) : called && preview ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-dash-soft">
            <span className="font-semibold text-dash-ink">{fmt(preview.wouldReceive)}</span>{" "}
            {preview.wouldReceive === 1 ? "persona recibiría" : "personas recibirían"} la alerta
            {preview.capped
              ? ` · ${fmt(preview.capped)} ya ${preview.capped === 1 ? "llegó" : "llegaron"} al tope de ${preview.maxPerDay} por día`
              : ""}
            .
          </p>
          {preview.items.length ? (
            <ul className="divide-y divide-dash-line rounded-2xl border border-dash-line">
              {preview.items.map((item) => {
                const whatsapp = ZONE_WHATSAPP[item.whatsapp];
                return (
                  <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-dash-ink">
                        {formatPersonName(item.name, item.lastName)}
                      </span>
                      <span className="block truncate text-xs text-dash-muted">
                        a {item.distanceKm} km · su radio {item.radiusKm ?? "—"} km
                        {item.email ? ` · ${item.email}` : ""}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {item.capped ? <AdminStatusBadge label="Tope del día" tone="warning" /> : null}
                      <AdminStatusBadge
                        label={item.pushDevices ? `App: ${item.pushDevices}` : "Sin app"}
                        tone={item.pushDevices ? "ok" : "neutral"}
                      />
                      <AdminStatusBadge label={whatsapp.label} tone={whatsapp.tone} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </AdminSectionCard>
  );
}

/**
 * Kadesh Pet → Alertas de zona: quién tiene alertas de mascotas perdidas o encontradas cerca, su
 * zona y radio, por qué canales le llegan (campana siempre; push si tiene la app; WhatsApp si lo
 * activó) y cuántas recibió. Desde aquí se apagan o encienden, se mueve la zona o el radio y se le
 * apaga el WhatsApp. Arriba, la vista previa de quién recibiría una alerta en un punto.
 */
export default function AdminZoneAlertsPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ZoneStatusFilter>("activas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminZoneAlertRow | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(
    () => ({
      search: debouncedSearch.trim() || null,
      status: ZONE_STATUS_API[status],
      take: ZONE_ALERTS_PAGE_SIZE,
      skip: (page - 1) * ZONE_ALERTS_PAGE_SIZE,
    }),
    [debouncedSearch, page, status],
  );
  const { data, loading, error, refetch } = useQuery<AdminZoneAlertsResponse>(ADMIN_ZONE_ALERTS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const zones = data?.adminZoneAlerts;
  const rows = zones?.items ?? [];
  const summary = zones?.summary;

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const onSaved = async () => {
    const { data: fresh } = await refetch();
    // El panel abierto se queda con los datos nuevos (o se cierra si ya no está en la lista).
    setSelected((current) => fresh?.adminZoneAlerts.items.find((row) => row.id === current?.id) ?? null);
  };

  return (
    <div className="flex flex-col gap-4">
      <ZoneAlertEditorDrawer row={selected} onClose={() => setSelected(null)} onSaved={() => void onSaved()} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatTile
          variant="dark"
          icon={MapsLocation01Icon}
          label="Con alertas activas"
          value={summary?.active ?? 0}
          hint={summary ? `${fmt(summary.inactive)} apagadas` : undefined}
          help="Alertas encendidas y con el centro de su zona elegido."
        />
        <AdminStatTile
          variant="tint"
          label="Con la app"
          value={summary?.withPush ?? 0}
          help="De las activas, cuántas tienen la app con notificaciones: les llega el push."
        />
        <AdminStatTile
          label="Con WhatsApp"
          value={summary?.withWhatsapp ?? 0}
          help="De las activas, cuántas activaron WhatsApp, tienen teléfono y no silenciaron las alertas de zona."
        />
        <AdminStatTile label="Alertas enviadas" value={summary?.alerts7d ?? 0} hint="Últimos 7 días" />
      </div>

      <ZonePreview />

      <AdminSearchInput value={search} onChange={resetPage(setSearch)} placeholder="Buscar por nombre, correo o teléfono" />
      <AdminFilterChips
        label="Alertas"
        options={ZONE_STATUS_OPTIONS.map((option) => ({
          ...option,
          count:
            option.value === "activas"
              ? summary?.active ?? null
              : option.value === "apagadas"
                ? summary?.inactive ?? null
                : summary
                  ? summary.active + summary.inactive
                  : null,
        }))}
        value={status}
        onChange={resetPage(setStatus)}
      />

      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudo cargar esta sección. Intenta de nuevo.")} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState title="Sin personas" description="Nadie con alertas de zona coincide con los filtros." />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const whatsapp = ZONE_WHATSAPP[row.whatsapp];
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <button type="button" onClick={() => setSelected(row)} className="min-w-0 flex-1 text-left">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-dash-ink">{formatPersonName(row.name, row.lastName)}</span>
                    <AdminStatusBadge label={row.enabled ? "Activas" : "Apagadas"} tone={row.enabled ? "ok" : "neutral"} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-dash-muted">
                    {[row.email, row.phone].filter(Boolean).join(" · ")}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-dash-faint">
                    {row.lat != null && row.lng != null ? `Radio ${row.radiusKm ?? "—"} km` : "Sin zona"} ·{" "}
                    {fmt(row.alerts30d)} {row.alerts30d === 1 ? "alerta" : "alertas"} en 30 días
                    {row.lastAlertAt ? ` · última ${formatDateShort(row.lastAlertAt, false)}` : ""}
                  </span>
                </button>
                <div className="flex flex-wrap gap-1.5">
                  <AdminStatusBadge
                    label={row.pushDevices ? `App: ${row.pushDevices}` : "Sin app"}
                    tone={row.pushDevices ? "ok" : "neutral"}
                  />
                  <AdminStatusBadge label={whatsapp.label} tone={whatsapp.tone} />
                </div>
                <div className="flex items-center gap-2">
                  {row.lat != null && row.lng != null ? (
                    <a
                      className={iconLink}
                      href={mapsUrl(row.lat, row.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver su zona en Google Maps"
                      title="Ver su zona en Google Maps"
                    >
                      <HugeiconsIcon icon={MapsLocation01Icon} size={18} />
                    </a>
                  ) : null}
                  <AdminButton variant="outline" size="sm" onClick={() => setSelected(row)}>
                    Administrar
                  </AdminButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination
        totalCount={zones?.total ?? 0}
        pageSize={ZONE_ALERTS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
