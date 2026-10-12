"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { PIPELINE_STATUS_COLORS } from "kadesh/constants/constans";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE } from "../../../../constants";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  formatPersonName,
  surfaceClass,
} from "../../../../ui";
import {
  ADMIN_COMPANY_LEADS_QUERY,
  type AdminCompanyLeadsResponse,
} from "../../../crm-queries";
import { pipelineLabel, sortByPipeline } from "../../format";
import LeadQuickView from "../../LeadQuickView";

const neutralBadge = "bg-[#e0e0e0] text-[#616161] dark:bg-[#3a3a3a] dark:text-[#b0b0b0]";

export default function LeadsView({
  companyId,
  pipeline,
}: {
  companyId: string;
  pipeline: Array<{ key: string; count: number }>;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const debounced = useDebouncedValue(search);

  const variables = useMemo(() => {
    const companyIs = { id: { equals: companyId } };
    const filters: Record<string, unknown>[] = [{ saasCompany: { some: companyIs } }];
    if (stage !== "all") {
      filters.push({
        status: {
          some: { AND: [{ saasCompany: companyIs }, { pipelineStatus: { equals: stage } }] },
        },
      });
    }
    const q = debounced.trim();
    if (q) {
      filters.push({
        OR: [
          { businessName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    return {
      where: filters.length === 1 ? filters[0] : { AND: filters },
      statusWhere: { saasCompany: companyIs },
      sellerWhere: { company: companyIs },
      take: ADMIN_PAGE_SIZE,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
    };
  }, [companyId, debounced, page, stage]);

  const { data, loading, error } = useQuery<AdminCompanyLeadsResponse>(
    ADMIN_COMPANY_LEADS_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );
  const rows = data?.techBusinessLeads ?? [];
  const total = data?.techBusinessLeadsCount ?? 0;

  const stageOptions = useMemo(
    () => [
      { value: "all", label: "Todas" },
      ...sortByPipeline(pipeline).map((row) => ({
        value: row.key,
        label: `${pipelineLabel(row.key)} · ${row.count}`,
      })),
    ],
    [pipeline],
  );

  return (
    <div className="flex flex-col gap-3">
      <AdminSearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Buscar negocio, teléfono, ciudad o categoría"
      />
      {pipeline.length > 0 ? (
        <AdminFilterChips
          label="Etapa"
          options={stageOptions}
          value={stage}
          onChange={(value) => {
            setStage(value);
            setPage(1);
          }}
        />
      ) : null}

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin leads con ese filtro"
          description="Cuando extraigan o den de alta clientes, aparecen aquí."
        />
      ) : (
        <>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            {total} lead{total === 1 ? "" : "s"}. Toca uno para ver su historial en esta empresa.
          </p>
          <div className={`${surfaceClass} relative overflow-x-auto`}>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Negocio</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Fuente</th>
                  <th className="px-4 py-3">Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((lead) => {
                  const status = lead.status[0];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setOpenLeadId(lead.id)}
                      className="cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenLeadId(lead.id);
                          }}
                          className="text-left font-medium text-[#212121] hover:text-orange-600 dark:text-white dark:hover:text-orange-400 cursor-pointer"
                        >
                          {lead.businessName}
                        </button>
                        <p className="text-xs text-[#9e9e9e]">{lead.category || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <AdminStatusBadge
                          label={pipelineLabel(status?.pipelineStatus)}
                          className={
                            (status?.pipelineStatus &&
                              PIPELINE_STATUS_COLORS[status.pipelineStatus]) ??
                            neutralBadge
                          }
                        />
                        {status?.opportunityLevel ? (
                          <p className="mt-1 text-xs text-[#9e9e9e]">
                            Oportunidad {status.opportunityLevel.toLowerCase()}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                        {lead.salesPerson.length
                          ? lead.salesPerson
                              .map((seller) => formatPersonName(seller.name, seller.lastName))
                              .join(", ")
                          : "Sin asignar"}
                      </td>
                      <td className="px-4 py-3 align-top tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                        {lead.phone || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                        {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-[#616161] dark:text-[#b0b0b0]">
                        {lead.source || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-[#9e9e9e]">
                        {formatDateShort(lead.createdAt, false)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination
            totalCount={total}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}

      <LeadQuickView
        leadId={openLeadId}
        companyId={companyId}
        onClose={() => setOpenLeadId(null)}
      />
    </div>
  );
}
