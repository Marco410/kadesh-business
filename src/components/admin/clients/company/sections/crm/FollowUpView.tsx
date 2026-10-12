"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { cn } from "kadesh/utils/cn";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatusBadge,
  formatMoney,
  formatPersonName,
} from "../../../../ui";
import {
  ADMIN_COMPANY_FOLLOW_UP_QUERY,
  companyFollowUpVariables,
  type AdminCompanyFollowUpResponse,
} from "../../../crm-queries";

const FOLLOW_UP_PENDING = "Pendiente";

function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function Row({ title, meta, aside }: { title: ReactNode; meta: ReactNode; aside?: ReactNode }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#212121] dark:text-white">{title}</p>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{meta}</p>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">{text}</p>;
}

/** Lo que el equipo registró en el CRM: actividades, seguimientos, tareas y propuestas. */
export default function FollowUpView({ companyId }: { companyId: string }) {
  const variables = useMemo(() => companyFollowUpVariables(companyId), [companyId]);
  const { data, loading, error } = useQuery<AdminCompanyFollowUpResponse>(
    ADMIN_COMPANY_FOLLOW_UP_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !data) return <AdminLoadingRows rows={6} />;
  if (!data) return null;

  const today = todayYmd();
  const person = (p: { name: string; lastName: string | null } | null) =>
    p ? formatPersonName(p.name, p.lastName) : "Sin asignar";

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AdminSectionCard
        title={`Actividades (${data.techSalesActivitiesCount})`}
        description="Llamadas, WhatsApp, correos y reuniones registradas."
      >
        {data.techSalesActivities.length === 0 ? (
          <Empty text="Sin actividades registradas." />
        ) : (
          <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {data.techSalesActivities.map((a) => (
              <Row
                key={a.id}
                title={`${a.type ?? "Actividad"} · ${a.businessLead?.businessName ?? "Sin lead"}`}
                meta={[
                  formatDateShort(a.activityDate ?? a.createdAt, true),
                  person(a.createdBy ?? a.assignedSeller),
                  a.result || a.title || null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </ul>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title={`Seguimientos (${data.techFollowUpTasksCount})`}
        description="Los vencidos y sin completar se marcan en rojo."
      >
        {data.techFollowUpTasks.length === 0 ? (
          <Empty text="Sin seguimientos." />
        ) : (
          <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {data.techFollowUpTasks.map((f) => {
              const overdue =
                f.status === FOLLOW_UP_PENDING &&
                Boolean(f.scheduledDate) &&
                (f.scheduledDate ?? "").slice(0, 10) < today;
              return (
                <Row
                  key={f.id}
                  title={f.businessLead?.businessName ?? "Sin lead"}
                  meta={[
                    formatDateShort(f.scheduledDate, false),
                    person(f.assignedSeller),
                    f.notes || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  aside={
                    <AdminStatusBadge
                      label={overdue ? "Vencido" : f.status ?? "—"}
                      className={cn(
                        overdue
                          ? "bg-red-500/15 text-red-700 dark:text-red-300"
                          : "bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]",
                      )}
                    />
                  }
                />
              );
            })}
          </ul>
        )}
      </AdminSectionCard>

      <AdminSectionCard title={`Tareas (${data.techTasksCount})`}>
        {data.techTasks.length === 0 ? (
          <Empty text="Sin tareas." />
        ) : (
          <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {data.techTasks.map((t) => (
              <Row
                key={t.id}
                title={t.title || "Tarea"}
                meta={[
                  t.dueDate ? `Vence ${formatDateShort(t.dueDate, false)}` : null,
                  person(t.responsible),
                  t.businessLead?.businessName ?? null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                aside={
                  t.priority ? (
                    <AdminStatusBadge
                      label={t.priority}
                      className="bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                    />
                  ) : null
                }
              />
            ))}
          </ul>
        )}
      </AdminSectionCard>

      <AdminSectionCard title={`Propuestas (${data.techProposalsCount})`}>
        {data.techProposals.length === 0 ? (
          <Empty text="Sin propuestas." />
        ) : (
          <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {data.techProposals.map((p) => (
              <Row
                key={p.id}
                title={`${formatMoney(p.amount, "MXN")} · ${p.businessLead?.businessName ?? "Sin lead"}`}
                meta={[
                  formatDateShort(p.sentDate, false),
                  person(p.assignedSeller),
                  p.product || null,
                  p.paid ? "Pagada" : p.approved ? "Aprobada" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                aside={
                  <AdminStatusBadge
                    label={p.status ?? "—"}
                    className="bg-black/5 text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                  />
                }
              />
            ))}
          </ul>
        )}
      </AdminSectionCard>
    </div>
  );
}
