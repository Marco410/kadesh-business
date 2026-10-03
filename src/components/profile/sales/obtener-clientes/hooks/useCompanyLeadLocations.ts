"use client";

import { gql, useQuery } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { useUser } from "kadesh/utils/UserContext";

/** Tope holgado sobre el volumen actual. Sin `take`, Keystone devuelve la lista completa. */
const COMPANY_LEAD_LOCATIONS_TAKE = 10000;

const COMPANY_LEAD_LOCATIONS_QUERY = gql`
  query CompanyLeadLocations($where: TechBusinessLeadWhereInput!, $take: Int) {
    techBusinessLeads(where: $where, take: $take) {
      id
      category
      lat
      lng
    }
  }
`;

export interface CompanyLeadLocation {
  id: string;
  category: string | null;
  lat: number | null;
  lng: number | null;
}

interface CompanyLeadLocationsResponse {
  techBusinessLeads: CompanyLeadLocation[];
}

interface CompanyLeadLocationsVariables {
  where: {
    saasCompany?: { some: { id: { equals: string } } };
  };
  take: number;
}

export function useCompanyLeadLocations(enabled = true) {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data, loading, refetch } = useQuery<
    CompanyLeadLocationsResponse,
    CompanyLeadLocationsVariables
  >(COMPANY_LEAD_LOCATIONS_QUERY, {
    variables: {
      where: companyId
        ? { saasCompany: { some: { id: { equals: companyId } } } }
        : {},
      take: COMPANY_LEAD_LOCATIONS_TAKE,
    },
    skip: !enabled || !companyId,
  });

  return {
    leads: data?.techBusinessLeads ?? [],
    loading: loading || !companyId,
    companyId,
    refetch,
  };
}
