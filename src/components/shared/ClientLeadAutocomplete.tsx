"use client";

import { useMemo, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useStableQuery } from "kadesh/providers/useStableQuery";
import Autocomplete, { type AutocompleteOption } from "./Autocomplete";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import { useDebouncedValue } from "kadesh/components/admin/hooks/useDebouncedValue";
import { normalizeSearchText } from "kadesh/utils/normalizeSearchText";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";

/** Cuántos clientes se piden por búsqueda (y cuántos recientes al abrir sin escribir). */
const SEARCH_TAKE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Solo lo que pinta el buscador. Antes reutilizaba la consulta del listado de Clientes (estatus,
 * vendedores, contacto…) con `take: 500` cada vez que se abría un modal.
 */
const CLIENT_LEAD_SEARCH_QUERY = gql`
  query ClientLeadSearch($where: TechBusinessLeadWhereInput!, $take: Int!) {
    techBusinessLeads(where: $where, take: $take, orderBy: [{ createdAt: desc }]) {
      id
      businessName
    }
  }
`;

/** Nombre del cliente ya elegido cuando no viene entre los resultados de la búsqueda. */
const CLIENT_LEAD_NAME_QUERY = gql`
  query ClientLeadName($id: ID!) {
    techBusinessLead(where: { id: $id }) {
      id
      businessName
    }
  }
`;

type LeadOption = { id: string; businessName: string | null };
type ClientLeadSearchResponse = { techBusinessLeads: LeadOption[] | null };
type ClientLeadSearchVariables = { where: Record<string, unknown>; take: number };
type ClientLeadNameResponse = { techBusinessLead: LeadOption | null };

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

/**
 * Buscador de clientes del CRM. La búsqueda la hace el servidor sobre `businessNameSearch` (el
 * nombre en minúsculas y sin acentos): "cafe" encuentra "Café". Trae como máximo `SEARCH_TAKE`
 * coincidencias; sin texto muestra los más recientes. Se muestra siempre `businessName`.
 */
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
  const isUserCompany =
    user?.roles?.some((r) => r.name === Role.USER_COMPANY) ?? false;
  const hasCompanyWideLeadScope = isAdminCompany || isUserCompany;

  const { data: userData } = useStableQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !enabled || !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const [typed, setTyped] = useState("");
  // Igual que el back guarda `businessNameSearch`: minúsculas y sin acentos ("PEÑA" → "pena").
  const term = normalizeSearchText(typed);
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);

  const searchVariables = useMemo<ClientLeadSearchVariables>(
    () => ({
      where: {
        ...(companyId
          ? { saasCompany: { some: { id: { equals: companyId } } } }
          : {}),
        ...(!hasCompanyWideLeadScope
          ? { salesPerson: { some: { id: { equals: userId } } } }
          : {}),
        ...(debouncedTerm
          ? { businessNameSearch: { contains: debouncedTerm } }
          : {}),
      },
      take: SEARCH_TAKE,
    }),
    [companyId, hasCompanyWideLeadScope, userId, debouncedTerm],
  );

  const {
    data: searchData,
    previousData: previousSearchData,
    loading: searchLoading,
  } = useQuery<ClientLeadSearchResponse, ClientLeadSearchVariables>(CLIENT_LEAD_SEARCH_QUERY, {
    variables: searchVariables,
    skip: !enabled || !companyId || !userId,
  });

  // Mientras llega la búsqueda nueva se dejan los resultados anteriores: la lista no parpadea.
  const results = (searchData ?? previousSearchData)?.techBusinessLeads;
  const selectedInResults = Boolean(
    selectedLeadId && results?.some((lead) => lead.id === selectedLeadId),
  );

  // El cliente ya elegido puede no estar entre las coincidencias (p. ej. al abrir una cotización
  // guardada): se pide solo su nombre para poder mostrarlo.
  const { data: selectedData } = useQuery<ClientLeadNameResponse, { id: string }>(
    CLIENT_LEAD_NAME_QUERY,
    {
      variables: { id: selectedLeadId ?? "" },
      skip: !enabled || !selectedLeadId || selectedInResults || results === undefined,
      fetchPolicy: "cache-first",
    },
  );

  const clientOptions = useMemo<AutocompleteOption[]>(() => {
    const options = (results ?? []).map((lead) => ({
      id: lead.id,
      label: lead.businessName ?? "",
    }));
    const selected = selectedData?.techBusinessLead;
    if (selected && selected.id === selectedLeadId && !options.some((o) => o.id === selected.id)) {
      options.unshift({ id: selected.id, label: selected.businessName ?? "" });
    }
    return options;
  }, [results, selectedData, selectedLeadId]);

  return (
    <Autocomplete
      id={id}
      label={label}
      value={selectedLeadId ?? ""}
      options={clientOptions}
      onChange={setTyped}
      onSelect={(option) => {
        const sid = option?.id ?? "";
        onSelectedLeadIdChange(sid || null);
      }}
      placeholder={placeholder}
      required={required}
      // Solo la primera carga bloquea el campo; al buscar se sigue pudiendo escribir.
      loading={searchLoading && results === undefined}
      searching={term !== debouncedTerm || searchLoading}
      className={className}
    />
  );
}
