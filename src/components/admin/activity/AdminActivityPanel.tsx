"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITY_STATUS_FILTERS,
  ACTIVITY_TYPE_FILTERS,
  activityApiTypes,
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const input = useMemo(
    () => ({
      types: activityApiTypes(typeSlug),
      onlyErrors,
      search: debouncedSearch.trim() || null,
    }),
    [typeSlug, onlyErrors, debouncedSearch],
  );
  const feed = useActivityFeed(input);

  return (
    <div className="flex flex-col gap-4" data-tour="admin-actividad">
      <div>
        <h2 className="text-lg font-semibold text-[#212121] dark:text-white">
          Actividad
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Lo que hacen las empresas en Kadesh, lo más reciente primero. Toca una
          empresa o persona para abrir su detalle.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar empresa, persona, categoría o mensaje"
        />
        <AdminFilterChips
          label="Tipo"
          options={ACTIVITY_TYPE_FILTERS}
          value={typeSlug}
          onChange={(value) => setParams({ tipo: value === "todo" ? null : value })}
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
        emptyTitle={onlyErrors ? "Sin errores con ese filtro" : "Sin actividad con ese filtro"}
        emptyDescription="Cambia el tipo o borra la búsqueda."
      />
    </div>
  );
}
