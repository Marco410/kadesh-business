"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  SAAS_QUOTATION_PRODUCTS_LIST_QUERY,
  type SaasQuotationProductRow,
  type SaasQuotationProductsListResponse,
  type SaasQuotationProductsListVariables,
} from "./queries";
import {
  quotationTableWrapClass,
  quotationThClass,
  quotationTdClass,
} from "./quotation-table-classes";
import QuotationProductFormModal from "./QuotationProductFormModal";

const PAGE_SIZE = 10;

function formatMoney(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

function formatPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

export interface QuotationProductsTablePanelProps {
  userId: string;
}

export default function QuotationProductsTablePanel({
  userId,
}: QuotationProductsTablePanelProps) {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] =
    useState<SaasQuotationProductRow | null>(null);

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
  }, [companyId]);

  const where = useMemo(() => {
    if (!companyId) return null;
    return {
      quotation: {
        company: {
          id: { equals: companyId },
        },
      },
    };
  }, [companyId]);

  const skip = (page - 1) * PAGE_SIZE;

  const { data, loading, error, refetch } = useQuery<
    SaasQuotationProductsListResponse,
    SaasQuotationProductsListVariables
  >(SAAS_QUOTATION_PRODUCTS_LIST_QUERY, {
    variables: {
      where: where ?? { id: { equals: "__none__" } },
      orderBy: [{ createdAt: "desc" }],
      take: PAGE_SIZE + 1,
      skip,
    },
    skip: !companyId || !where,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const rawRows = data?.saasQuotationProducts ?? [];
  const hasNextPage = rawRows.length > PAGE_SIZE;
  const rows = hasNextPage ? rawRows.slice(0, PAGE_SIZE) : rawRows;
  const hasPrevPage = page > 1;

  const openCreate = () => {
    setEditingProduct(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (p: SaasQuotationProductRow) => {
    setEditingProduct(p);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSuccess = async () => {
    await refetch();
  };

  if (!companyId) {
    return (
      <div
        role="tabpanel"
        id="panel-productos"
        aria-labelledby="tab-productos"
        className="space-y-3"
      >
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          No se pudo obtener la empresa. Los ítems se filtran por cotizaciones de
          tu compañía.
        </p>
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id="panel-productos"
      aria-labelledby="tab-productos"
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
          Líneas de cotización vinculadas a cotizaciones de tu empresa.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Agregar producto / servicio
        </button>
      </div>

      <div className={quotationTableWrapClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr>
                <th className={quotationThClass}>Descripción</th>
                <th className={`${quotationThClass} text-right`}>P. unitario</th>
                <th className={`${quotationThClass} text-right`}>Cant.</th>
                <th className={`${quotationThClass} text-right`}>IVA</th>
                <th className={quotationThClass}>Descuento</th>
                <th className={`${quotationThClass} text-right`}>Total línea</th>
                <th className={`${quotationThClass} font-mono text-[11px]`}>
                  Cotización
                </th>
                <th className={quotationThClass}>Actualizado</th>
                <th className={`${quotationThClass} w-24 text-right`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${quotationTdClass} text-center py-12 text-[#616161] dark:text-[#9e9e9e]`}
                  >
                    Cargando…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${quotationTdClass} text-center py-10 text-red-600 dark:text-red-400`}
                  >
                    {error.message}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${quotationTdClass} text-center py-14 text-[#616161] dark:text-[#9e9e9e]`}
                  >
                      No hay productos o servicios de tu negocio.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className={`${quotationTdClass} max-w-[220px]`}>
                      <span className="line-clamp-2">
                        {row.description ?? "—"}
                      </span>
                    </td>
                    <td className={`${quotationTdClass} text-right tabular-nums`}>
                      {formatMoney(row.unitPrice)}
                    </td>
                    <td className={`${quotationTdClass} text-right tabular-nums`}>
                      {row.quantity ?? "—"}
                    </td>
                    <td className={`${quotationTdClass} text-right tabular-nums`}>
                      {formatPct(row.taxRate)}
                    </td>
                    <td className={quotationTdClass}>
                      <span className="text-xs">
                        {row.discountType ?? "—"}{" "}
                        {row.discountValue != null
                          ? `(${row.discountValue})`
                          : ""}
                      </span>
                    </td>
                    <td className={`${quotationTdClass} text-right tabular-nums font-medium`}>
                      {formatMoney(row.lineTotal)}
                    </td>
                    <td className={`${quotationTdClass} font-mono text-[11px] text-[#616161] dark:text-[#b0b0b0]`}>
                      {row.quotation?.id
                        ? `${row.quotation.id.slice(0, 8)}…`
                        : "—"}
                    </td>
                    <td className={`${quotationTdClass} text-xs whitespace-nowrap`}>
                      {formatDateShort(row.updatedAt, false)}
                    </td>
                    <td className={`${quotationTdClass} text-right`}>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                      >
                        <HugeiconsIcon icon={Edit01Icon} size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
            Página {page}
            {hasNextPage ? " · hay más resultados" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm text-[#212121] dark:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm text-[#212121] dark:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <QuotationProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        product={modalMode === "edit" ? editingProduct : null}
      />
    </div>
  );
}
