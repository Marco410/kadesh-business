"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, LinkSquare02Icon, PlusSignIcon, StarIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminStatusBadge,
  adminButtonClass,
  adminSelectClass,
  surfaceClass,
} from "../ui";
import AdminStoreProductEditor from "./AdminStoreProductEditor";
import {
  ADMIN_STORE_PRODUCTS_PAGE_SIZE,
  ADMIN_STORE_TAXONOMY_TAKE,
  STORE_INVENTORY,
  STORE_NEW_PRODUCT,
  STORE_SOURCE,
  STORE_SOURCE_CLASS,
  STORE_SOURCE_LABELS,
  STORE_SOURCE_OPTIONS,
  STORE_STATUS_CLASS,
  STORE_STATUS_DOT,
  STORE_STATUS_LABELS,
  formatCents,
  storeProductPublicUrl,
} from "./constants";
import {
  ADMIN_STORE_OPTIONS_QUERY,
  ADMIN_STORE_PRODUCTS_QUERY,
  UPDATE_ADMIN_STORE_PRODUCT_MUTATION,
  type AdminStoreOptionsResponse,
  type AdminStoreProductRow,
  type AdminStoreProductsResponse,
} from "./queries";

const STATUS_ORDER = ["active", "draft", "paused", "archived"];

function stockLabel(row: AdminStoreProductRow): { text: string; warn: boolean } {
  if (row.source === STORE_SOURCE.MERCADO_LIBRE) return { text: "Se vende en Mercado Libre", warn: false };
  if (row.inventoryPolicy === STORE_INVENTORY.UNTRACKED) return { text: "Sobre pedido", warn: false };
  if (row.stockTotal <= 0) return { text: "Sin stock", warn: true };
  return { text: `${row.stockTotal.toLocaleString("es-MX")} en stock`, warn: false };
}

/**
 * Tienda → Productos: every product of the store, whatever its status, with search, filters and
 * the editor. The open product lives in `?producto=` (`nuevo` opens the editor empty).
 */
export default function AdminStoreProductsPanel() {
  const searchParams = useSearchParams();
  const { setParams } = useAdminNavigation();
  const selected = searchParams.get("producto");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [outOfStock, setOutOfStock] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(
    () => ({
      search: debouncedSearch.trim() || null,
      status: status || null,
      source: source || null,
      categoryId: categoryId || null,
      outOfStock: outOfStock || null,
      take: ADMIN_STORE_PRODUCTS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_STORE_PRODUCTS_PAGE_SIZE,
    }),
    [categoryId, debouncedSearch, outOfStock, page, source, status],
  );

  const { data, loading, error, refetch } = useQuery<AdminStoreProductsResponse>(ADMIN_STORE_PRODUCTS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  // Shared with the editor: Apollo answers the second one from cache.
  const { data: options } = useQuery<AdminStoreOptionsResponse>(ADMIN_STORE_OPTIONS_QUERY, {
    variables: { take: ADMIN_STORE_TAXONOMY_TAKE },
    fetchPolicy: "cache-first",
  });
  const [updateProduct] = useMutation(UPDATE_ADMIN_STORE_PRODUCT_MUTATION);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = data?.adminStoreProducts.items ?? [];
  const total = data?.adminStoreProducts.total ?? 0;
  const statusCounts = data?.adminStoreProducts.statusCounts ?? [];
  const allCount = statusCounts.reduce((sum, entry) => sum + entry.count, 0);

  const statusOptions = [
    { value: "", label: "Todos", count: allCount },
    ...STATUS_ORDER.map((value) => ({
      value,
      label: STORE_STATUS_LABELS[value],
      count: statusCounts.find((entry) => entry.key === value)?.count ?? 0,
      dot: STORE_STATUS_DOT[value],
    })),
  ];

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const openProduct = (id: string | null) => setParams({ producto: id }, id ? "push" : "replace");

  async function toggleFeatured(row: AdminStoreProductRow) {
    setBusyId(row.id);
    try {
      await updateProduct({ variables: { id: row.id, data: { isFeatured: !row.isFeatured } } });
      await refetch();
    } catch (err) {
      sileo.error({ title: "No se pudo cambiar", description: adminErrorText(err, "Intenta de nuevo.") });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminStoreProductEditor
        productId={selected}
        onClose={() => openProduct(null)}
        onSaved={() => void refetch()}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <AdminSearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder="Buscar por nombre, SKU o id externo"
          />
        </div>
        <AdminButton icon={PlusSignIcon} onClick={() => openProduct(STORE_NEW_PRODUCT)}>
          Nuevo producto
        </AdminButton>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <AdminFilterChips options={statusOptions} value={status} onChange={resetPage(setStatus)} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 text-sm text-dash-soft">
            <input
              type="checkbox"
              checked={outOfStock}
              onChange={(event) => resetPage(setOutOfStock)(event.target.checked)}
              className="size-4 accent-orange-500"
            />
            Solo sin stock
          </label>
          <select
            value={source}
            onChange={(event) => resetPage(setSource)(event.target.value)}
            aria-label="Origen"
            className={`${adminSelectClass} sm:w-48`}
          >
            <option value="">Todos los orígenes</option>
            {STORE_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(event) => resetPage(setCategoryId)(event.target.value)}
            aria-label="Categoría"
            className={`${adminSelectClass} sm:w-56`}
          >
            <option value="">Todas las categorías</option>
            {(options?.storeCategories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.parent ? `${category.parent.name} › ${category.name}` : category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudieron cargar los productos. Intenta de nuevo.")} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin productos"
          description={
            allCount === 0
              ? "Agrega el primero con «Nuevo producto»."
              : "Ningún producto coincide con los filtros."
          }
        />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const stock = stockLabel(row);
            const publicUrl = row.status === "active" ? storeProductPublicUrl(row.slug) : null;
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => openProduct(row.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  {row.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.coverUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="size-14 shrink-0 rounded-xl bg-dash-surface-2" />
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-dash-ink">{row.name}</span>
                      <AdminStatusBadge
                        label={STORE_STATUS_LABELS[row.status] ?? row.status}
                        className={STORE_STATUS_CLASS[row.status] ?? STORE_STATUS_CLASS.draft}
                      />
                      <AdminStatusBadge
                        label={STORE_SOURCE_LABELS[row.source] ?? row.source}
                        className={STORE_SOURCE_CLASS[row.source] ?? STORE_SOURCE_CLASS.own}
                      />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-muted">
                      {[row.category, row.brand, row.variantsCount > 1 ? `${row.variantsCount} variantes` : null]
                        .filter(Boolean)
                        .join(" · ") || "Sin categoría"}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        stock.warn ? "font-semibold text-red-700 dark:text-red-400" : "text-dash-faint"
                      }`}
                    >
                      {stock.text}
                      {row.priceCents <= 0 ? " · Sin precio: no se muestra en la tienda" : ""}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-right">
                    <span className="block font-semibold tabular-nums text-dash-ink">
                      {row.priceCents > 0 ? formatCents(row.priceCents) : "—"}
                    </span>
                    {row.compareAtPriceCents ? (
                      <span className="block text-xs tabular-nums text-dash-faint line-through">
                        {formatCents(row.compareAtPriceCents)}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-xs text-dash-muted"
                    title="Calificación y número de reseñas"
                  >
                    <HugeiconsIcon icon={StarIcon} size={14} />
                    {row.ratingCount > 0 ? `${row.ratingAverage.toFixed(1)} (${row.ratingCount})` : "Sin reseñas"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleFeatured(row)}
                    disabled={busyId === row.id}
                    aria-pressed={row.isFeatured}
                    aria-label={row.isFeatured ? "Quitar de destacados" : "Destacar"}
                    title={row.isFeatured ? "Quitar de destacados" : "Destacar en la tienda"}
                    className={adminButtonClass({
                      variant: "outline",
                      size: "icon-sm",
                      className: row.isFeatured ? "border-orange-400 text-orange-600 dark:text-orange-300" : "text-dash-soft",
                    })}
                  >
                    <HugeiconsIcon icon={StarIcon} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openProduct(row.id)}
                    aria-label="Editar producto"
                    title="Editar producto"
                    className={adminButtonClass({ variant: "outline", size: "icon-sm", className: "text-dash-soft" })}
                  >
                    <HugeiconsIcon icon={Edit02Icon} size={18} />
                  </button>
                  {publicUrl ? (
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver en la tienda"
                      title="Ver en la tienda"
                      className={adminButtonClass({ variant: "outline", size: "icon-sm", className: "text-dash-soft" })}
                    >
                      <HugeiconsIcon icon={LinkSquare02Icon} size={18} />
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination
        totalCount={total}
        pageSize={ADMIN_STORE_PRODUCTS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
