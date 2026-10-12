/**
 * Estatus de pipeline del lead en la empresa. Hay uno solo por (lead, empresa) y lo comparte
 * todo el equipo, así que las queries piden `status(where: { saasCompany })` y aquí se toma el
 * primero. El vendedor asignado vive en `lead.salesPerson`, no en el estatus.
 */

export type CompanyLeadStatus = {
  id: string;
  pipelineStatus?: string | null;
  opportunityLevel?: string | null;
  notes?: string | null;
  productOffered?: string | null;
  firstContactDate?: string | null;
  estimatedValue?: number | null;
  nextFollowUpDate?: string | null;
  saasCompany?: { id: string; name?: string | null } | null;
};

export function companyLeadStatus<T extends CompanyLeadStatus>(
  status: T[] | T | null | undefined,
): T | null {
  if (Array.isArray(status)) return status[0] ?? null;
  return status ?? null;
}
