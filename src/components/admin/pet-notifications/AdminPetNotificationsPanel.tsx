"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { LinkSquare02Icon, Notification03Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { Routes } from "kadesh/core/routes";
import { ADMIN_TABS } from "../constants";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatTile,
  AdminStatusBadge,
  adminSelectClass,
  formatPersonName,
  surfaceClass,
} from "../ui";
import {
  ADMIN_NOTIFICATION_LOG_QUERY,
  type AdminNotificationLogResponse,
  type AdminNotificationRow,
} from "./queries";
import {
  CHANNEL_FILTER_API,
  CHANNEL_FILTER_OPTIONS,
  DAYS_FILTER_OPTIONS,
  NOTIFICATIONS_PAGE_SIZE,
  PUSH_STATUS,
  RESULT_FILTER_API,
  RESULT_FILTER_OPTIONS,
  WHATSAPP_STATUS,
  notificationTypeLabel,
  whatsappDetailLabel,
  type NotificationChannelFilter,
  type NotificationDaysFilter,
  type NotificationResultFilter,
} from "./constants";

const fmt = (value: number) => value.toLocaleString("es-MX");

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-xl border border-dash-line text-dash-soft transition-colors hover:border-orange-400 hover:text-orange-800 dark:hover:text-orange-300";

/** Dónde ver lo que originó el aviso: el animal o el evento en Operaciones, o la URL del aviso. */
function sourceHref(row: AdminNotificationRow): { href: string; internal: boolean } | null {
  if (row.entityType === "Animal" && row.entityId) {
    return {
      href: Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "animales", animal: row.entityId }),
      internal: true,
    };
  }
  if (row.entityType === "PetEvent" && row.entityId) {
    return {
      href: Routes.panelAdminTab(ADMIN_TABS.PET_PLACES, { vista: "eventos", evento: row.entityId }),
      internal: true,
    };
  }
  return row.url ? { href: row.url, internal: !/^https?:/i.test(row.url) } : null;
}

function DeliveryBadges({ row }: { row: AdminNotificationRow }) {
  const push = row.pushStatus ? PUSH_STATUS[row.pushStatus] : null;
  const whatsapp = row.whatsappStatus ? WHATSAPP_STATUS[row.whatsappStatus] : null;
  const detail = whatsappDetailLabel(row.whatsappStatus, row.whatsappDetail);
  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        <AdminStatusBadge label={row.readAt ? "Campana: leída" : "Campana: sin leer"} tone={row.readAt ? "ok" : "neutral"} />
        {push ? (
          <AdminStatusBadge
            label={row.pushDevices ? `${push.label} · ${row.pushDevices} disp.` : push.label}
            tone={push.tone}
          />
        ) : null}
        {whatsapp ? <AdminStatusBadge label={whatsapp.label} tone={whatsapp.tone} /> : null}
      </div>
      {detail ? (
        <span className="max-w-xs text-xs text-dash-muted sm:text-right [overflow-wrap:anywhere]">
          {row.whatsappStatus === "failed" ? "Meta: " : "Porque "}
          {detail}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Kadesh Pet → Avisos: cada aviso (una fila por persona) y a dónde se fue: campana (leída o no),
 * push a la app (cuántos dispositivos) y WhatsApp (no se mandó y por qué, aceptado, entregado,
 * leído o falló con el error de Meta). `?persona=` llega con la búsqueda puesta (desde Alertas
 * de zona).
 */
export default function AdminPetNotificationsPanel() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("persona") ?? "");
  const [channel, setChannel] = useState<NotificationChannelFilter>("todos");
  const [result, setResult] = useState<NotificationResultFilter>("todos");
  const [days, setDays] = useState<NotificationDaysFilter>("7");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(
    () => ({
      product: "pet",
      type: type || null,
      channel: CHANNEL_FILTER_API[channel],
      result: RESULT_FILTER_API[result],
      search: debouncedSearch.trim() || null,
      days: Number(days),
      take: NOTIFICATIONS_PAGE_SIZE,
      skip: (page - 1) * NOTIFICATIONS_PAGE_SIZE,
    }),
    [channel, days, debouncedSearch, page, result, type],
  );

  const { data, loading, error } = useQuery<AdminNotificationLogResponse>(ADMIN_NOTIFICATION_LOG_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const log = data?.adminNotificationLog;
  const rows = log?.items ?? [];
  const summary = log?.summary;

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatTile
          variant="dark"
          icon={Notification03Icon}
          label="Avisos"
          value={summary?.total ?? 0}
          hint={summary ? `${fmt(summary.read)} leídos en la campana` : undefined}
          help="Una fila por persona: un aviso a 10 personas cuenta 10. Según el periodo, el tipo y la búsqueda."
        />
        <AdminStatTile
          variant="tint"
          label="Push enviados"
          value={summary?.pushSent ?? 0}
          hint={summary ? `${fmt(summary.pushNoDevices)} sin app` : undefined}
          help="Expo aceptó el push para al menos uno de sus dispositivos. «Sin app»: no tiene la app con notificaciones."
        />
        <AdminStatTile
          label="WhatsApp entregados"
          value={summary?.whatsappDelivered ?? 0}
          hint={
            summary
              ? `${fmt(summary.whatsappPending)} esperando a Meta · ${fmt(summary.whatsappSkipped)} no se mandaron`
              : undefined
          }
          help="Enviados, entregados o leídos según los acuses de Meta. «No se mandaron»: sin opt-in, sin teléfono o silenciado."
        />
        <AdminStatTile
          label="Fallidos"
          value={(summary?.pushFailed ?? 0) + (summary?.whatsappFailed ?? 0)}
          tone={(summary?.pushFailed ?? 0) + (summary?.whatsappFailed ?? 0) > 0 ? "danger" : "default"}
          hint={summary ? `${fmt(summary.pushFailed)} push · ${fmt(summary.whatsappFailed)} WhatsApp` : undefined}
        />
      </div>

      <AdminSearchInput
        value={search}
        onChange={resetPage(setSearch)}
        placeholder="Buscar por nombre, correo o teléfono de quien lo recibió"
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <AdminFilterChips label="Canal" options={CHANNEL_FILTER_OPTIONS} value={channel} onChange={resetPage(setChannel)} />
          <AdminFilterChips label="Resultado" options={RESULT_FILTER_OPTIONS} value={result} onChange={resetPage(setResult)} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={type}
            onChange={(e) => resetPage(setType)(e.target.value)}
            aria-label="Tipo de aviso"
            className={adminSelectClass}
          >
            <option value="">Todos los tipos</option>
            {(log?.types ?? []).map((option) => (
              <option key={option.key} value={option.key}>
                {notificationTypeLabel(option.key)} ({fmt(option.count)})
              </option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => resetPage(setDays)(e.target.value as NotificationDaysFilter)}
            aria-label="Periodo"
            className={adminSelectClass}
          >
            {DAYS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Últimos {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState title="Sin avisos" description="Ningún aviso coincide con los filtros en este periodo." />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const source = sourceHref(row);
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-dash-ink">{row.title}</span>
                    <AdminStatusBadge label={notificationTypeLabel(row.type)} tone="accent" />
                  </div>
                  {row.body ? <p className="mt-0.5 text-sm text-dash-soft [overflow-wrap:anywhere]">{row.body}</p> : null}
                  <p className="mt-1 text-xs text-dash-muted">
                    Para{" "}
                    <span className="font-medium text-dash-soft">
                      {row.recipient ? formatPersonName(row.recipient.name, row.recipient.lastName) : "(cuenta borrada)"}
                    </span>
                    {row.recipient?.email ? ` · ${row.recipient.email}` : ""}
                    {row.recipientPhone ? ` · ${row.recipientPhone}` : ""} · {formatDateShort(row.createdAt)}
                  </p>
                </div>
                <DeliveryBadges row={row} />
                {source ? (
                  source.internal ? (
                    <Link className={iconLink} href={source.href} aria-label="Ver qué lo originó" title="Ver qué lo originó">
                      <HugeiconsIcon icon={LinkSquare02Icon} size={18} />
                    </Link>
                  ) : (
                    <a
                      className={iconLink}
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir el enlace del aviso"
                      title="Abrir el enlace del aviso"
                    >
                      <HugeiconsIcon icon={LinkSquare02Icon} size={18} />
                    </a>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination
        totalCount={log?.total ?? 0}
        pageSize={NOTIFICATIONS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
