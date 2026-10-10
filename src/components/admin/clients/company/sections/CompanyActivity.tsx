"use client";

import { useMemo } from "react";
import ActivityTimeline from "../../../activity/ActivityTimeline";
import { useActivityFeed } from "../../../activity/useActivityFeed";
import {
  ACTIVITY_STATUS_FILTERS,
  ACTIVITY_TYPE_FILTERS,
  activityApiTypes,
  parseActivityTypeSlug,
} from "../../../constants";
import { useAdminNavigation } from "../../../hooks/useAdminNavigation";
import { AdminFilterChips, formatPersonName } from "../../../ui";
import type { AdminCompanyMember } from "../../clients-queries";

/**
 * Línea de tiempo de una empresa. La persona en foco (`persona`) es el mismo filtro
 * por persona: elegir a alguien aquí también lo pone en foco en el 360.
 */
export default function CompanyActivity({
  companyId,
  members,
}: {
  companyId: string;
  members: AdminCompanyMember[];
}) {
  const { searchParams, setParams } = useAdminNavigation();
  const personaId = searchParams.get("persona");
  const typeSlug = parseActivityTypeSlug(searchParams.get("tipo"));
  const onlyErrors = searchParams.get("error") === "1";

  const input = useMemo(
    () => ({
      companyId,
      userId: personaId,
      types: activityApiTypes(typeSlug),
      onlyErrors,
    }),
    [companyId, personaId, typeSlug, onlyErrors],
  );
  const feed = useActivityFeed(input);

  const personOptions = useMemo(
    () => [
      { value: "todos", label: "Todo el equipo" },
      ...members.map((m) => ({ value: m.id, label: formatPersonName(m.name, m.lastName) })),
    ],
    [members],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <AdminFilterChips
          label="Persona"
          options={personOptions}
          value={personaId ?? "todos"}
          onChange={(value) => setParams({ persona: value === "todos" ? null : value })}
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
        showCompany={false}
        onOpenPerson={(userId) => setParams({ persona: userId })}
        emptyTitle="Sin actividad con ese filtro"
        emptyDescription="Cambia la persona o el tipo de evento."
      />
    </div>
  );
}
