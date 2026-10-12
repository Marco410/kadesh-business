import type { TechBusinessLeadsVariables } from "kadesh/components/profile/sales/queries";

type BuildClientLeadsQueryVariablesArgs = {
  where: TechBusinessLeadsVariables["where"];
  companyId: string | null;
  take?: number;
  skip?: number;
  orderBy?: TechBusinessLeadsVariables["orderBy"];
};

/**
 * Shared query builder for visible clients (techBusinessLeads) by session scope.
 * Reused by SalesSection and ClientLeadAutocomplete.
 */
export function buildClientLeadsQueryVariables({
  where,
  companyId,
  take,
  skip,
  orderBy,
}: BuildClientLeadsQueryVariablesArgs): TechBusinessLeadsVariables {
  // El estatus es uno por empresa: no depende de quién lo ve (la visibilidad va en `where`).
  const statusWhere = companyId != null ? { saasCompany: { id: { equals: companyId } } } : {};

  const salesPersonWhere2 = companyId != null ? { company: { id: { equals: companyId } } } : {};

  return {
    where,
    statusWhere,
    salesPersonWhere2,
    ...(take != null ? { take } : {}),
    ...(skip != null ? { skip } : {}),
    ...(orderBy ? { orderBy } : {}),
  };
}
