import type { TechBusinessLeadsVariables } from "kadesh/components/profile/sales/queries";

type BuildClientLeadsQueryVariablesArgs = {
  where: TechBusinessLeadsVariables["where"];
  companyId: string | null;
  isAdminCompany: boolean;
  userId: string;
  take?: number;
  skip?: number;
  orderBy?: TechBusinessLeadsVariables["orderBy"];
};

/**
 * Shared query builder for visible clients (techBusinessLeads) by session scope.
 * Reused by SalesSection and CreateProjectModal autocomplete.
 */
export function buildClientLeadsQueryVariables({
  where,
  companyId,
  isAdminCompany,
  userId,
  take,
  skip,
  orderBy,
}: BuildClientLeadsQueryVariablesArgs): TechBusinessLeadsVariables {
  const statusWhere =
    companyId != null
      ? isAdminCompany
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

