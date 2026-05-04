import type { TechBusinessLeadsVariables } from "kadesh/components/profile/sales/queries";

type BuildClientLeadsQueryVariablesArgs = {
  where: TechBusinessLeadsVariables["where"];
  companyId: string | null;
  /**
   * Admin empresa o usuario empresa (`user_company`): ven todos los leads de la company
   * en el mismo alcance que la lista principal de ventas.
   */
  hasCompanyWideLeadScope: boolean;
  userId: string;
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
  hasCompanyWideLeadScope,
  userId,
  take,
  skip,
  orderBy,
}: BuildClientLeadsQueryVariablesArgs): TechBusinessLeadsVariables {
  const statusWhere =
    companyId != null
      ? hasCompanyWideLeadScope
        ? { saasCompany: { id: { equals: companyId } } }
        : {
            AND: [
              { saasCompany: { id: { equals: companyId } } },
              { salesPerson: { id: { equals: userId } } },
            ],
          }
      : {};

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
