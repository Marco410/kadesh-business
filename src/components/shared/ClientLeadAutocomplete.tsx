"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import Autocomplete, { type AutocompleteOption } from "./Autocomplete";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import {
  TECH_BUSINESS_LEADS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type TechBusinessLeadsResponse,
  type TechBusinessLeadsVariables,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { buildClientLeadsQueryVariables } from "kadesh/components/profile/sales/helpers/client-leads-query";

export interface ClientLeadAutocompleteProps {
  userId: string;
  selectedLeadId: string | null;
  onSelectedLeadIdChange: (id: string | null) => void;
  /** Si es false, no se ejecutan las queries (p. ej. modal cerrado). */
  enabled?: boolean;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function ClientLeadAutocomplete({
  userId,
  selectedLeadId,
  onSelectedLeadIdChange,
  enabled = true,
  id = "client-lead-autocomplete",
  label = "Cliente",
  placeholder = "Buscar cliente por nombre",
  required = false,
  className,
}: ClientLeadAutocompleteProps) {
  const { user } = useUser();
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !enabled || !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const clientsWhere = useMemo<TechBusinessLeadsVariables["where"]>(
    () => ({
      ...(companyId
        ? { saasCompany: { some: { id: { equals: companyId } } } }
        : {}),
      ...(!isAdminCompany
        ? { salesPerson: { some: { id: { equals: userId } } } }
        : {}),
    }),
    [companyId, isAdminCompany, userId],
  );

  const clientsQueryVariables = useMemo(
    () =>
      buildClientLeadsQueryVariables({
        where: clientsWhere,
        companyId,
        isAdminCompany,
        userId,
        take: 500,
        orderBy: [{ createdAt: "desc" }],
      }),
    [clientsWhere, companyId, isAdminCompany, userId],
  );

  const { data: clientsData, loading: loadingClients } = useQuery<
    TechBusinessLeadsResponse,
    TechBusinessLeadsVariables
  >(TECH_BUSINESS_LEADS_QUERY, {
    variables: clientsQueryVariables,
    skip: !enabled || !companyId || !userId,
    fetchPolicy: "network-only",
  });

  const clients = clientsData?.techBusinessLeads ?? [];
  const clientOptions = useMemo<AutocompleteOption[]>(
    () =>
      clients.map((c) => ({
        id: c.id,
        label: c.businessName ?? "",
      })),
    [clients],
  );

  return (
    <Autocomplete
      id={id}
      label={label}
      value={selectedLeadId ?? ""}
      options={clientOptions}
      onSelect={(option) => {
        const sid = option?.id ?? "";
        onSelectedLeadIdChange(sid || null);
      }}
      placeholder={placeholder}
      required={required}
      loading={loadingClients}
      className={className}
    />
  );
}
