"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { formatDateShort } from "kadesh/utils/format-date";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  surfaceClass,
} from "../ui";
import AdminStoreOrderDrawer from "./AdminStoreOrderDrawer";
import StoreOrderBadges from "./StoreOrderBadges";
import {
  ADMIN_STORE_ORDERS_PAGE_SIZE,
  STORE_ORDER_QUEUE_OPTIONS,
  STORE_PAYMENT_METHOD_LABELS,
  formatCents,
  type StoreOrderQueue,
} from "./constants";
import { ADMIN_STORE_ORDERS_QUERY, type AdminStoreOrdersResponse } from "./order-queries";

/** `?cola=`: no value = «Por surtir» (the daily work); `todos` = every order. */
function parseQueue(value: string | null): StoreOrderQueue {
  if (value === "todos") return "";
  return STORE_ORDER_QUEUE_OPTIONS.find((option) => option.value && option.value === value)?.value ?? "toFulfill";
}

/**
 * Tienda → Pedidos: the orders of the store by working queue (proofs to review, to fulfil,
 * waiting for payment…). The open order lives in `?pedido=`, so the bell can link straight to it;
 * `?cola=` sets the queue.
 */
export default function AdminStoreOrdersPanel() {
  const searchParams = useSearchParams();
  const { setParams } = useAdminNavigation();
  const selectedId = searchParams.get("pedido");
  const queue = parseQueue(searchParams.get("cola"));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  // The page belongs to one queue + search: changing either starts at page 1 in the same render,
  // so a chip click or a search sends one request (not one for the old filter's page 1 first).
  const pageKey = `${queue}|${debouncedSearch.trim()}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const page = pageState.key === pageKey ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ key: pageKey, page: next });

  const variables = useMemo(
    () => ({
      search: debouncedSearch.trim() || null,
      // Searching looks through every order, whatever the queue.
      queue: debouncedSearch.trim() ? null : queue || null,
      take: ADMIN_STORE_ORDERS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_STORE_ORDERS_PAGE_SIZE,
    }),
    [debouncedSearch, page, queue],
  );

  // Orders move between queues on their own (a buyer uploads a proof, a card payment lands, the
  // expiry cron cancels one), so a queue cached earlier is never shown: switching the queue, the
  // page or the search always asks the server (one request) and shows the loading rows until it
  // answers. Rows and counts then come from that same response, so they always agree.
  // `cache-first` afterwards only keeps re-renders from asking again; `refetch()` still goes out.
  const { data, previousData, loading, error, refetch } = useQuery<AdminStoreOrdersResponse>(ADMIN_STORE_ORDERS_QUERY, {
    variables,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  const rows = data?.adminStoreOrders.items ?? [];
  const total = data?.adminStoreOrders.total ?? 0;
  // While the next queue loads, the chips keep the counts of the last answer instead of blinking.
  const queueCounts = (data ?? previousData)?.adminStoreOrders.queues ?? [];
  const options = STORE_ORDER_QUEUE_OPTIONS.map((option) => ({
    ...option,
    count: queueCounts.find((entry) => entry.key === option.value)?.count ?? null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <AdminStoreOrderDrawer
        orderId={selectedId}
        onClose={() => setParams({ pedido: null })}
        // Only the queue on screen is asked again; the others ask the server when opened.
        onChanged={() => void refetch()}
      />

      <AdminSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por folio, nombre, correo o teléfono"
      />
      <AdminFilterChips
        options={options}
        value={queue}
        onChange={(value) => setParams({ cola: value === "toFulfill" ? null : value || "todos" })}
      />

      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudieron cargar los pedidos. Intenta de nuevo.")} />
      ) : loading && !data ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin pedidos aquí"
          description={
            debouncedSearch.trim() ? "Ningún pedido coincide con la búsqueda." : "No hay pedidos en esta cola por ahora."
          }
        />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => setParams({ pedido: row.id }, "push")}
                className="flex w-full cursor-pointer flex-col gap-2 p-4 text-left transition-colors hover:bg-orange-500/[0.04] sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums text-dash-ink">{row.number}</span>
                    <StoreOrderBadges order={row} />
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-dash-soft">
                    {row.customerName || "Sin nombre"}
                    {row.guestCheckout ? " · cuenta nueva" : ""}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-dash-faint">
                    {[row.shipCity, row.shipStateName].filter(Boolean).join(", ") || "Sin dirección"} ·{" "}
                    {formatDateShort(row.createdAt)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-0.5">
                  <span className="font-semibold tabular-nums text-dash-ink">{formatCents(row.totalCents)}</span>
                  <span className="text-xs text-dash-muted">
                    {row.itemsCount} {row.itemsCount === 1 ? "pieza" : "piezas"} ·{" "}
                    {STORE_PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AdminPagination
        totalCount={total}
        pageSize={ADMIN_STORE_ORDERS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
