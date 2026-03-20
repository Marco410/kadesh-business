import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import { getCategoryLabel } from "kadesh/components/profile/sales/helpers/category";

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

/** RFC 4180: comillas dobles y separador coma; funciona en Excel y Numbers (Mac). */
function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAssigned(lead: LeadItem, isAdminCompany: boolean): string {
  const persons = lead.salesPerson ?? [];
  const count = persons.length;
  if (isAdminCompany && count > 1) {
    return persons
      .map((sp) => {
        const full = [sp?.name, sp?.lastName].filter(Boolean).join(" ").trim();
        return full || "Sin nombre";
      })
      .join(", ");
  }
  if (isAdminCompany && count === 1) {
    const sp = persons[0];
    return [sp?.name, sp?.lastName].filter(Boolean).join(" ").trim() || "—";
  }
  if (isAdminCompany && count === 0) return "—";
  return `${lead.salesPerson?.[0]?.name ?? ""} ${lead.salesPerson?.[0]?.lastName ?? ""}`.trim() || "—";
}

function leadToRow(lead: LeadItem, isAdminCompany: boolean): string[] {
  const statuses = Array.isArray(lead.status)
    ? lead.status
    : lead.status
      ? [lead.status]
      : [];
  const leadStatus = statuses[0] ?? null;
  const pipelineAppliedBy =
    leadStatus?.salesPerson != null
      ? [leadStatus.salesPerson.name, leadStatus.salesPerson.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "—"
      : "—";

  return [
    lead.businessName || "—",
    getCategoryLabel(lead.category),
    leadStatus?.pipelineStatus ?? "—",
    pipelineAppliedBy,
    lead.phone ?? "—",
    lead.city ?? "—",
    lead.state ?? "—",
    lead.country ?? "—",
    leadStatus?.opportunityLevel ?? "—",
    lead.rating != null ? String(lead.rating) : "—",
    lead.source ?? "—",
    formatAssigned(lead, isAdminCompany),
  ];
}

const HEADERS = [
  "Empresa",
  "Categoría",
  "Pipeline",
  "Pipeline aplicado por",
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
  isAdminCompany: boolean,
  filenameBase = "clientes"
): void {
  const rows: string[][] = [
    [...HEADERS],
    ...leads.map((lead) => leadToRow(lead, isAdminCompany)),
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
}
