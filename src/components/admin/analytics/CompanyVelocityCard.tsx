"use client";

import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { AdminSectionCard, AdminStatTile } from "../ui";
import { ADMIN_SALES_VELOCITY_QUERY, type AdminSalesVelocityResponse } from "./analytics-queries";
import { HELP } from "./help";
import { formatDays, formatHours, formatMinutes, formatRate } from "kadesh/utils/sales-velocity-format";

const DAYS = 90;

/** Velocidad comercial de una empresa en el Resumen del 360 (últimos 90 días). */
export default function CompanyVelocityCard({ companyId }: { companyId: string }) {
  const { data, error } = useQuery<AdminSalesVelocityResponse>(ADMIN_SALES_VELOCITY_QUERY, {
    variables: { input: { days: DAYS, companyId } },
    fetchPolicy: "cache-and-network",
  });
  const v = data?.adminSalesVelocity;
  if (error || !v || !v.dataSince) return null;

  return (
    <AdminSectionCard
      title="Velocidad comercial"
      description={`Últimos ${DAYS} días · datos desde el ${formatDateShort(v.dataSince, false)}.`}
      help={HELP.salesHowTo}
    >
      {v.stages.length === 0 && v.whatsappInbound === 0 ? (
        <p className="text-sm text-[#9e9e9e]">No movieron leads ni contestaron WhatsApp en el periodo.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          <AdminStatTile
            label="Tasa de cierre"
            value={formatRate(v.winRate)}
            hint={`${v.won} ganados · ${v.lost} perdidos`}
            help={HELP.winRate}
          />
          <AdminStatTile label="Ciclo de venta" value={formatDays(v.medianCycleDays)} help={HELP.salesCycle} />
          <AdminStatTile
            label="Primer contacto"
            value={formatHours(v.medianFirstContactHours)}
            hint={`${v.contacted} de ${v.newLeads} leads nuevos`}
            help={HELP.firstContact}
          />
          <AdminStatTile
            label="Estancados"
            value={v.stalled}
            tone={v.stalled ? "warning" : "default"}
            help={HELP.stalled}
          />
          <AdminStatTile
            label="Responde WhatsApp en"
            value={formatMinutes(v.whatsappMedianResponseMinutes)}
            help={HELP.waResponse}
          />
        </div>
      )}
    </AdminSectionCard>
  );
}
