/**
 * Estatus de pipeline canónico: el del vendedor asignado al lead.
 * Si no hay asignados, el de empresa sin vendedor; si no, el primero de la company.
 */

export type CanonicalStatusSalesPerson = {
  id: string;
  name?: string | null;
  lastName?: string | null;
} | null;

export type CanonicalLeadStatus = {
  id: string;
  pipelineStatus?: string | null;
  opportunityLevel?: string | null;
  notes?: string | null;
  productOffered?: string | null;
  firstContactDate?: string | null;
  estimatedValue?: number | null;
  nextFollowUpDate?: string | null;
  salesPerson?: CanonicalStatusSalesPerson;
  saasCompany?: { id: string; name?: string | null } | null;
};

export type CanonicalAssignedPerson = {
  id: string;
  name?: string | null;
  lastName?: string | null;
};

function asStatusArray<T>(status: T[] | T | null | undefined): T[] {
  if (Array.isArray(status)) return status;
  return status ? [status] : [];
}

function asAssignedArray(
  salesPerson:
    | CanonicalAssignedPerson[]
    | CanonicalAssignedPerson
    | null
    | undefined,
): CanonicalAssignedPerson[] {
  if (Array.isArray(salesPerson)) return salesPerson;
  return salesPerson ? [salesPerson] : [];
}

/**
 * Elige el estatus que debe mostrar/editar la UI y alinear con el filtro.
 */
export function pickCanonicalLeadStatus<T extends CanonicalLeadStatus>(
  status: T[] | T | null | undefined,
  assignedSalesPersons:
    | CanonicalAssignedPerson[]
    | CanonicalAssignedPerson
    | null
    | undefined,
): T | null {
  const statuses = asStatusArray(status);
  if (statuses.length === 0) return null;

  const assigned = asAssignedArray(assignedSalesPersons);
  const assignedIds = new Set(assigned.map((p) => p.id));

  if (assignedIds.size > 0) {
    // Preferir el orden de asignación (primer vendedor).
    for (const person of assigned) {
      const match = statuses.find((s) => s.salesPerson?.id === person.id);
      if (match) return match;
    }
  }

  const withoutSeller = statuses.find((s) => !s.salesPerson?.id);
  if (withoutSeller) return withoutSeller;

  return statuses[0] ?? null;
}

/** Primer asignado del lead (para escribir el estatus canónico). */
export function primaryAssignedSalesPersonId(
  assignedSalesPersons:
    | CanonicalAssignedPerson[]
    | CanonicalAssignedPerson
    | null
    | undefined,
): string | null {
  const assigned = asAssignedArray(assignedSalesPersons);
  return assigned[0]?.id ?? null;
}
