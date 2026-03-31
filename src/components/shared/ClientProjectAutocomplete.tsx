"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import Autocomplete, { type AutocompleteOption } from "./Autocomplete";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_PROJECTS_FOR_SELECT_QUERY,
  type SaasProjectsForSelectResponse,
  type SaasProjectsForSelectVariables,
} from "kadesh/components/profile/sales/proyecto/queries";

export interface ClientProjectAutocompleteProps {
  userId: string;
  selectedProjectId: string | null;
  onSelectedProjectIdChange: (id: string | null) => void;
  enabled?: boolean;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function ClientProjectAutocomplete({
  userId,
  selectedProjectId,
  onSelectedProjectIdChange,
  enabled = true,
  id = "client-project-autocomplete",
  label = "Proyecto",
  placeholder = "Buscar proyecto por nombre",
  required = false,
  className,
}: ClientProjectAutocompleteProps) {
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

  const whereClause = useMemo<SaasProjectsForSelectVariables["where"]>(() => {
    if (!companyId) return {};
    if (isAdminCompany) {
      return { company: { id: { equals: companyId } } };
    }
    return {
      company: { id: { equals: companyId } },
      responsible: { id: { equals: userId } },
    };
  }, [companyId, isAdminCompany, userId]);

  const { data: projectsData, loading } = useQuery<
    SaasProjectsForSelectResponse,
    SaasProjectsForSelectVariables
  >(SAAS_PROJECTS_FOR_SELECT_QUERY, {
    variables: { where: whereClause, take: 500 },
    skip: !enabled || !companyId || !userId,
    fetchPolicy: "network-only",
  });

  const projects = projectsData?.saasProjects ?? [];

  const projectOptions = useMemo<AutocompleteOption[]>(() => {
    const base = projects.map((p) => ({
      id: p.id,
      label: (p.name ?? "").trim() || p.id,
    }));
    const pid = selectedProjectId?.trim();
    if (
      pid &&
      !base.some((o) => o.id === pid)
    ) {
      return [{ id: pid, label: `${pid} (actual)` }, ...base];
    }
    return base;
  }, [projects, selectedProjectId]);

  return (
    <Autocomplete
      id={id}
      label={label}
      value={selectedProjectId ?? ""}
      options={projectOptions}
      onSelect={(option) => {
        const sid = option?.id ?? "";
        onSelectedProjectIdChange(sid || null);
      }}
      placeholder={placeholder}
      required={required}
      loading={loading}
      className={className}
    />
  );
}
