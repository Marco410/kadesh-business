"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import {
  TECH_BUSINESS_LEADS_QUERY,
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  COMPANY_VENDEDORES_QUERY,
  UPDATE_TECH_BUSINESS_LEAD_MUTATION,
  CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION,
  TECH_STATUS_BUSINESS_LEADS_BY_LEADS_AND_SALES_PERSON_QUERY,
  type TechBusinessLeadsResponse,
  type TechBusinessLeadsVariables,
  type TechBusinessLeadsCountResponse,
  type TechBusinessLeadsCountVariables,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
  type CompanyVendedoresResponse,
  type CompanyVendedoresVariables,
  type UpdateTechBusinessLeadVariables,
  type UpdateTechBusinessLeadMutation,
  type CreateTechStatusBusinessLeadVariables,
  type CreateTechStatusBusinessLeadMutation,
  type TechStatusBusinessLeadsByLeadsAndSalesPersonResponse,
  type TechStatusBusinessLeadsByLeadsAndSalesPersonVariables,
} from "kadesh/components/profile/sales/queries";
import SalesLeadsTable from "kadesh/components/profile/sales/SalesLeadsTable";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";
import StatsSection from "./StatsSection";
import FiltersLeadsSection from "./FiltersLeadsSection";
import CurrentPlanSection from "./CurrentPlanSection";
import { SubscriptionProvider } from "./SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import { PIPELINE_STATUS } from "./constants";
import { sileo } from "sileo";

const LEADS_PAGE_SIZE = 10;

interface SalesSectionProps {
  userId: string;
}

function parsePageParam(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

/** Normaliza texto para búsqueda: quita acentos y diacríticos. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function SalesSection({ userId }: SalesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignToVendedorId, setAssignToVendedorId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const { user, refreshUser } = useUser();

  const page = parsePageParam(searchParams.get("page"));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: userData, refetch: refetchUserCompany } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const isAdminCompany = user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const { data: vendedoresData } = useQuery<
    CompanyVendedoresResponse,
    CompanyVendedoresVariables
  >(COMPANY_VENDEDORES_QUERY, {
    variables: {
      where: {
        company: companyId ? { id: { equals: companyId } } : undefined,
        roles: { some: { name: { equals: Role.VENDEDOR } } },
      },
    },
    skip: !companyId || !isAdminCompany,
  });

  const vendedores = (vendedoresData?.users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    lastName: u.lastName,
  }));

  const statusSomeConditions: Array<{
    salesPerson?: { id: { equals: string } };
    saasCompany?: { id: { equals: string } };
    pipelineStatus?: { equals: string };
  }> = [];
  if (!isAdminCompany) {
    statusSomeConditions.push({ salesPerson: { id: { equals: userId } } });
  }
  if (companyId != null) {
    statusSomeConditions.push({ saasCompany: { id: { equals: companyId } } });
  }
  if (selectedPipeline != null) {
    statusSomeConditions.push({ pipelineStatus: { equals: selectedPipeline } });
  }

  const where = {
    ...(!isAdminCompany ? { salesPerson: { some: { id: { equals: userId } } } } : {}),
    ...(companyId != null && {
      saasCompany: { some: { id: { equals: companyId } } },
    }),
    ...(statusSomeConditions.length > 0 && {
      status: {
        some: { AND: statusSomeConditions },
      },
    }),
    ...(debouncedSearch.length > 0 && {
      businessName: {
        contains: normalizeSearch(debouncedSearch),
        mode: "insensitive" as const,
      },
    }),
  };

  const setPageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) params.delete("page");
    else params.set("page", String(newPage));
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPageInUrl(1);
  }, [selectedPipeline, selectedCategory, debouncedSearch]);

  const { data: countData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: { where },
    skip: !userId,
  });

  const totalCount = countData?.techBusinessLeadsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADS_PAGE_SIZE));
  const effectivePage = totalCount > 0 ? Math.min(page, totalPages) : page;

  /** Filtro para que la API solo devuelva el status que coincida con esta company (y vendedor si no es admin). */
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
      : undefined;
  const salesPersonWhere2 =
    companyId != null ? { company: { id: { equals: companyId } } } : undefined;

  const { data, loading, error, refetch: refetchLeads } = useQuery<
    TechBusinessLeadsResponse,
    TechBusinessLeadsVariables
  >(TECH_BUSINESS_LEADS_QUERY, {
    variables: {
      where,
      statusWhere: statusWhere ?? {},
      salesPersonWhere2: salesPersonWhere2 ?? {},
      take: LEADS_PAGE_SIZE,
      skip: (effectivePage - 1) * LEADS_PAGE_SIZE,
    },
    skip: !userId,
  });

  const leads = data?.techBusinessLeads ?? [];

  const client = useApolloClient();

  const [updateLead] = useMutation<
    UpdateTechBusinessLeadMutation,
    UpdateTechBusinessLeadVariables
  >(UPDATE_TECH_BUSINESS_LEAD_MUTATION);

  const [createLeadStatus] = useMutation<
    CreateTechStatusBusinessLeadMutation,
    CreateTechStatusBusinessLeadVariables
  >(CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION);

  const handleToggleLead = useCallback((leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((leadIds: string[]) => {
    setSelectedLeadIds((prev) => {
      const allSelected = leadIds.length > 0 && leadIds.every((id) => prev.has(id));
      if (allSelected) return new Set<string>();
      return new Set(leadIds);
    });
  }, []);

  const handleAssignToVendedor = useCallback(async () => {
    if (!assignToVendedorId || selectedLeadIds.size === 0) return;
    try {
      const leadIdsArray = Array.from(selectedLeadIds);
      const { data: existingStatusData } = await client.query<
        TechStatusBusinessLeadsByLeadsAndSalesPersonResponse,
        TechStatusBusinessLeadsByLeadsAndSalesPersonVariables
      >({
        query: TECH_STATUS_BUSINESS_LEADS_BY_LEADS_AND_SALES_PERSON_QUERY,
        variables: {
          where: {
            businessLead: { id: { in: leadIdsArray } },
            salesPerson: { id: { equals: assignToVendedorId } },
          },
        },
      });
      const leadIdsWithExistingStatus = new Set(
        (existingStatusData?.techStatusBusinessLeads ?? []).map(
          (s) => s.businessLead.id
        )
      );

      for (const leadId of selectedLeadIds) {
        await updateLead({
          variables: {
            where: { id: leadId },
            data: { salesPerson: { connect: [{ id: assignToVendedorId }] } },
          },
        });
        if (!leadIdsWithExistingStatus.has(leadId)) {
          await createLeadStatus({
            variables: {
              data: {
                businessLead: { connect: { id: leadId } },
                salesPerson: { connect: { id: assignToVendedorId } },
                saasCompany: companyId ? { connect: { id: companyId } } : undefined,
                pipelineStatus: PIPELINE_STATUS.DETECTADO,
                opportunityLevel: null,
              },
            },
          });
        }
      }
      sileo.success({
        title: "Leads asignados",
        description: `Se asignaron ${selectedLeadIds.size} lead(s) al vendedor.`,
      });
      setSelectedLeadIds(new Set());
      setAssignToVendedorId(null);
      await refetchLeads();
    } catch (e) {
      sileo.error({
        title: "Error al asignar",
        description: e instanceof Error ? e.message : "No se pudieron asignar los leads.",
      });
    }
  }, [assignToVendedorId, selectedLeadIds, updateLead, createLeadStatus, refetchLeads, client, companyId]);

  const handleAssign = useCallback(async () => {
    setAssigning(true);
    try {
      await handleAssignToVendedor();
    } finally {
      setAssigning(false);
    }
  }, [handleAssignToVendedor]);

  useEffect(() => {
    if (countData != null && totalPages >= 1 && page > totalPages)
      setPageInUrl(totalPages);
  }, [countData, totalPages, page]);

  if (!companyId) {
    return (
      <EmptyCompanySection
        userId={userId}
        onSuccess={async () => {
          await refetchUserCompany();
          await refreshUser();
        }}
      />
    );
  }

  return (
    <SubscriptionProvider companyId={companyId}>
      <div className="w-full space-y-6">
        <CurrentPlanSection />

        <StatsSection userId={userId} companyId={companyId} isAdminCompany={isAdminCompany} salesComission={userData?.user?.salesComission ?? 0} />

      {/* Título + filtros por pipeline + tabla */}
      <div>
        <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-4">
          Clientes ({totalCount})
        </h2>
        <FiltersLeadsSection
          selectedPipeline={selectedPipeline}
          onPipelineChange={setSelectedPipeline}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          vendedores={vendedores}
          assignToVendedorId={assignToVendedorId}
          onAssignToVendedorChange={setAssignToVendedorId}
          selectedLeadCount={selectedLeadIds.size}
          onAssign={handleAssign}
          isAssigning={assigning}
          onCancelAssign={() => {
            setAssignToVendedorId(null);
            setSelectedLeadIds(new Set());
          }}
        />
        <SalesLeadsTable
          leads={leads}
          loading={loading}
          error={error}
          assignMode={assignToVendedorId != null}
          selectedLeadIds={selectedLeadIds}
          onToggleLead={handleToggleLead}
          onToggleAll={handleToggleAll}
          totalCount={totalCount}
          pageSize={LEADS_PAGE_SIZE}
          currentPage={effectivePage}
          onPageChange={setPageInUrl}
        />
      </div>
    </div>
    </SubscriptionProvider>
  );
}
