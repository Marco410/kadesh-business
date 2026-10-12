"use client";

import { useMemo } from "react";
import { PIPELINE_STATUS } from "kadesh/constants/constans";
import { PipelineBars } from "kadesh/components/panel/dashboard";
import {
  AdminSectionCard,
  AdminStatTile,
  formatCredits,
  formatMoney,
} from "../../../../ui";
import type { AdminCompanyInsights } from "../../../clients-queries";
import { pipelineLabel, sortByPipeline } from "../../format";

const WON = PIPELINE_STATUS.CERRADO_GANADO;
const LOST = [PIPELINE_STATUS.CERRADO_PERDIDO, PIPELINE_STATUS.DESCARTADO] as string[];
/** De "03 - Contactado" a "13 - Cerrado Perdido": descartado no implica que se contactó. */
const CONTACTED_OR_LATER = Object.values(PIPELINE_STATUS).slice(2, 13) as string[];

/** Embudo de la empresa y lo que ha ganado o perdido. */
export default function PipelineView({ insights }: { insights: AdminCompanyInsights | null }) {
  const rows = useMemo(() => sortByPipeline(insights?.pipeline ?? []), [insights?.pipeline]);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const count = (keys: string[]) =>
    rows.filter((r) => keys.includes(r.key)).reduce((sum, r) => sum + r.count, 0);
  const won = count([WON]);
  const lost = count(LOST);
  const contacted = count(CONTACTED_OR_LATER);
  const accepted = (insights?.proposalsByStatus ?? [])
    .filter((p) => p.key === "Aceptada" || p.key === "Comprada")
    .reduce((sum, p) => sum + p.amount, 0);

  const bars = rows.map((row) => ({
    status: row.key,
    label: pipelineLabel(row.key),
    count: row.count,
    value: 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AdminStatTile label="Leads en pipeline" value={formatCredits(total)} />
        <AdminStatTile
          label="Contactados o más"
          value={formatCredits(contacted)}
          hint={total ? `${Math.round((contacted / total) * 100)}% del total` : undefined}
        />
        <AdminStatTile
          label="Ganados"
          value={formatCredits(won)}
          tone={won ? "success" : "default"}
          hint={accepted ? `${formatMoney(accepted, "MXN")} en propuestas aceptadas` : undefined}
        />
        <AdminStatTile label="Perdidos o descartados" value={formatCredits(lost)} />
      </div>
      <AdminSectionCard
        title="Leads por etapa"
        description={
          insights?.leadsWithoutOwner
            ? `${insights.leadsWithoutOwner} lead${insights.leadsWithoutOwner === 1 ? "" : "s"} sin vendedor asignado.`
            : undefined
        }
      >
        <PipelineBars bars={bars} />
      </AdminSectionCard>
    </div>
  );
}
