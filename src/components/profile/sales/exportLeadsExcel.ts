import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import { getCategoryLabel } from "kadesh/components/profile/sales/helpers/category";
import { companyLeadStatus } from "kadesh/components/profile/sales/helpers/company-lead-status";
import { TRACK_EVENT, trackActivity } from "kadesh/utils/activity";

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

/** RFC 4180: comillas dobles y separador coma; funciona en Excel y Numbers (Mac). */
function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAssigned(lead: LeadItem): string {
  const names = (lead.salesPerson ?? [])
    .map((sp) => [sp?.name, sp?.lastName].filter(Boolean).join(" ").trim() || "Sin nombre");
  return names.length ? names.join(", ") : "—";
}

function leadToRow(lead: LeadItem): string[] {
  // Estatus compartido de la empresa: ya no hay "quién lo aplicó" (eso queda en la actividad).
  const leadStatus = companyLeadStatus(lead.status);

  return [
    lead.businessName || "—",
    getCategoryLabel(lead.category),
    leadStatus?.pipelineStatus ?? "—",
    lead.phone ?? "—",
    lead.city ?? "—",
    lead.state ?? "—",
    lead.country ?? "—",
    leadStatus?.opportunityLevel ?? "—",
    lead.rating != null ? String(lead.rating) : "—",
    lead.source ?? "—",
    formatAssigned(lead),
  ];
}

const HEADERS = [
  "Empresa",
  "Categoría",
  "Pipeline",
  "Teléfono",
  "Ciudad",
  "Estado",
  "País",
  "Oportunidad",
  "Rating",
  "Fuente",
  "Asignado a",
] as const;

export function downloadLeadsExcel(
  leads: LeadItem[],
  filenameBase = "clientes"
): void {
  const rows: string[][] = [
    [...HEADERS],
    ...leads.map((lead) => leadToRow(lead)),
  ];
  const body = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const csv = `\ufeff${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `${filenameBase}_${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  // Exportar en masa es señal de riesgo (se llevan la cartera) o de uso fuerte: solo el conteo.
  trackActivity(TRACK_EVENT.LEADS_EXPORTED, {
    metadata: { count: leads.length, format: "csv", file: filenameBase },
  });
}
