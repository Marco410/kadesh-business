"use client";

import { useQuery } from "@apollo/client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatCents } from "../store/constants";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  surfaceClass,
} from "../ui";
import AdminAdEditor from "./AdminAdEditor";
import {
  ADMIN_ADS_PAGE_SIZE,
  AD_KIND_LABELS,
  AD_KIND_OPTIONS,
  AD_NEW,
  AD_PAYMENT_STATUS_CLASS,
  AD_PAYMENT_STATUS_LABELS,
  AD_PLACEMENT_LABELS,
  AD_STATS_DAY_OPTIONS,
  AD_STATS_DEFAULT_DAYS,
  AD_STATUS_CLASS,
  AD_STATUS_LABELS,
  AD_STATUS_OPTIONS,
  adTone,
  formatCtr,
} from "./constants";
import { ADMIN_ADS_QUERY, type AdminAdsResponse } from "./queries";

const STATUS_FILTERS = [{ value: "", label: "Todos" }, ...AD_STATUS_OPTIONS];
const KIND_FILTERS = [{ value: "", label: "Todos" }, ...AD_KIND_OPTIONS.map(({ value, label }) => ({ value, label }))];

function period(start: string | null, end: string | null): string {
  if (!start && !end) return "Sin fechas";
  if (!end) return `Desde el ${formatDateShort(`${start}T12:00:00`)}`;
  if (!start) return `Hasta el ${formatDateShort(`${end}T12:00:00`)}`;
  return `${formatDateShort(`${start}T12:00:00`)} – ${formatDateShort(`${end}T12:00:00`)}`;
}

/**
 * Anuncios → lista: every ad with its status, payment and impressions and clicks of the period.
 * Filters and page live in the URL (`estado`, `tipo`, `q`, `pagina`, `dias`); the editor opens
 * with `?anuncio=`. One request per change; the list asks for 20 rows.
 */
export default function AdminAdsPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const status = searchParams.get("estado") ?? "";
  const kind = searchParams.get("tipo") ?? "";
  const page = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const days =
    AD_STATS_DAY_OPTIONS.find((option) => option.value === searchParams.get("dias"))?.value ?? String(AD_STATS_DEFAULT_DAYS);
  const editing = searchParams.get("anuncio");
  const search = useDebouncedValue(searchParams.get("q") ?? "", 300);

  const { data, loading, error, refetch } = useQuery<AdminAdsResponse>(ADMIN_ADS_QUERY, {
    variables: {
      take: ADMIN_ADS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_ADS_PAGE_SIZE,
      status: status || null,
      kind: kind || null,
      search: search.trim() || null,
      days: Number(days),
    },
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.adminAds.items ?? [];
  const total = data?.adminAds.total ?? 0;

  const closeEditor = () => setParams({ anuncio: null });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton icon={PlusSignIcon} onClick={() => setParams({ anuncio: AD_NEW }, "push")}>
          Nuevo anuncio
        </AdminButton>
        <div className="min-w-0 flex-1 basis-64">
          <AdminSearchInput
            value={searchParams.get("q") ?? ""}
            onChange={(value) => setParams({ q: value || null, pagina: null })}
            placeholder="Busca por título o anunciante"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <AdminFilterChips label="Estado" options={STATUS_FILTERS} value={status} onChange={(value) => setParams({ estado: value || null, pagina: null })} />
        <AdminFilterChips label="Tipo" options={KIND_FILTERS} value={kind} onChange={(value) => setParams({ tipo: value || null, pagina: null })} />
        <AdminFilterChips
          label="Números de"
          options={[...AD_STATS_DAY_OPTIONS]}
          value={days}
          onChange={(value) => setParams({ dias: value === String(AD_STATS_DEFAULT_DAYS) ? null : value })}
        />
      </div>

      {editing ? (
        <AdminAdEditor
          key={editing}
          adId={editing === AD_NEW ? null : editing}
          onClose={closeEditor}
          onSaved={() => {
            closeEditor();
            void refetch();
          }}
        />
      ) : null}

      {error && rows.length === 0 ? (
        <AdminErrorState message={adminErrorText(error, "No se pudieron cargar los anuncios. Intenta de nuevo.")} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title={status || kind || search ? "Sin anuncios con esos filtros" : "Todavía no hay anuncios"}
          description="Crea el primero: todos rotan en el mismo espacio y el peso reparte el tiempo."
        />
      ) : (
        <>
          <ul className={`${surfaceClass} divide-y divide-dash-line`}>
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setParams({ anuncio: row.id }, "push")}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-orange-500/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                  ) : (
                    <span className={`size-12 shrink-0 rounded-xl ${adTone(row.tone).card}`} style={adTone(row.tone).vars} aria-hidden />
                  )}
                  <span className="flex min-w-0 flex-1 basis-64 flex-col">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-dash-ink [overflow-wrap:anywhere]">{row.title}</span>
                      <AdminStatusBadge label={AD_STATUS_LABELS[row.status] ?? row.status} className={AD_STATUS_CLASS[row.status]} />
                      {row.kind !== "house" ? (
                        <AdminStatusBadge
                          label={AD_PAYMENT_STATUS_LABELS[row.paymentStatus] ?? row.paymentStatus}
                          className={AD_PAYMENT_STATUS_CLASS[row.paymentStatus]}
                        />
                      ) : null}
                    </span>
                    <span className="mt-0.5 text-xs text-dash-muted">
                      {AD_KIND_LABELS[row.kind] ?? row.kind}
                      {row.targetLabel ? ` · ${row.targetLabel}` : ""}
                      {row.advertiserName ? ` · ${row.advertiserName}` : ""}
                      {row.priceCents > 0 ? ` · ${formatCents(row.priceCents)}` : ""}
                    </span>
                    <span className="mt-0.5 text-xs text-dash-faint">
                      {period(row.startDate, row.endDate)} · {row.placements.map((placement) => AD_PLACEMENT_LABELS[placement] ?? placement).join(", ")}
                      {row.geoScope === "radius" ? ` · ${row.zoneLabel || "Por zona"}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-4 text-right text-sm tabular-nums">
                    <span className="flex flex-col">
                      <span className="font-semibold text-dash-ink">{row.impressions.toLocaleString("es-MX")}</span>
                      <span className="text-xs text-dash-faint">impresiones</span>
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold text-dash-ink">{row.clicks.toLocaleString("es-MX")}</span>
                      <span className="text-xs text-dash-faint">clics</span>
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold text-dash-ink">{formatCtr(row.clicks, row.impressions)}</span>
                      <span className="text-xs text-dash-faint">tasa</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <AdminPagination
            totalCount={total}
            pageSize={ADMIN_ADS_PAGE_SIZE}
            currentPage={page}
            onPageChange={(next) => setParams({ pagina: next > 1 ? String(next) : null })}
          />
        </>
      )}
    </div>
  );
}
