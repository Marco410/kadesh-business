"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
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
import AssignLeadsBar from "./AssignLeadsBar";
import { SubscriptionProvider, useSubscription } from "./SubscriptionContext";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import { PIPELINE_STATUS, PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Download04Icon } from "@hugeicons/core-free-icons";
import { hasPlanFeature } from "./helpers/plan-features";
import { downloadLeadsExcel } from "./exportLeadsExcel";
import { buildClientLeadsQueryVariables } from "./helpers/client-leads-query";
import { SupportContactSection } from "kadesh/components/shared";
import {
  DEFAULT_LEADS_PAGE_SIZE,
  parseLeadsPageSize,
  type LeadsPageSize,
} from "./leadsPagination";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";

const MAX_LEADS_EXPORT = 10_000;

const SALES_LEADS_URL_KEYS = [
  "pipeline",
  "category",
  "source",
  "vendedor",
  "q",
  "city",
  "estado",
  "country",
  "page",
  "limit",
] as const;

interface SalesLeadsUrlFilters {
  selectedPipeline: string | null;
  selectedCategory: string | null;
  selectedSource: string | null;
  filterByVendedorId: string | null;
  debouncedSearch: string;
  debouncedCity: string;
  debouncedState: string;
  debouncedCountry: string;
  page: number;
  pageSize: LeadsPageSize;
}

function parseSalesFiltersFromSearchParams(
  sp: Pick<URLSearchParams, "get">,
): SalesLeadsUrlFilters {
  return {
    selectedPipeline: sp.get("pipeline"),
    selectedCategory: sp.get("category"),
    selectedSource: sp.get("source"),
    filterByVendedorId: sp.get("vendedor"),
    debouncedSearch: sp.get("q") ?? "",
    debouncedCity: sp.get("city") ?? "",
    debouncedState: sp.get("estado") ?? "",
    debouncedCountry: sp.get("country") ?? "",
    page: parsePageParam(sp.get("page")),
    pageSize: parseLeadsPageSize(sp.get("limit")),
  };
}

function applySalesFiltersToUrlSearchParams(
  params: URLSearchParams,
  state: SalesLeadsUrlFilters,
) {
  for (const k of SALES_LEADS_URL_KEYS) {
    params.delete(k);
  }
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== DEFAULT_LEADS_PAGE_SIZE)
    params.set("limit", String(state.pageSize));
  if (state.selectedPipeline) params.set("pipeline", state.selectedPipeline);
  if (state.selectedCategory) params.set("category", state.selectedCategory);
  if (state.selectedSource) params.set("source", state.selectedSource);
  if (state.filterByVendedorId)
    params.set("vendedor", state.filterByVendedorId);
  if (state.debouncedSearch) params.set("q", state.debouncedSearch);
  if (state.debouncedCity) params.set("city", state.debouncedCity);
  if (state.debouncedState) params.set("estado", state.debouncedState);
  if (state.debouncedCountry) params.set("country", state.debouncedCountry);
}

/** True si los filtros en estado ya coinciden con la query (sin mirar `page`). Evita replace(…page=1) tras atrás/adelante. */
function salesFilterFieldsMatchUrl(
  sp: Pick<URLSearchParams, "get">,
  s: {
    selectedPipeline: string | null;
    selectedCategory: string | null;
    selectedSource: string | null;
    filterByVendedorId: string | null;
    debouncedSearch: string;
    debouncedCity: string;
    debouncedState: string;
    debouncedCountry: string;
  },
): boolean {
  const f = parseSalesFiltersFromSearchParams(sp);
  return (
    f.selectedPipeline === s.selectedPipeline &&
    f.selectedCategory === s.selectedCategory &&
    f.selectedSource === s.selectedSource &&
    f.filterByVendedorId === s.filterByVendedorId &&
    f.debouncedSearch === s.debouncedSearch &&
    f.debouncedCity === s.debouncedCity &&
    f.debouncedState === s.debouncedState &&
    f.debouncedCountry === s.debouncedCountry
  );
}

interface SalesSectionProps {
  userId: string;
}

function parsePageParam(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

/** Normaliza texto para búsqueda: quita acentos y diacríticos. */
function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function SalesSection({ userId }: SalesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFromUrl = parseSalesFiltersFromSearchParams(searchParams);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(
    initialFromUrl.selectedPipeline,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialFromUrl.selectedCategory,
  );
  const [selectedSource, setSelectedSource] = useState<string | null>(
    initialFromUrl.selectedSource,
  );
  const [filterByVendedorId, setFilterByVendedorId] = useState<string | null>(
    initialFromUrl.filterByVendedorId,
  );
  const [searchInput, setSearchInput] = useState(
    initialFromUrl.debouncedSearch,
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    initialFromUrl.debouncedSearch,
  );
  const [cityInput, setCityInput] = useState(initialFromUrl.debouncedCity);
  const [debouncedCity, setDebouncedCity] = useState(
    initialFromUrl.debouncedCity,
  );
  const [stateInput, setStateInput] = useState(initialFromUrl.debouncedState);
  const [debouncedState, setDebouncedState] = useState(
    initialFromUrl.debouncedState,
  );
  const [countryInput, setCountryInput] = useState(
    initialFromUrl.debouncedCountry,
  );
  const [debouncedCountry, setDebouncedCountry] = useState(
    initialFromUrl.debouncedCountry,
  );
  const [assignToVendedorId, setAssignToVendedorId] = useState<string | null>(
    null,
  );
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set(),
  );
  const [assigning, setAssigning] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const { user, refreshUser } = useUser();
  const { subscription } = useSubscription();

  const page = parsePageParam(searchParams.get("page"));
  const pageSize = parseLeadsPageSize(searchParams.get("limit"));

  const lastSyncedSearchParamsRef = useRef<string | null>(null);
  const clientesShellRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const serialized = searchParams.toString();
    if (lastSyncedSearchParamsRef.current === null) {
      lastSyncedSearchParamsRef.current = serialized;
      return;
    }
    if (lastSyncedSearchParamsRef.current === serialized) return;
    lastSyncedSearchParamsRef.current = serialized;
    const f = parseSalesFiltersFromSearchParams(searchParams);
    setSelectedPipeline(f.selectedPipeline);
    setSelectedCategory(f.selectedCategory);
    setSelectedSource(f.selectedSource);
    setFilterByVendedorId(f.filterByVendedorId);
    setSearchInput(f.debouncedSearch);
    setDebouncedSearch(f.debouncedSearch);
    setCityInput(f.debouncedCity);
    setDebouncedCity(f.debouncedCity);
    setStateInput(f.debouncedState);
    setDebouncedState(f.debouncedState);
    setCountryInput(f.debouncedCountry);
    setDebouncedCountry(f.debouncedCountry);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCity(cityInput.trim()), 300);
    return () => clearTimeout(t);
  }, [cityInput]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedState(stateInput.trim()), 300);
    return () => clearTimeout(t);
  }, [stateInput]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCountry(countryInput.trim()), 300);
    return () => clearTimeout(t);
  }, [countryInput]);

  const { data: userData, refetch: refetchUserCompany } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  useGSAP(
    () => {
      if (!companyId) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bands = gsap.utils.toArray<HTMLElement>(".clientes-band");
        if (bands.length === 0) return;
        gsap.fromTo(
          bands,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.055,
            ease: "cubic-bezier(0.2, 0, 0, 1)",
            clearProps: "transform,opacity,visibility",
          },
        );
      });
      return () => mm.revert();
    },
    { scope: clientesShellRef, dependencies: [companyId] },
  );

  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const isUserCompany =
    user?.roles?.some((r) => r.name === Role.USER_COMPANY) ?? false;
  const hasCompanyWideLeadScope = isAdminCompany || isUserCompany;

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
    skip: !companyId || !hasCompanyWideLeadScope,
  });

  const vendedores = (vendedoresData?.users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    lastName: u.lastName,
  }));

  const statusSomeConditions: Array<{
    salesPerson?: { id: { equals: string } } | null;
    saasCompany?: { id: { equals: string } };
    pipelineStatus?: { equals: string };
  }> = [];

  if (!hasCompanyWideLeadScope) {
    statusSomeConditions.push({ salesPerson: { id: { equals: userId } } });
  }
  if (companyId != null) {
    statusSomeConditions.push({ saasCompany: { id: { equals: companyId } } });
  }
  if (selectedPipeline != null) {
    statusSomeConditions.push({ pipelineStatus: { equals: selectedPipeline } });
  }
  if (
    filterByVendedorId != null &&
    filterByVendedorId !== "" &&
    filterByVendedorId !== "sin_asignar"
  ) {
    statusSomeConditions.push({
      salesPerson: { id: { equals: filterByVendedorId } },
    });
  }

  const where = {
    ...(filterByVendedorId === "sin_asignar"
      ? { salesPerson: { none: {} } }
      : !hasCompanyWideLeadScope
        ? { salesPerson: { some: { id: { equals: userId } } } }
        : {}),
    ...(companyId != null && {
      saasCompany: { some: { id: { equals: companyId } } },
    }),
    ...(statusSomeConditions.length > 0 && {
      status: {
        some: { AND: statusSomeConditions },
      },
    }),
    ...(selectedCategory != null &&
      selectedCategory !== "" && {
        category: { equals: selectedCategory },
      }),
    ...(selectedSource != null &&
      selectedSource !== "" && {
        source: { equals: selectedSource },
      }),
    ...(debouncedSearch.length > 0 && {
      businessName: {
        contains: normalizeSearch(debouncedSearch),
        mode: "insensitive" as const,
      },
    }),
    ...(debouncedCity.length > 0 && {
      city: {
        contains: normalizeSearch(debouncedCity),
        mode: "insensitive" as const,
      },
    }),
    ...(debouncedState.length > 0 && {
      state: {
        contains: normalizeSearch(debouncedState),
        mode: "insensitive" as const,
      },
    }),
    ...(debouncedCountry.length > 0 && {
      country: {
        contains: normalizeSearch(debouncedCountry),
        mode: "insensitive" as const,
      },
    }),
  };

  const navigateLeadsUrl = useCallback(
    (newPage: number, replace: boolean, nextPageSize: LeadsPageSize = pageSize) => {
      const params = new URLSearchParams(searchParams.toString());
      applySalesFiltersToUrlSearchParams(params, {
        selectedPipeline,
        selectedCategory,
        selectedSource,
        filterByVendedorId,
        debouncedSearch,
        debouncedCity,
        debouncedState,
        debouncedCountry,
        page: newPage,
        pageSize: nextPageSize,
      });
      const q = params.toString();
      const href = q ? `${pathname}?${q}` : pathname;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [
      searchParams,
      pathname,
      router,
      selectedPipeline,
      selectedCategory,
      selectedSource,
      filterByVendedorId,
      debouncedSearch,
      debouncedCity,
      debouncedState,
      debouncedCountry,
      pageSize,
    ],
  );

  const navigateLeadsUrlRef = useRef(navigateLeadsUrl);
  navigateLeadsUrlRef.current = navigateLeadsUrl;

  const pushLeadsPage = useCallback((newPage: number) => {
    navigateLeadsUrlRef.current(newPage, false);
  }, []);

  const pushLeadsPageSize = useCallback((nextPageSize: LeadsPageSize) => {
    navigateLeadsUrlRef.current(1, true, nextPageSize);
  }, []);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (
      salesFilterFieldsMatchUrl(searchParams, {
        selectedPipeline,
        selectedCategory,
        selectedSource,
        filterByVendedorId,
        debouncedSearch,
        debouncedCity,
        debouncedState,
        debouncedCountry,
      })
    ) {
      return;
    }
    navigateLeadsUrlRef.current(1, true);
  }, [
    searchParams,
    selectedPipeline,
    selectedCategory,
    selectedSource,
    filterByVendedorId,
    debouncedSearch,
    debouncedCity,
    debouncedState,
    debouncedCountry,
  ]);

  const { data: countData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: { where },
    skip: !userId,
  });

  const totalCount = countData?.techBusinessLeadsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage = totalCount > 0 ? Math.min(page, totalPages) : page;

  const leadsQueryVariables = buildClientLeadsQueryVariables({
    where,
    companyId,
    hasCompanyWideLeadScope,
    userId,
    take: pageSize,
    skip: (effectivePage - 1) * pageSize,
    orderBy: [{ createdAt: "desc" }],
  });

  const {
    data,
    previousData,
    loading,
    error,
    refetch: refetchLeads,
  } = useQuery<TechBusinessLeadsResponse, TechBusinessLeadsVariables>(
    TECH_BUSINESS_LEADS_QUERY,
    {
      variables: leadsQueryVariables,
      skip: !userId,
      notifyOnNetworkStatusChange: true,
    },
  );

  const leads =
    data?.techBusinessLeads ?? previousData?.techBusinessLeads ?? [];

  const client = useApolloClient();

  const exportLeadsContextRef = useRef({
    where,
    statusWhere: leadsQueryVariables.statusWhere,
    salesPersonWhere2: leadsQueryVariables.salesPersonWhere2,
    totalCount,
  });
  exportLeadsContextRef.current = {
    where,
    statusWhere: leadsQueryVariables.statusWhere,
    salesPersonWhere2: leadsQueryVariables.salesPersonWhere2,
    totalCount,
  };

  const handleExportExcel = useCallback(async () => {
    if (!userId) return;
    const ctx = exportLeadsContextRef.current;
    if (ctx.totalCount === 0) {
      sileo.error({
        title: "Sin datos",
        description: "No hay clientes para exportar con los filtros actuales.",
      });
      return;
    }
    setExportingExcel(true);
    try {
      const take = Math.min(ctx.totalCount, MAX_LEADS_EXPORT);
      const { data: exportData, error: exportError } = await client.query<
        TechBusinessLeadsResponse,
        TechBusinessLeadsVariables
      >({
        query: TECH_BUSINESS_LEADS_QUERY,
        variables: {
          where: ctx.where,
          statusWhere: ctx.statusWhere ?? {},
          salesPersonWhere2: ctx.salesPersonWhere2 ?? {},
          take,
          skip: 0,
          orderBy: [{ createdAt: "desc" }],
        },
        fetchPolicy: "network-only",
      });
      if (exportError) throw exportError;
      const allLeads = exportData?.techBusinessLeads ?? [];
      downloadLeadsExcel(allLeads, hasCompanyWideLeadScope);
      if (ctx.totalCount > MAX_LEADS_EXPORT) {
        sileo.warning({
          title: "Exportación parcial",
          description: `Solo se exportaron los primeros ${MAX_LEADS_EXPORT} de ${ctx.totalCount} clientes. Ajusta los filtros para exportar el resto.`,
        });
      } else {
        sileo.success({
          title: "Exportación lista",
          description: `Se descargaron ${allLeads.length} cliente(s) (CSV para Excel o Numbers).`,
        });
      }
    } catch (e) {
      sileo.error({
        title: "Error al exportar",
        description:
          e instanceof Error ? e.message : "No se pudo generar el archivo.",
      });
    } finally {
      setExportingExcel(false);
    }
  }, [client, hasCompanyWideLeadScope, userId]);

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
      const allSelected =
        leadIds.length > 0 && leadIds.every((id) => prev.has(id));
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
          (s) => s.businessLead.id,
        ),
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
                saasCompany: companyId
                  ? { connect: { id: companyId } }
                  : undefined,
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
        description:
          e instanceof Error ? e.message : "No se pudieron asignar los leads.",
      });
    }
  }, [
    assignToVendedorId,
    selectedLeadIds,
    updateLead,
    createLeadStatus,
    refetchLeads,
    client,
    companyId,
  ]);

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
      navigateLeadsUrlRef.current(totalPages, true);
  }, [countData, totalPages, page]);

  useEffect(() => {
    if (!userId || loading || !data) return;
    const ctx = exportLeadsContextRef.current;
    const prefetchPage = (targetPage: number) => {
      void client.query<
        TechBusinessLeadsResponse,
        TechBusinessLeadsVariables
      >({
        query: TECH_BUSINESS_LEADS_QUERY,
        variables: {
          where: ctx.where,
          statusWhere: ctx.statusWhere ?? {},
          salesPersonWhere2: ctx.salesPersonWhere2 ?? {},
          take: pageSize,
          skip: (targetPage - 1) * pageSize,
          orderBy: [{ createdAt: "desc" }],
        },
        fetchPolicy: "cache-first",
      });
    };
    if (effectivePage < totalPages) prefetchPage(effectivePage + 1);
    if (effectivePage > 1) prefetchPage(effectivePage - 1);
  }, [data, loading, userId, effectivePage, totalPages, pageSize, client]);

  const hasAddOwnLeadsFeature = hasPlanFeature(
    subscription?.planFeatures,
    PLAN_FEATURE_KEYS.ADD_OWN_LEADS,
  );
  const hasExportLeadsFeature = hasPlanFeature(
    subscription?.planFeatures,
    PLAN_FEATURE_KEYS.EXPORT_EXCEL,
  );
  const canAssign =
    hasCompanyWideLeadScope &&
    vendedores.length > 0 &&
    hasPlanFeature(
      subscription?.planFeatures,
      PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON,
    );

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
        <div ref={clientesShellRef} className="space-y-4">
          <div className="clientes-band flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-[#212121] dark:text-white">
                Clientes
              </h2>
              <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
                <span className="font-medium text-[#212121] dark:text-white">
                  {userData?.user?.company?.name ?? "Tu empresa"}
                </span>
                {" · "}
                <span className="tabular-nums font-semibold text-orange-600 dark:text-orange-400">
                  {totalCount.toLocaleString("es-MX")}
                </span>{" "}
                {totalCount === 1 ? "cliente" : "clientes"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
              {hasExportLeadsFeature && (
                <button
                  type="button"
                  onClick={() => void handleExportExcel()}
                  disabled={totalCount === 0 || exportingExcel}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-orange-200/80 dark:border-orange-800/50 bg-orange-50/80 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:-translate-y-px active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-[transform,background-color,border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {exportingExcel ? (
                    <span className="size-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <HugeiconsIcon
                      icon={Download04Icon}
                      size={16}
                      strokeWidth={2}
                    />
                  )}
                  Exportar
                </button>
              )}
              {hasAddOwnLeadsFeature && (
                <button
                  type="button"
                  data-tour="clientes-add-lead"
                  onClick={() => router.push(Routes.panelAddLead)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-500 hover:bg-green-600 active:bg-green-700 hover:-translate-y-px active:scale-[0.98] shadow-sm shadow-green-500/20 hover:shadow-md hover:shadow-green-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-[transform,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
                >
                  <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2} />
                  Agregar cliente
                </button>
              )}
            </div>
          </div>
          <div className="clientes-band">
          <FiltersLeadsSection
            selectedPipeline={selectedPipeline}
            onPipelineChange={setSelectedPipeline}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            cityQuery={cityInput}
            onCityChange={setCityInput}
            stateQuery={stateInput}
            onStateChange={setStateInput}
            countryQuery={countryInput}
            onCountryChange={setCountryInput}
            filterByVendedorId={filterByVendedorId}
            onFilterByVendedorChange={setFilterByVendedorId}
            vendedores={vendedores}
            isAdminCompany={hasCompanyWideLeadScope}
          />
          </div>
          {canAssign && (
            <div className="clientes-band">
            <AssignLeadsBar
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
            </div>
          )}
          <div className="clientes-band">
          <SalesLeadsTable
            leads={leads}
            loading={loading}
            error={error}
            selectable={canAssign}
            selectedLeadIds={selectedLeadIds}
            onToggleLead={handleToggleLead}
            onToggleAll={handleToggleAll}
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={effectivePage}
            onPageChange={pushLeadsPage}
            onPageSizeChange={pushLeadsPageSize}
            isAdminCompany={hasCompanyWideLeadScope}
          />
          </div>
        </div>

        <StatsSection
          userId={userId}
          companyId={companyId}
          isAdminCompany={isAdminCompany}
          companyWideLeadScope={hasCompanyWideLeadScope}
          salesComission={userData?.user?.salesComission ?? 0}
        />

        <SupportContactSection
          whatsappMessage="Hola KADESH, tengo una consulta sobre mis clientes."
          emailSubject="Consulta sobre clientes — KADESH"
        />
      </div>
    </SubscriptionProvider>
  );
}
