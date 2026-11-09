"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bone01Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HBarList, cssStaggerDelay } from "kadesh/components/app-shell";
import { cn } from "kadesh/utils/cn";
import {
  ADMIN_TABS,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_CLAIM_STATUS_LABELS,
  PET_PLACE_TYPE_OPTIONS,
} from "../../constants";
import { useAdminNavigation } from "../../hooks/useAdminNavigation";
import {
  AdminErrorState,
  AdminFilterChips,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
} from "../../ui";
import ViewGuide from "../../analytics/ViewGuide";
import {
  ANIMAL_STATUS_BAR_CLASS,
  ANIMAL_STATUS_CHART_ORDER,
  ANIMAL_STATUS_CLASS,
  ANIMAL_STATUS_DEFAULT_CLASS,
  ANIMAL_STATUS_NONE,
  ANIMAL_TYPE_LABELS,
  REPORTED_BY_LABELS,
  animalStatusLabel,
} from "../../animals/constants";
import { PET_VISTAS } from "../constants";
import {
  ADMIN_PET_EVENTS_PENDING_COUNT_QUERY,
  type AdminPetEventsPendingCountResponse,
} from "../../events/queries";
import {
  ANIMAL_HOME_STATUSES,
  ANIMAL_ORIGIN_BAR_CLASS,
  ANIMAL_ORIGIN_LABELS,
  ANIMAL_ORIGIN_ORDER,
  PET_BREAKDOWN_OPTIONS,
  PET_DEFAULT_GRANULARITY,
  PET_DEFAULT_RANGE,
  PET_LOCATION_OPTIONS,
  PET_PLACE_METRIC_OPTIONS,
  PET_RANGE_OPTIONS,
  changePct,
  findOption,
  granularityOptionsFor,
  type PetRangeOption,
} from "./constants";
import { PET_HELP } from "./help";
import PetSeriesCard from "./PetSeriesCard";
import type { SeriesSegmentStyle } from "./StackedSeriesBars";
import {
  ADMIN_PET_SERIES_QUERY,
  ADMIN_PET_SUMMARY_QUERY,
  type AdminPetSeriesResponse,
  type AdminPetSummary,
  type AdminPetSummaryResponse,
  type PetCount,
} from "./queries";
import { adminErrorText } from "kadesh/components/admin/errors";

const fmt = (value: number) => value.toLocaleString("es-MX");

const selectClass =
  "h-11 sm:h-9 cursor-pointer rounded-lg border border-dash-line bg-dash-surface px-3 text-[13px] text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const STATUS_SEGMENTS: SeriesSegmentStyle = {
  order: ANIMAL_STATUS_CHART_ORDER,
  label: animalStatusLabel,
  barClass: (key) => ANIMAL_STATUS_BAR_CLASS[key] ?? ANIMAL_STATUS_BAR_CLASS[ANIMAL_STATUS_NONE],
};

const ORIGIN_SEGMENTS: SeriesSegmentStyle = {
  order: ANIMAL_ORIGIN_ORDER,
  label: (key) => ANIMAL_ORIGIN_LABELS[key] ?? key,
  barClass: (key) => ANIMAL_ORIGIN_BAR_CLASS[key] ?? ANIMAL_STATUS_BAR_CLASS[ANIMAL_STATUS_NONE],
};

const CLAIM_ORDER = [
  PET_PLACE_CLAIM_STATUS.PENDING,
  PET_PLACE_CLAIM_STATUS.VERIFIED,
  PET_PLACE_CLAIM_STATUS.UNCLAIMED,
  PET_PLACE_CLAIM_STATUS.REJECTED,
];

const CLAIM_BAR_CLASS: Record<string, string> = {
  [PET_PLACE_CLAIM_STATUS.PENDING]: "bg-amber-500 dark:bg-amber-400",
  [PET_PLACE_CLAIM_STATUS.VERIFIED]: "bg-emerald-500 dark:bg-emerald-400",
  [PET_PLACE_CLAIM_STATUS.UNCLAIMED]: "bg-[#9e9e9e] dark:bg-[#757575]",
  [PET_PLACE_CLAIM_STATUS.REJECTED]: "bg-red-500 dark:bg-red-400",
};

const REPORTED_BY_BAR_CLASS: Record<string, string> = {
  owner: "bg-sky-500 dark:bg-sky-400",
  volunteer: "bg-amber-500 dark:bg-amber-400",
};

const PLACE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PET_PLACE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

function countOf(items: PetCount[], key: string): number {
  return items.find((item) => item.key === key)?.count ?? 0;
}

// ---------------------------------------------------------------------------------------------
// Piezas pequeñas

function PetGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div>
        <h2 className="text-lg font-semibold text-dash-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TilesSkeleton({ count, className }: { count: number; className: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="dash-shimmer h-[132px] rounded-3xl" />
      ))}
    </div>
  );
}

/** Pastilla ↗/↘ contra el periodo anterior del mismo largo (sin rango "Todo" no hay con qué comparar). */
function periodDelta(range: PetRangeOption, current: number, previous: number) {
  if (range.days == null) return null;
  const pct = changePct(current, previous);
  if (pct == null) return null;
  return { value: pct, label: `Contra ${fmt(previous)} del periodo anterior` };
}

/** "+12 en 90 días" bajo un total. Con "Todo" no se repite el total. */
function newInPeriodText(range: PetRangeOption, current: number) {
  if (range.days == null) return undefined;
  return `+${fmt(current)} en ${range.label}`;
}

type ColorBarItem = {
  key: string;
  label: string;
  count: number;
  barClass: string;
  /** Si se puede tocar para abrir la lista filtrada. */
  selectable?: boolean;
};

/** Barras horizontales con el color de cada estatus. Las filas tocables abren la lista filtrada. */
function ColorBars({
  items,
  onSelect,
  ariaLabel,
}: {
  items: ColorBarItem[];
  onSelect?: (key: string) => void;
  ariaLabel: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <ul className="-mx-1.5 space-y-0.5" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const clickable = Boolean(onSelect && item.selectable && item.count > 0);
        const content = (
          <>
            <span
              className={cn(
                "flex min-w-0 items-center gap-1.5 truncate text-sm",
                item.count > 0 ? "text-dash-ink" : "text-dash-faint",
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", item.barClass)} aria-hidden />
              {item.label}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-dash-surface-2">
              {item.count > 0 ? (
                <span
                  className={cn("block h-full rounded-full dashboard-bar-grow", item.barClass)}
                  style={{
                    width: `${Math.max((item.count / max) * 100, 3)}%`,
                    animationDelay: cssStaggerDelay(index),
                  }}
                />
              ) : null}
            </span>
            <span className="text-right text-sm tabular-nums text-dash-ink">
              {fmt(item.count)}
              <span className="ml-1 text-xs text-dash-faint">{share}%</span>
            </span>
          </>
        );
        const rowClass =
          "grid w-full grid-cols-[7.5rem_1fr_4.75rem] items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left sm:grid-cols-[9rem_1fr_5rem]";
        return (
          <li key={item.key}>
            {clickable ? (
              <button
                type="button"
                onClick={() => onSelect?.(item.key)}
                title={`Ver ${item.label.toLowerCase()} en la lista`}
                className={cn(
                  rowClass,
                  "cursor-pointer transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                )}
              >
                {content}
              </button>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Una barra partida en dos o tres (p. ej. usuarios vs admin) con su leyenda. */
function SplitBar({ title, items }: { title: string; items: ColorBarItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-dash-muted">{title}</p>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-dash-surface-2">
        {total > 0
          ? items
              .filter((item) => item.count > 0)
              .map((item) => (
                <div
                  key={item.key}
                  className={cn("h-full", item.barClass)}
                  style={{ width: `${(item.count / total) * 100}%` }}
                  title={`${item.label}: ${fmt(item.count)}`}
                />
              ))
          : null}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5 text-xs text-dash-muted">
            <span className={cn("size-2.5 shrink-0 rounded-full", item.barClass)} aria-hidden />
            {item.label}
            <span className="tabular-nums text-dash-ink">{fmt(item.count)}</span>
            <span className="tabular-nums text-dash-faint">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Tarjetas que dependen del resumen

function LocationCard({ animals }: { animals: AdminPetSummary["animals"] }) {
  const [view, setView] = useState<(typeof PET_LOCATION_OPTIONS)[number]["value"]>("estados");
  const rows = view === "estados" ? animals.topStates : animals.topCities;
  return (
    <AdminSectionCard
      title="Dónde se reportan"
      help={PET_HELP.location}
      action={<AdminFilterChips options={[...PET_LOCATION_OPTIONS]} value={view} onChange={setView} />}
    >
      <HBarList
        items={rows.map((row) => ({ key: row.key, label: row.key, count: row.count }))}
        emptyLabel="Todavía no hay ubicaciones en la bitácora."
      />
    </AdminSectionCard>
  );
}

function EngagementCard({
  engagement,
  range,
  onOpenAnimal,
}: {
  engagement: AdminPetSummary["engagement"];
  range: PetRangeOption;
  onOpenAnimal: (id: string) => void;
}) {
  const period = range.days == null ? "Desde el inicio" : `Últimos ${range.label}`;
  return (
    <AdminSectionCard title="Interacción" description={period} help={PET_HELP.engagement}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AdminStatTile label="Vistas" value={fmt(engagement.views)} />
        <AdminStatTile label="Con sesión" value={fmt(engagement.viewsSignedIn)} />
        <AdminStatTile label="Favoritos" value={fmt(engagement.favorites)} />
        <AdminStatTile label="Comentarios" value={fmt(engagement.comments)} />
      </div>
      <h4 className="mb-1 mt-4 text-xs font-medium uppercase tracking-wide text-dash-faint">Más vistos</h4>
      {engagement.topViewed.length === 0 ? (
        <p className="text-sm text-dash-muted">Nadie abrió fichas de animales en este periodo.</p>
      ) : (
        <ul className="-mx-1.5 divide-y divide-dash-line">
          {engagement.topViewed.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                onClick={() => onOpenAnimal(animal.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {animal.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={animal.coverUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" loading="lazy" />
                ) : (
                  <span className="size-10 shrink-0 rounded-lg bg-dash-surface-2" />
                )}
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="truncate text-sm font-semibold text-dash-ink">{animal.name}</span>
                  {animal.status && animal.status !== ANIMAL_STATUS_NONE ? (
                    <AdminStatusBadge
                      label={animalStatusLabel(animal.status)}
                      className={cn(
                        "px-2 py-0.5",
                        ANIMAL_STATUS_CLASS[animal.status] ?? ANIMAL_STATUS_DEFAULT_CLASS,
                      )}
                    />
                  ) : null}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm tabular-nums text-dash-muted">
                  <HugeiconsIcon icon={EyeIcon} size={16} aria-hidden />
                  {fmt(animal.views)}
                  <span className="sr-only">vistas</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminSectionCard>
  );
}

// ---------------------------------------------------------------------------------------------

/**
 * Kadesh Pet → Resumen: cuántos animales hay y en qué estatus, cómo crecen los registros,
 * veterinarias del directorio, cuentas de Pet y lo que espera revisión. Periodo y agrupación
 * viven en la URL (`rango`, `agrupar`) y aplican a todo; cada gráfica tiene además su desglose
 * o métrica (`desglose`, `metrica`, `tipo_lugar`).
 */
export default function AdminPetOverview() {
  const { searchParams, setParams, goTo } = useAdminNavigation();

  const range = findOption(PET_RANGE_OPTIONS, searchParams.get("rango"), PET_DEFAULT_RANGE);
  const granularityOptions = granularityOptionsFor(range);
  const granularity = findOption(granularityOptions, searchParams.get("agrupar"), PET_DEFAULT_GRANULARITY);
  const breakdown = findOption(PET_BREAKDOWN_OPTIONS, searchParams.get("desglose"), "total");
  const placeMetric = findOption(PET_PLACE_METRIC_OPTIONS, searchParams.get("metrica"), "altas");
  const placeType =
    PET_PLACE_TYPE_OPTIONS.find((option) => option.value === searchParams.get("tipo_lugar"))?.value ?? null;

  const { data, loading, error } = useQuery<AdminPetSummaryResponse>(ADMIN_PET_SUMMARY_QUERY, {
    variables: { input: { days: range.days } },
    fetchPolicy: "cache-and-network",
  });
  const summary = data?.adminPetSummary;

  // Línea del KPI "Registrados": misma serie que la gráfica sin desglose (sale de caché si coincide).
  const { data: sparkData } = useQuery<AdminPetSeriesResponse>(ADMIN_PET_SERIES_QUERY, {
    variables: {
      input: { metric: "animals", granularity: granularity.api, range: range.api, breakdown: "none", placeType: null },
    },
    fetchPolicy: "cache-and-network",
  });
  const sparkline = sparkData?.adminPetSeries.points.map((point) => point.total) ?? null;

  // Eventos por revisar: no viene en `adminPetSummary`, se cuenta aparte.
  const { data: eventsData } = useQuery<AdminPetEventsPendingCountResponse>(ADMIN_PET_EVENTS_PENDING_COUNT_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const pendingEvents = eventsData?.pendingEvents ?? null;

  const changeRange = (value: string) => {
    const next = findOption(PET_RANGE_OPTIONS, value, PET_DEFAULT_RANGE);
    // Si "Día" ya no cabe en el rango nuevo, se regresa a la agrupación por defecto.
    const keepGranularity = granularityOptionsFor(next).some((option) => option.value === granularity.value);
    setParams({
      rango: next.value === PET_DEFAULT_RANGE ? null : next.value,
      agrupar: keepGranularity && granularity.value !== PET_DEFAULT_GRANULARITY ? granularity.value : null,
    });
  };

  const openPetList = (vista: string, params: Record<string, string> = {}) =>
    goTo(ADMIN_TABS.PET_PLACES, { vista, ...params });
  const openAnimals = (params: Record<string, string> = {}) => openPetList(PET_VISTAS.ANIMALS, params);

  const animals = summary?.animals;
  const places = summary?.places;
  const pending = summary?.pending;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <ViewGuide note="Los días van en hora de Ciudad de México.">
          Cómo va Kadesh Pet: animales registrados y en qué estatus están, veterinarias del directorio y
          cuentas nuevas. El estatus de cada animal es el de su registro más reciente en la bitácora. Los
          reportes repetidos que se unieron a otro no cuentan
          {animals?.duplicatesMerged ? ` (${fmt(animals.duplicatesMerged)})` : ""}. Toca un número o un
          estatus para abrir la lista ya filtrada.
        </ViewGuide>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
          <AdminFilterChips label="Periodo" options={PET_RANGE_OPTIONS} value={range.value} onChange={changeRange} />
          <AdminFilterChips
            label="Agrupar"
            options={granularityOptions}
            value={granularity.value}
            onChange={(value) => setParams({ agrupar: value === PET_DEFAULT_GRANULARITY ? null : value })}
          />
        </div>

        {error && !summary ? <AdminErrorState message={adminErrorText(error, "No se pudo cargar esta sección. Intenta de nuevo.")} /> : null}
      </div>

      <PetGroup title="Pendientes por revisar" description="Lo que espera una respuesta de Kadesh.">
        {pending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <AdminStatTile
              label="Fichas en revisión"
              value={fmt(pending.placeClaims)}
              hint="Reclamos de veterinarias"
              help={PET_HELP.placeClaims}
              tone={pending.placeClaims > 0 ? "warning" : "default"}
              onClick={() => openPetList(PET_VISTAS.PLACES, { estado: PET_PLACE_CLAIM_STATUS.PENDING })}
            />
            <AdminStatTile
              label="Servicios por aprobar"
              value={fmt(pending.services)}
              hint="Pedidos por veterinarias"
              help={PET_HELP.services}
              tone={pending.services > 0 ? "warning" : "default"}
              onClick={() => openPetList(PET_VISTAS.SERVICES)}
            />
            <AdminStatTile
              label="Eventos por revisar"
              value={pendingEvents == null ? "—" : fmt(pendingEvents)}
              hint="Campañas y jornadas"
              help={PET_HELP.events}
              tone={pendingEvents ? "warning" : "default"}
              onClick={() => openPetList(PET_VISTAS.EVENTS)}
            />
            <AdminStatTile
              label="Sin publicar en Facebook"
              value={fmt(pending.facebookPending)}
              hint="Animales"
              help={PET_HELP.facebookPending}
              onClick={() => openAnimals({ facebook: "pendiente" })}
            />
            <AdminStatTile
              label="Reclamos de animales"
              value={fmt(pending.animalClaims)}
              hint="Se resuelven en Kadesh Pet"
              help={PET_HELP.animalClaims}
              tone={pending.animalClaims > 0 ? "warning" : "default"}
            />
          </div>
        ) : (
          <TilesSkeleton count={5} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" />
        )}
      </PetGroup>

      <PetGroup title="Animales" description="Reportes de animales perdidos, encontrados y en adopción.">
        {animals ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
            <AdminStatTile
              variant="dark"
              icon={Bone01Icon}
              label="Registrados"
              value={animals.total}
              sparkline={sparkline}
              hint={newInPeriodText(range, animals.newInPeriod)}
              delta={periodDelta(range, animals.newInPeriod, animals.newPrevPeriod)}
              help={PET_HELP.animalsTotal}
              onClick={() => openAnimals()}
            />
            <AdminStatTile
              variant="tint"
              label="Perdidos"
              value={countOf(animals.byStatus, "lost")}
              help={PET_HELP.lost}
              onClick={() => openAnimals({ estado: "lost" })}
            />
            <AdminStatTile
              label="Encontrados"
              value={fmt(countOf(animals.byStatus, "found"))}
              help={PET_HELP.found}
              onClick={() => openAnimals({ estado: "found" })}
            />
            <AdminStatTile
              label="En adopción"
              value={fmt(countOf(animals.byStatus, "in_adoption"))}
              help={PET_HELP.inAdoption}
              onClick={() => openAnimals({ estado: "in_adoption" })}
            />
            <AdminStatTile
              label="De vuelta en casa"
              value={fmt(ANIMAL_HOME_STATUSES.reduce((sum, key) => sum + countOf(animals.byStatus, key), 0))}
              hint={`${fmt(countOf(animals.byStatus, "in_family"))} en familia · ${fmt(countOf(animals.byStatus, "adopted"))} adoptados`}
              help={PET_HELP.home}
              tone="success"
            />
            <AdminStatTile
              label="En Facebook"
              value={fmt(animals.facebookPublished)}
              hint={`${fmt(animals.facebookPending)} sin publicar`}
              help={PET_HELP.facebook}
              onClick={() => openAnimals({ facebook: "publicado" })}
            />
          </div>
        ) : (
          <TilesSkeleton count={6} className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6" />
        )}

        <PetSeriesCard
          title="Animales registrados"
          help={PET_HELP.animalsSeries}
          metric="animals"
          breakdown={breakdown.api}
          range={range}
          granularity={granularity.api}
          unitLabel="animales"
          segments={breakdown.api === "status" ? STATUS_SEGMENTS : breakdown.api === "origin" ? ORIGIN_SEGMENTS : null}
          controls={
            <AdminFilterChips
              label="Desglose"
              options={PET_BREAKDOWN_OPTIONS}
              value={breakdown.value}
              onChange={(value) => setParams({ desglose: value === "total" ? null : value })}
            />
          }
        />

        {animals ? (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
              <AdminSectionCard
                title="Estatus actual"
                description="Toca un estatus para ver esos animales."
                help={PET_HELP.byStatus}
              >
                <ColorBars
                  ariaLabel="Animales por estatus actual"
                  items={ANIMAL_STATUS_CHART_ORDER.map((key) => ({
                    key,
                    label: animalStatusLabel(key),
                    count: countOf(animals.byStatus, key),
                    barClass: ANIMAL_STATUS_BAR_CLASS[key] ?? ANIMAL_STATUS_BAR_CLASS[ANIMAL_STATUS_NONE],
                    selectable: key !== ANIMAL_STATUS_NONE,
                  }))}
                  onSelect={(key) => openAnimals({ estado: key })}
                />
              </AdminSectionCard>

              <AdminSectionCard title="Tipo y origen" help={PET_HELP.typeAndOrigin}>
                <HBarList
                  items={animals.byType.map((row) => ({
                    key: row.key,
                    label: row.key === "none" ? "Sin tipo" : (ANIMAL_TYPE_LABELS[row.key] ?? row.key),
                    count: row.count,
                  }))}
                  emptyLabel="Todavía no hay animales registrados."
                />
                <div className="mt-5 flex flex-col gap-4">
                  <SplitBar
                    title="Quién lo publicó"
                    items={ANIMAL_ORIGIN_ORDER.map((key) => ({
                      key,
                      label: ANIMAL_ORIGIN_LABELS[key],
                      count: countOf(animals.byOrigin, key),
                      barClass: ANIMAL_ORIGIN_BAR_CLASS[key],
                    }))}
                  />
                  <SplitBar
                    title="Quién lo reporta"
                    items={[
                      ...["owner", "volunteer"].map((key) => ({
                        key,
                        label: REPORTED_BY_LABELS[key],
                        count: countOf(animals.byReportedBy, key),
                        barClass: REPORTED_BY_BAR_CLASS[key],
                      })),
                      ...(countOf(animals.byReportedBy, "none") > 0
                        ? [
                            {
                              key: "none",
                              label: "Sin dato",
                              count: countOf(animals.byReportedBy, "none"),
                              barClass: ANIMAL_STATUS_BAR_CLASS[ANIMAL_STATUS_NONE],
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </AdminSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
              <LocationCard animals={animals} />
              {summary ? (
                <EngagementCard
                  engagement={summary.engagement}
                  range={range}
                  onOpenAnimal={(id) => openAnimals({ animal: id })}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </PetGroup>

      <PetGroup title="Veterinarias" description="Fichas del directorio de Kadesh Pet.">
        {places ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
            <AdminStatTile
              label="Fichas"
              value={fmt(places.total)}
              hint={newInPeriodText(range, places.newInPeriod)}
              delta={periodDelta(range, places.newInPeriod, places.newPrevPeriod)}
              help={PET_HELP.placesTotal}
              onClick={() => openPetList(PET_VISTAS.PLACES)}
            />
            <AdminStatTile label="Veterinarias" value={fmt(places.veterinaries)} help={PET_HELP.veterinaries} />
            <AdminStatTile
              label="Verificadas"
              value={fmt(places.verified)}
              help={PET_HELP.verified}
              onClick={() => openPetList(PET_VISTAS.PLACES, { estado: PET_PLACE_CLAIM_STATUS.VERIFIED })}
            />
            <AdminStatTile
              label="En revisión"
              value={fmt(pending?.placeClaims ?? 0)}
              help={PET_HELP.placesPending}
              tone={(pending?.placeClaims ?? 0) > 0 ? "warning" : "default"}
              onClick={() => openPetList(PET_VISTAS.PLACES, { estado: PET_PLACE_CLAIM_STATUS.PENDING })}
            />
            <AdminStatTile label="Desde Google" value={fmt(places.fromGoogle)} help={PET_HELP.fromGoogle} />
            <AdminStatTile
              label="Reseñas"
              value={fmt(places.reviews)}
              hint={`${fmt(places.likes)} me gusta`}
              help={PET_HELP.reviews}
            />
          </div>
        ) : (
          <TilesSkeleton count={6} className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6" />
        )}

        <PetSeriesCard
          title="Veterinarias en el tiempo"
          help={PET_HELP.placesSeries}
          metric={placeMetric.api}
          placeType={placeType}
          range={range}
          granularity={granularity.api}
          unitLabel={placeMetric.unit}
          controls={
            <>
              <AdminFilterChips
                label="Métrica"
                options={PET_PLACE_METRIC_OPTIONS}
                value={placeMetric.value}
                onChange={(value) => setParams({ metrica: value === "altas" ? null : value })}
              />
              <select
                value={placeType ?? ""}
                onChange={(event) => setParams({ tipo_lugar: event.target.value || null })}
                aria-label="Tipo de lugar"
                className={selectClass}
              >
                <option value="">Todos los tipos</option>
                {PET_PLACE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          }
        />

        {places ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
            <AdminSectionCard
              title="Estado del reclamo"
              description="Toca un estado para ver esas fichas."
              help={PET_HELP.claimStatus}
            >
              <ColorBars
                ariaLabel="Fichas por estado del reclamo"
                items={CLAIM_ORDER.map((key) => ({
                  key,
                  label: PET_PLACE_CLAIM_STATUS_LABELS[key] ?? key,
                  count: countOf(places.byClaimStatus, key),
                  barClass: CLAIM_BAR_CLASS[key],
                  selectable: true,
                }))}
                onSelect={(key) => openPetList(PET_VISTAS.PLACES, { estado: key })}
              />
            </AdminSectionCard>

            <AdminSectionCard title="Tipos y estados" help={PET_HELP.placeTypes}>
              <HBarList
                items={places.byType.map((row) => ({
                  key: row.key,
                  label: PLACE_TYPE_LABELS[row.key] ?? row.key,
                  count: row.count,
                }))}
                emptyLabel="Todavía no hay fichas con tipo."
              />
              <h4 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-dash-faint">
                Estados con más fichas
              </h4>
              <HBarList
                items={places.topStates.map((row) => ({ key: row.key, label: row.key, count: row.count }))}
                emptyLabel="Las fichas todavía no tienen estado."
              />
            </AdminSectionCard>
          </div>
        ) : null}
      </PetGroup>

      <PetGroup title="Usuarios de Kadesh Pet" description="Cuentas creadas en Kadesh Pet.">
        {summary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
            <AdminStatTile label="Cuentas" value={fmt(summary.users.total)} help={PET_HELP.usersTotal} />
            {range.days != null ? (
              <AdminStatTile
                label={`Nuevas en ${range.label}`}
                value={fmt(summary.users.newInPeriod)}
                hint={`Antes: ${fmt(summary.users.newPrevPeriod)}`}
                delta={periodDelta(range, summary.users.newInPeriod, summary.users.newPrevPeriod)}
              />
            ) : null}
          </div>
        ) : (
          <TilesSkeleton count={2} className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6" />
        )}

        <PetSeriesCard
          title="Cuentas nuevas"
          help={PET_HELP.usersSeries}
          metric="pet_users"
          range={range}
          granularity={granularity.api}
          unitLabel="cuentas"
        />
      </PetGroup>

      {loading && summary ? (
        <span className="sr-only" aria-live="polite">
          Actualizando cifras
        </span>
      ) : null}
    </div>
  );
}
