"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_QUOTATIONS_LIST_QUERY,
  type SaasQuotationRow,
  type SaasQuotationsListResponse,
  type SaasQuotationsListVariables,
} from "../queries";

export const QUOTATIONS_LIST_PAGE_SIZE = 10;

export interface UseQuotationsListOptions {
  userId: string;
}

export function useQuotationsList({ userId }: UseQuotationsListOptions) {
  const { user } = useUser();
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const [page, setPage] = useState(1);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  useEffect(() => {
    setPage(1);
  }, [companyId, isAdminCompany, userId]);

  const where = useMemo(() => {
    if (!companyId) return null;
    const byCompany = { company: { id: { equals: companyId } } };
    if (isAdminCompany) return byCompany;
    if (!userId) return null;
    return {
      AND: [byCompany, { assignedSeller: { id: { equals: userId } } }],
    };
  }, [companyId, isAdminCompany, userId]);

  const skip = (page - 1) * QUOTATIONS_LIST_PAGE_SIZE;

  const { data, loading, error, refetch } = useQuery<
    SaasQuotationsListResponse,
    SaasQuotationsListVariables
  >(SAAS_QUOTATIONS_LIST_QUERY, {
    variables: {
      where: where ?? { id: { equals: "__none__" } },
      orderBy: [{ createdAt: "desc" }],
      take: QUOTATIONS_LIST_PAGE_SIZE + 1,
      skip,
    },
    skip: !companyId || !where,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const rawRows = data?.saasQuotations ?? [];
  const hasNextPage = rawRows.length > QUOTATIONS_LIST_PAGE_SIZE;
  const rows: SaasQuotationRow[] = hasNextPage
    ? rawRows.slice(0, QUOTATIONS_LIST_PAGE_SIZE)
    : rawRows;
  const hasPrevPage = page > 1;

  return {
    companyId,
    isAdminCompany,
    page,
    setPage,
    rows,
    loading,
    error,
    refetch,
    hasNextPage,
    hasPrevPage,
    pageSize: QUOTATIONS_LIST_PAGE_SIZE,
  };
}
