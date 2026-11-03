"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { PIPELINE_STATUS_COLORS } from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  AdminDefinitionList,
  AdminDrawer,
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatusBadge,
  formatMoney,
  formatPersonName,
} from "../../ui";
import {
  ADMIN_LEAD_QUICK_VIEW_QUERY,
  leadQuickViewVariables,
  type AdminLeadQuickViewResponse,
} from "../crm-queries";
import { pipelineLabel, quotationStatusClass, quotationStatusLabel } from "./format";

/**
 * Lead visto desde Operaciones: solo lectura y solo lo de esta empresa (el lead puede
 * estar en varias). No enlaza al detalle del panel del cliente, que permite editar.
 */
export default function LeadQuickView({
  leadId,
  companyId,
  onClose,
}: {
  leadId: string | null;
  companyId: string;
  onClose: () => void;
}) {
  const { data, loading, error } = useQuery<AdminLeadQuickViewResponse>(
    ADMIN_LEAD_QUICK_VIEW_QUERY,
    {
      variables: leadId ? leadQuickViewVariables(leadId, companyId) : undefined,
      skip: !leadId,
      fetchPolicy: "cache-and-network",
    },
  );
  const lead = data?.techBusinessLead;
  const status = lead?.status[0] ?? null;

  return (
    <AdminDrawer
      open={Boolean(leadId)}
      onClose={onClose}
      ariaLabel="Detalle del lead"
      title={lead?.businessName ?? "Lead"}
      subtitle={[lead?.category, lead?.city, lead?.state].filter(Boolean).join(" · ") || undefined}
    >
      {error ? (
        <AdminErrorState message="No se pudo cargar el lead." />
      ) : loading && !lead ? (
        <AdminLoadingRows rows={4} />
      ) : !lead ? null : (
        <div className="flex flex-col gap-4">
          <AdminSectionCard title="En esta empresa">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <AdminStatusBadge
                label={pipelineLabel(status?.pipelineStatus)}
                className={
                  (status?.pipelineStatus && PIPELINE_STATUS_COLORS[status.pipelineStatus]) ??
                  "bg-dash-surface-3 text-dash-muted"
                }
              />
              {status?.opportunityLevel ? (
                <AdminStatusBadge
                  label={`Oportunidad ${status.opportunityLevel.toLowerCase()}`}
                  className="bg-dash-surface-2 text-dash-soft"
                />
              ) : null}
            </div>
            <AdminDefinitionList
              columns={2}
              items={[
                {
                  label: "Vendedor",
                  value: lead.salesPerson.length
                    ? lead.salesPerson
                        .map((seller) => formatPersonName(seller.name, seller.lastName))
                        .join(", ")
                    : "Sin asignar",
                },
                {
                  label: "Valor estimado",
                  value: status?.estimatedValue != null ? formatMoney(status.estimatedValue, "MXN") : "—",
                },
                { label: "Producto ofrecido", value: status?.productOffered || "—" },
                {
                  label: "Primer contacto",
                  value: status?.firstContactDate ? formatDateShort(status.firstContactDate, false) : "—",
                },
              ]}
            />
            {status?.notes ? (
              <p className="mt-3 whitespace-pre-line rounded-xl bg-dash-surface-2 p-3 text-sm text-dash-muted">
                {status.notes}
              </p>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard title="Negocio">
            <AdminDefinitionList
              columns={2}
              items={[
                { label: "Teléfono", value: lead.phone || "—" },
                { label: "Correo", value: lead.email || "—" },
                { label: "Dirección", value: lead.address || "—" },
                {
                  label: "Rating",
                  value:
                    lead.rating != null
                      ? `${lead.rating} (${lead.reviewCount ?? 0} reseñas)`
                      : "—",
                },
                { label: "Fuente", value: lead.source || "—" },
                { label: "Alta en Kadesh", value: formatDateShort(lead.createdAt, false) },
              ]}
            />
            {lead.googleMapsUrl ? (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
              >
                Abrir en Google Maps
                <HugeiconsIcon icon={LinkSquare02Icon} size={14} />
              </a>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard title={`Actividades (${lead.activities.length})`}>
            {lead.activities.length === 0 ? (
              <p className="text-sm text-dash-muted">Sin actividades registradas.</p>
            ) : (
              <ul className="divide-y divide-dash-line">
                {lead.activities.map((a) => (
                  <li key={a.id} className="py-2">
                    <p className="text-sm font-medium text-dash-ink">
                      {a.type}
                      {a.title ? ` · ${a.title}` : ""}
                    </p>
                    <p className="text-xs text-dash-muted">
                      {formatDateShort(a.activityDate, true)}
                      {a.assignedSeller
                        ? ` · ${formatPersonName(a.assignedSeller.name, a.assignedSeller.lastName)}`
                        : ""}
                      {a.result ? ` · ${a.result}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminSectionCard title={`Seguimientos (${lead.followUpTasks.length})`}>
              {lead.followUpTasks.length === 0 ? (
                <p className="text-sm text-dash-muted">Ninguno.</p>
              ) : (
                <ul className="space-y-2">
                  {lead.followUpTasks.map((f) => (
                    <li key={f.id} className="text-sm text-dash-ink">
                      {formatDateShort(f.scheduledDate, false)} · {f.status ?? "—"}
                      {f.notes ? (
                        <span className="block text-xs text-dash-muted">{f.notes}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </AdminSectionCard>
            <AdminSectionCard title={`Propuestas (${lead.proposals.length})`}>
              {lead.proposals.length === 0 ? (
                <p className="text-sm text-dash-muted">Ninguna.</p>
              ) : (
                <ul className="space-y-2">
                  {lead.proposals.map((pr) => (
                    <li key={pr.id} className="text-sm text-dash-ink">
                      {formatMoney(pr.amount, "MXN")} · {pr.status ?? "—"}
                      <span className="block text-xs text-dash-muted">
                        {[pr.product, formatDateShort(pr.sentDate, false)].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSectionCard>
          </div>

          <AdminSectionCard title={`Cotizaciones (${lead.quotations.length})`}>
            {lead.quotations.length === 0 ? (
              <p className="text-sm text-dash-muted">Ninguna.</p>
            ) : (
              <ul className="space-y-2">
                {lead.quotations.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-dash-ink">
                      #{q.quotationNumber ?? "—"} · {formatMoney(q.total, q.currency)}
                    </span>
                    <AdminStatusBadge
                      label={quotationStatusLabel(q.status)}
                      className={quotationStatusClass(q.status)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>
        </div>
      )}
    </AdminDrawer>
  );
}
