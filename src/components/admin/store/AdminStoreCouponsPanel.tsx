"use client";

import { useState, type FormEvent } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { normalizeSearchText } from "kadesh/utils/normalizeSearchText";
import { adminErrorText } from "../errors";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminModal,
  AdminStatusBadge,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  surfaceClass,
} from "../ui";
import {
  ADMIN_STORE_COUPONS_TAKE,
  ADMIN_STORE_COUPON_CODE_MAX,
  ADMIN_STORE_COUPON_PRODUCT_SEARCH_TAKE,
  ADMIN_STORE_COUPON_SCOPE_MAX,
  ADMIN_STORE_TAXONOMY_TAKE,
  STORE_COUPON_STATE_CLASS,
  STORE_COUPON_STATE_LABELS,
  STORE_COUPON_TYPE,
  STORE_COUPON_TYPE_OPTIONS,
  centsToInput,
  formatCents,
  inputToCents,
  inputToInt,
  isoToLocalInput,
  localInputToIso,
  normalizeCouponCode,
  storeCouponBenefit,
  storeCouponState,
} from "./constants";
import {
  ADMIN_STORE_COUPONS_QUERY,
  ADMIN_STORE_COUPON_PRODUCT_SEARCH_QUERY,
  ADMIN_STORE_COUPON_SCOPE_QUERY,
  CREATE_ADMIN_STORE_COUPON_MUTATION,
  UPDATE_ADMIN_STORE_COUPON_MUTATION,
  type AdminStoreCouponProductOption,
  type AdminStoreCouponRow,
  type AdminStoreCouponScope,
  type AdminStoreCouponsResponse,
} from "./coupon-queries";
import { ADMIN_STORE_OPTIONS_QUERY, type AdminStoreOptionsResponse } from "./queries";

type Draft = {
  id: string | null;
  code: string;
  description: string;
  type: string;
  /** Percent (whole number) or pesos, depending on `type`. */
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  startsAt: string;
  endsAt: string;
  /** `endsAt` as it was saved (same input format): an old coupon that already ended stays editable. */
  savedEndsAt: string;
  usageLimit: string;
  usageLimitPerUser: string;
  firstOrderOnly: boolean;
  isActive: boolean;
  categoryIds: string[];
  products: AdminStoreCouponProductOption[];
  usedCount: number;
};

const EMPTY_DRAFT: Draft = {
  id: null,
  code: "",
  description: "",
  type: STORE_COUPON_TYPE.PERCENT,
  value: "",
  minSubtotal: "",
  maxDiscount: "",
  startsAt: "",
  endsAt: "",
  savedEndsAt: "",
  usageLimit: "",
  usageLimitPerUser: "",
  firstOrderOnly: false,
  isActive: true,
  categoryIds: [],
  products: [],
  usedCount: 0,
};

function draftFrom(row: AdminStoreCouponRow): Draft {
  return {
    id: row.id,
    code: row.code,
    description: row.description ?? "",
    type: row.type,
    value: row.type === STORE_COUPON_TYPE.FIXED ? centsToInput(row.value) : row.value ? String(row.value) : "",
    minSubtotal: row.minSubtotalCents ? centsToInput(row.minSubtotalCents) : "",
    maxDiscount: row.maxDiscountCents ? centsToInput(row.maxDiscountCents) : "",
    startsAt: isoToLocalInput(row.startsAt),
    endsAt: isoToLocalInput(row.endsAt),
    savedEndsAt: isoToLocalInput(row.endsAt),
    usageLimit: row.usageLimit != null ? String(row.usageLimit) : "",
    usageLimitPerUser: row.usageLimitPerUser != null ? String(row.usageLimitPerUser) : "",
    firstOrderOnly: Boolean(row.firstOrderOnly),
    isActive: row.isActive !== false,
    categoryIds: [],
    products: [],
    usedCount: row.usedCount,
  };
}

/**
 * What is wrong with the dates of the form, or `null`. The end must be after the start and, when
 * it is being set (new coupon or a changed date), in the future. Same rules as kadesh-back.
 */
function couponDatesError(draft: Draft, nowMs: number): string | null {
  const startsAt = localInputToIso(draft.startsAt);
  const endsAt = localInputToIso(draft.endsAt);
  if (!endsAt) return null;
  const endsMs = new Date(endsAt).getTime();
  const settingEnd = !draft.id || draft.endsAt !== draft.savedEndsAt;
  if (settingEnd && endsMs <= nowMs) return "La fecha de fin ya pasó. Elige una fecha futura.";
  if (startsAt && endsMs <= new Date(startsAt).getTime()) return "La fecha de fin debe ser posterior a la de inicio.";
  return null;
}

/** The conditions of a coupon in one line, for its row in the list. */
function couponConditions(row: AdminStoreCouponRow): string {
  const parts: string[] = [];
  if (row.minSubtotalCents) parts.push(`desde ${formatCents(row.minSubtotalCents)}`);
  if (row.maxDiscountCents) parts.push(`tope ${formatCents(row.maxDiscountCents)}`);
  if (row.firstOrderOnly) parts.push("primera compra");
  if (row.usageLimitPerUser != null) parts.push(`${row.usageLimitPerUser} por persona`);
  if (row.startsAt) parts.push(`desde el ${formatDateShort(row.startsAt)}`);
  if (row.endsAt) parts.push(`hasta el ${formatDateShort(row.endsAt)}`);
  return parts.join(" · ");
}

/**
 * Tienda → Cupones: the discount codes of the store. A coupon is never deleted (orders keep its
 * code): it is switched off. How many times it was used is counted by the backend.
 */
export default function AdminStoreCouponsPanel() {
  const list = useQuery<AdminStoreCouponsResponse>(ADMIN_STORE_COUPONS_QUERY, {
    variables: { take: ADMIN_STORE_COUPONS_TAKE },
    fetchPolicy: "network-only",
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [scopeLoading, setScopeLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [datesError, setDatesError] = useState<string | null>(null);
  // Read once per render of the list: good enough to tell "expired" from "active".
  const [now] = useState(() => Date.now());

  // Categories come from the same cached query the product form uses.
  const options = useQuery<AdminStoreOptionsResponse>(ADMIN_STORE_OPTIONS_QUERY, {
    variables: { take: ADMIN_STORE_TAXONOMY_TAKE },
    skip: !draft,
  });
  const [loadScope] = useLazyQuery<AdminStoreCouponScope>(ADMIN_STORE_COUPON_SCOPE_QUERY, { fetchPolicy: "network-only" });

  const search = useDebouncedValue(normalizeSearchText(productSearch), 300);
  const found = useQuery<{ storeProducts: AdminStoreCouponProductOption[] }>(ADMIN_STORE_COUPON_PRODUCT_SEARCH_QUERY, {
    variables: { search, take: ADMIN_STORE_COUPON_PRODUCT_SEARCH_TAKE },
    skip: !draft || search.length < 2,
  });

  const [createCoupon] = useMutation(CREATE_ADMIN_STORE_COUPON_MUTATION);
  const [updateCoupon] = useMutation(UPDATE_ADMIN_STORE_COUPON_MUTATION);

  const rows = list.data?.storeCoupons ?? [];
  const total = list.data?.storeCouponsCount ?? rows.length;

  function close() {
    setDraft(null);
    setProductSearch("");
    setDatesError(null);
  }

  /** Changes a date of the form and checks it right away (inline message under the dates). */
  function setDates(next: Draft) {
    setDraft(next);
    setDatesError(couponDatesError(next, Date.now()));
  }

  async function startEdit(row: AdminStoreCouponRow) {
    setDraft(draftFrom(row));
    setDatesError(null);
    setProductSearch("");
    setScopeLoading(true);
    try {
      const result = await loadScope({ variables: { id: row.id, take: ADMIN_STORE_COUPON_SCOPE_MAX } });
      const scope = result.data?.storeCoupon;
      if (result.error || !scope) throw result.error ?? new Error("not found");
      // Only if this coupon's form is still the open one.
      setDraft((current) =>
        current?.id === row.id
          ? { ...current, categoryIds: scope.categories.map((category) => category.id), products: scope.products }
          : current,
      );
    } catch (err) {
      sileo.error({ title: "No se pudo abrir el cupón", description: adminErrorText(err, "Intenta de nuevo.") });
      setDraft((current) => (current?.id === row.id ? null : current));
    } finally {
      setScopeLoading(false);
    }
  }

  function toggleCategory(id: string) {
    if (!draft) return;
    const has = draft.categoryIds.includes(id);
    setDraft({ ...draft, categoryIds: has ? draft.categoryIds.filter((value) => value !== id) : [...draft.categoryIds, id] });
  }

  function addProduct(product: AdminStoreCouponProductOption) {
    if (!draft || draft.products.some((item) => item.id === product.id)) return;
    if (draft.products.length >= ADMIN_STORE_COUPON_SCOPE_MAX) {
      return void sileo.warning({ title: `Un cupón puede limitarse a ${ADMIN_STORE_COUPON_SCOPE_MAX} productos como máximo.` });
    }
    setDraft({ ...draft, products: [...draft.products, product] });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft || scopeLoading) return;
    const warn = (title: string) => void sileo.warning({ title });

    const code = normalizeCouponCode(draft.code);
    if (code.length < 3) return warn("El código necesita al menos 3 letras o números.");

    let value = 0;
    if (draft.type === STORE_COUPON_TYPE.PERCENT) {
      const percent = inputToInt(draft.value);
      if (percent === null || Number.isNaN(percent) || percent < 1 || percent > 100) {
        return warn("El porcentaje debe ser un número entero de 1 a 100.");
      }
      value = percent;
    } else if (draft.type === STORE_COUPON_TYPE.FIXED) {
      const cents = inputToCents(draft.value);
      if (cents === null || Number.isNaN(cents) || cents < 1) return warn("Escribe el monto del descuento.");
      value = cents;
    }

    const minSubtotalCents = inputToCents(draft.minSubtotal);
    if (Number.isNaN(minSubtotalCents)) return warn("La compra mínima no es un monto válido.");
    const maxDiscountCents = draft.type === STORE_COUPON_TYPE.PERCENT ? inputToCents(draft.maxDiscount) : null;
    if (Number.isNaN(maxDiscountCents)) return warn("El tope de descuento no es un monto válido.");
    const usageLimit = inputToInt(draft.usageLimit);
    if (Number.isNaN(usageLimit) || usageLimit === 0) return warn("Los usos en total deben ser un número entero mayor a cero, o vacío.");
    const usageLimitPerUser = inputToInt(draft.usageLimitPerUser);
    if (Number.isNaN(usageLimitPerUser) || usageLimitPerUser === 0) {
      return warn("Los usos por persona deben ser un número entero mayor a cero, o vacío.");
    }
    const startsAt = localInputToIso(draft.startsAt);
    const endsAt = localInputToIso(draft.endsAt);
    const dateProblem = couponDatesError(draft, Date.now());
    setDatesError(dateProblem);
    if (dateProblem) return warn(dateProblem);

    const categoryRefs = draft.categoryIds.map((id) => ({ id }));
    const productRefs = draft.products.map((product) => ({ id: product.id }));
    const data: Record<string, unknown> = {
      code,
      description: draft.description.trim(),
      type: draft.type,
      value,
      minSubtotalCents: minSubtotalCents || null,
      maxDiscountCents: maxDiscountCents || null,
      startsAt,
      // An unchanged end date is not sent: the backend checks a date being set is in the future,
      // and an old coupon that already ended must stay editable (e.g. to switch it off).
      ...(draft.id && draft.endsAt === draft.savedEndsAt ? {} : { endsAt }),
      usageLimit,
      usageLimitPerUser,
      firstOrderOnly: draft.firstOrderOnly,
      isActive: draft.isActive,
      categories: draft.id ? { set: categoryRefs } : { connect: categoryRefs },
      products: draft.id ? { set: productRefs } : { connect: productRefs },
    };

    setSaving(true);
    try {
      if (draft.id) await updateCoupon({ variables: { id: draft.id, data } });
      else await createCoupon({ variables: { data } });
      sileo.success({ title: draft.id ? "Cambios guardados" : `Se creó el cupón ${code}` });
      close();
      await list.refetch();
    } catch (err) {
      const text = adminErrorText(err, "Intenta de nuevo.");
      sileo.error({
        title: "No se pudo guardar el cupón",
        description: /unique|único|Unique/.test(text) ? "Ya existe un cupón con ese código." : text,
      });
    } finally {
      setSaving(false);
    }
  }

  const categories = options.data?.storeCategories ?? [];
  const isPercent = draft?.type === STORE_COUPON_TYPE.PERCENT;
  const isFreeShipping = draft?.type === STORE_COUPON_TYPE.FREE_SHIPPING;
  const pickable = (found.data?.storeProducts ?? []).filter(
    (product) => !draft?.products.some((item) => item.id === product.id),
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminButton icon={PlusSignIcon} onClick={() => {
          setDraft(EMPTY_DRAFT);
          setDatesError(null);
        }} className="self-start">
        Nuevo cupón
      </AdminButton>

      <AdminModal
        open={Boolean(draft)}
        onClose={saving ? () => undefined : close}
        title={draft?.id ? `Editar cupón ${draft.code}` : "Nuevo cupón"}
        subtitle="El descuento se aplica a los productos, nunca al envío. Un pedido usa un solo cupón."
        ariaLabel={draft?.id ? "Editar cupón" : "Nuevo cupón"}
        size="lg"
      >
        {draft ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={adminLabelClass}>Código</span>
                <input
                  value={draft.code}
                  onChange={(event) => setDraft({ ...draft, code: normalizeCouponCode(event.target.value) })}
                  className={`${adminInputClass} font-mono uppercase tracking-wide`}
                  maxLength={ADMIN_STORE_COUPON_CODE_MAX}
                  placeholder="BIENVENIDA10"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus={!draft.id}
                />
                <span className="mt-1 block text-xs text-dash-faint">
                  {draft.usedCount > 0
                    ? `Ya se usó ${draft.usedCount} ${draft.usedCount === 1 ? "vez" : "veces"}: cambiarlo no cambia los pedidos hechos.`
                    : "Letras, números y guiones, sin espacios."}
                </span>
              </label>
              <label className="block">
                <span className={adminLabelClass}>Para qué es (interno)</span>
                <input
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  className={adminInputClass}
                  maxLength={160}
                  placeholder="Campaña de diciembre en Instagram"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={adminLabelClass}>Tipo</span>
                <select
                  value={draft.type}
                  onChange={(event) => setDraft({ ...draft, type: event.target.value, value: "" })}
                  className={adminSelectClass}
                >
                  {STORE_COUPON_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {!isFreeShipping ? (
                <label className="block">
                  <span className={adminLabelClass}>{isPercent ? "Porcentaje (%)" : "Monto (MXN)"}</span>
                  <input
                    value={draft.value}
                    onChange={(event) => setDraft({ ...draft, value: event.target.value })}
                    className={adminInputClass}
                    inputMode={isPercent ? "numeric" : "decimal"}
                    placeholder={isPercent ? "10" : "50"}
                  />
                </label>
              ) : null}
              {isPercent ? (
                <label className="block">
                  <span className={adminLabelClass}>Tope del descuento (MXN)</span>
                  <input
                    value={draft.maxDiscount}
                    onChange={(event) => setDraft({ ...draft, maxDiscount: event.target.value })}
                    className={adminInputClass}
                    inputMode="decimal"
                    placeholder="Sin tope"
                  />
                </label>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={adminLabelClass}>Compra mínima (MXN)</span>
                <input
                  value={draft.minSubtotal}
                  onChange={(event) => setDraft({ ...draft, minSubtotal: event.target.value })}
                  className={adminInputClass}
                  inputMode="decimal"
                  placeholder="Sin mínimo"
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Usos en total</span>
                <input
                  value={draft.usageLimit}
                  onChange={(event) => setDraft({ ...draft, usageLimit: event.target.value })}
                  className={adminInputClass}
                  inputMode="numeric"
                  placeholder="Sin límite"
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Usos por persona</span>
                <input
                  value={draft.usageLimitPerUser}
                  onChange={(event) => setDraft({ ...draft, usageLimitPerUser: event.target.value })}
                  className={adminInputClass}
                  inputMode="numeric"
                  placeholder="Sin límite"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={adminLabelClass}>Empieza</span>
                <input
                  type="datetime-local"
                  value={draft.startsAt}
                  onChange={(event) => setDates({ ...draft, startsAt: event.target.value })}
                  className={adminInputClass}
                />
                <span className="mt-1 block text-xs text-dash-faint">Vacío: desde que se guarda.</span>
              </label>
              <label className="block">
                <span className={adminLabelClass}>Termina</span>
                <input
                  type="datetime-local"
                  value={draft.endsAt}
                  onChange={(event) => setDates({ ...draft, endsAt: event.target.value })}
                  className={adminInputClass}
                  aria-invalid={datesError ? true : undefined}
                  aria-describedby={datesError ? "coupon-dates-error" : undefined}
                />
                <span className="mt-1 block text-xs text-dash-faint">Vacío: no vence. En la hora de este equipo.</span>
              </label>
              {datesError ? (
                <p id="coupon-dates-error" role="alert" className="text-sm text-red-700 dark:text-red-400 sm:col-span-2">
                  {datesError}
                </p>
              ) : null}
            </div>

            <fieldset disabled={scopeLoading} className="flex flex-col gap-3 rounded-2xl border border-dash-line p-4">
              <legend className="px-1 text-[13px] font-semibold text-dash-soft">
                A qué aplica {scopeLoading ? "(cargando…)" : ""}
              </legend>
              <p className="text-sm text-dash-muted">
                Sin marcar nada aplica a todo el carrito. Con categorías o productos, solo a esos.
              </p>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {categories.map((category) => (
                    <label key={category.id} className="inline-flex h-11 cursor-pointer items-center gap-2 text-sm text-dash-ink">
                      <input
                        type="checkbox"
                        checked={draft.categoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="size-4 accent-orange-500"
                      />
                      {category.parent ? `${category.parent.name} › ${category.name}` : category.name}
                    </label>
                  ))}
                </div>
              ) : null}
              <label className="block">
                <span className={adminLabelClass}>Productos</span>
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  className={adminInputClass}
                  placeholder="Busca un producto por nombre"
                  autoComplete="off"
                />
              </label>
              {search.length >= 2 ? (
                found.loading ? (
                  <p className="text-sm text-dash-faint">Buscando…</p>
                ) : pickable.length === 0 ? (
                  <p className="text-sm text-dash-faint">Sin productos que agregar con ese nombre.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {pickable.map((product) => (
                      <li key={product.id}>
                        <AdminButton variant="outline" size="sm" icon={PlusSignIcon} onClick={() => addProduct(product)}>
                          {product.name}
                        </AdminButton>
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
              {draft.products.length > 0 ? (
                <ul className="flex flex-col divide-y divide-dash-line rounded-xl border border-dash-line">
                  {draft.products.map((product) => (
                    <li key={product.id} className="flex items-center justify-between gap-3 py-1 pl-3 pr-1">
                      <span className="min-w-0 truncate text-sm text-dash-ink">{product.name}</span>
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setDraft({ ...draft, products: draft.products.filter((item) => item.id !== product.id) })}
                      >
                        Quitar
                      </AdminButton>
                    </li>
                  ))}
                </ul>
              ) : null}
            </fieldset>

            <div className="flex flex-col">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-dash-ink">
                <input
                  type="checkbox"
                  checked={draft.firstOrderOnly}
                  onChange={(event) => setDraft({ ...draft, firstOrderOnly: event.target.checked })}
                  className="size-4 accent-orange-500"
                />
                Solo para la primera compra de la persona
              </label>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-dash-ink">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                  className="size-4 accent-orange-500"
                />
                Encendido (se puede usar)
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <AdminButton variant="ghost" onClick={close} disabled={saving}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit" disabled={saving || scopeLoading}>
                {saving ? "Guardando…" : "Guardar"}
              </AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>

      {list.error ? (
        <AdminErrorState message={adminErrorText(list.error, "No se pudieron cargar los cupones. Intenta de nuevo.")} />
      ) : list.loading && rows.length === 0 ? (
        <AdminLoadingRows rows={4} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Todavía no hay cupones"
          description="Crea el primero: un porcentaje, un monto fijo o envío gratis, con las condiciones que quieras."
        />
      ) : (
        <>
          <ul className={`${surfaceClass} divide-y divide-dash-line`}>
            {rows.map((row) => {
              const state = storeCouponState(row, now);
              const conditions = couponConditions(row);
              return (
                <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[15px] font-semibold tracking-wide text-dash-ink [overflow-wrap:anywhere]">
                        {row.code}
                      </span>
                      <AdminStatusBadge label={STORE_COUPON_STATE_LABELS[state]} className={STORE_COUPON_STATE_CLASS[state]} />
                    </p>
                    <p className="mt-0.5 text-sm text-dash-ink">{storeCouponBenefit(row)}</p>
                    {conditions ? <p className="mt-0.5 text-xs text-dash-faint">{conditions}</p> : null}
                    {row.description ? <p className="mt-0.5 text-xs text-dash-muted [overflow-wrap:anywhere]">{row.description}</p> : null}
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-dash-soft">
                    <span className="font-semibold text-dash-ink">{row.usedCount}</span>
                    {row.usageLimit != null ? ` de ${row.usageLimit}` : ""} {row.usedCount === 1 && row.usageLimit == null ? "uso" : "usos"}
                  </p>
                  <AdminButton variant="ghost" size="sm" onClick={() => void startEdit(row)}>
                    Editar
                  </AdminButton>
                </li>
              );
            })}
          </ul>
          {total > rows.length ? (
            <p className="text-sm text-dash-faint">
              Se muestran los {rows.length} más recientes de {total}.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
