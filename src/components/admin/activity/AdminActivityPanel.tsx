"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  ACTIVITY_APP_FILTERS,
  ACTIVITY_STATUS_FILTERS,
  ACTIVITY_TYPE_FILTERS,
  activityApiTypes,
  activityAppValue,
  parseActivityAppSlug,
  parseActivityTypeSlug,
} from "../constants";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { AdminFilterChips, AdminSearchInput } from "../ui";
import ActivityTimeline from "./ActivityTimeline";
import { useActivityFeed } from "./useActivityFeed";

/**
 * Actividad de todas las empresas en una sola línea de tiempo: accesos, extracciones,
 * CRM, IA, créditos, pagos, WhatsApp y calendario. Reemplaza el concentrado de Sync.
 */
export default function AdminActivityPanel() {
  const { searchParams, setParams, openCompany, openPerson } = useAdminNavigation();
  const typeSlug = parseActivityTypeSlug(searchParams.get("tipo"));
  const onlyErrors = searchParams.get("error") === "1";
  const appSlug = parseActivityAppSlug(searchParams.get("app"));
  const ip = searchParams.get("ip")?.trim() || null;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const input = useMemo(
    () => ({
      types: activityApiTypes(typeSlug),
      onlyErrors,
      search: debouncedSearch.trim() || null,
      app: activityAppValue(appSlug),
      ip,
    }),
    [typeSlug, onlyErrors, debouncedSearch, appSlug, ip],
  );
  const feed = useActivityFeed(input);

  return (
    <div className="flex flex-col gap-4" data-tour="admin-actividad">
      <div>
        <h2 className="text-lg font-semibold text-dash-ink">
          Actividad
        </h2>
        <p className="mt-1 text-sm text-dash-muted">
          Lo que hacen las personas en Kadesh, lo más reciente primero. Toca una
          empresa o persona para abrir su detalle, o un evento para ver desde dónde pasó.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar empresa, persona, mensaje, IP o pantalla"
        />
        {ip ? (
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-[13px] font-semibold text-dash-muted">IP</span>
            <button
              type="button"
              onClick={() => setParams({ ip: null })}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-dash-ink bg-dash-ink px-4 text-sm font-medium tabular-nums text-dash-on-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 xl:h-[38px]"
              aria-label={`Quitar el filtro de la IP ${ip}`}
            >
              {ip}
              <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden />
            </button>
          </div>
        ) : null}
        <AdminFilterChips
          label="Tipo"
          options={ACTIVITY_TYPE_FILTERS}
          value={typeSlug}
          onChange={(value) => setParams({ tipo: value === "todo" ? null : value })}
        />
        <AdminFilterChips
          label="App"
          options={ACTIVITY_APP_FILTERS}
          value={appSlug}
          onChange={(value) => setParams({ app: value === "todas" ? null : value })}
        />
        <AdminFilterChips
          label="Estado"
          options={[...ACTIVITY_STATUS_FILTERS]}
          value={onlyErrors ? "errors" : "all"}
          onChange={(value) => setParams({ error: value === "errors" ? "1" : null })}
        />
      </div>

      <ActivityTimeline
        items={feed.items}
        loading={feed.loading}
        error={feed.error}
        hasMore={feed.hasMore}
        loadingMore={feed.loadingMore}
        onLoadMore={feed.loadMore}
        onOpenCompany={(companyId) => openCompany(companyId)}
        onOpenPerson={(userId, companyId) => openPerson(userId, companyId)}
        onFilterIp={(value) => setParams({ ip: value })}
        emptyTitle={onlyErrors ? "Sin errores con ese filtro" : "Sin actividad con ese filtro"}
        emptyDescription="Cambia el tipo o borra la búsqueda."
      />
    </div>
  );
}
