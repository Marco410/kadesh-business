"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Mail01Icon, CallIcon, Chart01Icon, Search01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { COMPANY_VENDEDORES_WITH_STATS_QUERY, CompanyVendedoresWithStatsResponse, CompanyVendedoresWithStatsVariables } from "./queries";
import VendedorDetailModal from "./VendedorDetailModal";

interface VendedoresSectionProps {
  userId: string;
}

function formatName(
  name: string,
  lastName: string | null,
  secondLastName: string | null
): string {
  const parts = [name, lastName, secondLastName].filter(Boolean);
  return parts.join(" ");
}

/** Normaliza texto para búsqueda: quita acentos y diacríticos. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default function VendedoresSection({ userId }: VendedoresSectionProps) {
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data: vendedoresData, loading, error } = useQuery<
    CompanyVendedoresWithStatsResponse,
    CompanyVendedoresWithStatsVariables
  >(COMPANY_VENDEDORES_WITH_STATS_QUERY, {
    variables: {
      where: {
        company: companyId ? { id: { equals: companyId } } : undefined,
        roles: { some: { name: { equals: Role.VENDEDOR } } },
      },
    },
    skip: !companyId,
  });

  const vendedores = vendedoresData?.users ?? [];

  const [searchInput, setSearchInput] = useState("");
  const [selectedVendedorId, setSelectedVendedorId] = useState<string | null>(null);

  const filteredVendedores = useMemo(() => {
    const query = normalizeSearch(searchInput);
    if (!query) return vendedores;
    return vendedores.filter((v) => {
      const fullName = normalizeSearch(
        formatName(v.name, v.lastName, v.secondLastName)
      );
      return fullName.includes(query);
    });
  }, [vendedores, searchInput]);

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <p className="text-[#616161] dark:text-[#b0b0b0]">
          No tienes una empresa asociada. Asocia un negocio desde la sección de ventas para gestionar vendedores.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">Cargando vendedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
        <p className="text-red-700 dark:text-red-300">
          No se pudieron cargar los vendedores. {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#212121] dark:text-white mb-1">
            Vendedores ({filteredVendedores.length}
            {searchInput.trim() ? ` de ${vendedores.length}` : ""})
          </h2>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Lista de vendedores de tu empresa y sus métricas.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] dark:text-[#b0b0b0]">
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-white placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-sm"
            aria-label="Buscar vendedores por nombre"
          />
        </div>
      </div>

      {vendedores.length === 0 ? (
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0] mb-4">
            <HugeiconsIcon icon={UserIcon} size={28} />
          </span>
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            Aún no hay vendedores en tu empresa. Agrégalos desde la configuración de tu plan.
          </p>
        </div>
      ) : searchInput.trim() && filteredVendedores.length === 0 ? (
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm text-center">
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            No hay vendedores que coincidan con &quot;{searchInput.trim()}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendedores.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-5 shadow-sm hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400">
                  <HugeiconsIcon icon={UserIcon} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#212121] dark:text-white truncate">
                    {formatName(v.name, v.lastName, v.secondLastName)}
                  </p>
                  {v.email && (
                    <a
                      href={`mailto:${v.email}`}
                      className="mt-0.5 flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 truncate"
                    >
                      <HugeiconsIcon icon={Mail01Icon} size={14} />
                      {v.email}
                    </a>
                  )}
                  {v.phone && (
                    <a
                      href={`tel:${v.phone}`}
                      className="mt-0.5 flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
                    >
                      <HugeiconsIcon icon={CallIcon} size={14} />
                      {v.phone}
                    </a>
                  )}
                </div>
                {v.salesPersonVerified && (
                  <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                    Verificado
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] grid grid-cols-2 gap-3">
                <StatItem
                  label="Leads asignados"
                  value={v.businessLeadsAssignedCount ?? 0}
                  icon={<HugeiconsIcon icon={Chart01Icon} size={16} />}
                />
                <StatItem label="Actividades" value={v.salesActivitiesCount ?? 0} />
                <StatItem label="Propuestas" value={v.proposalsCount ?? 0} />
                <StatItem label="Seguimientos" value={v.followUpTasksCount ?? 0} />
              </div>
              {v.salesComission != null && (
                <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Comisión: <span className="font-medium text-[#212121] dark:text-white">{v.salesComission}%</span>
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                <button
                  type="button"
                  onClick={() => setSelectedVendedorId(v.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm font-medium text-[#212121] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <HugeiconsIcon icon={ViewIcon} size={18} />
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <VendedorDetailModal
        vendedorId={selectedVendedorId}
        isOpen={selectedVendedorId != null}
        onClose={() => setSelectedVendedorId(null)}
      />
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-[#616161] dark:text-[#b0b0b0]">
          {icon}
        </span>
      )}
      <div>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{label}</p>
        <p className="text-lg font-semibold text-[#212121] dark:text-white tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
