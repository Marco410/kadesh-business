"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { imageFileError } from "../blog-image";
import { adminErrorText } from "../errors";
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
import { ADMIN_STORE_TAXONOMY_TAKE, inputToInt } from "./constants";
import {
  ADMIN_STORE_BRANDS_QUERY,
  ADMIN_STORE_CATEGORIES_QUERY,
  ADMIN_STORE_OPTIONS_QUERY,
  CREATE_ADMIN_STORE_BRAND_MUTATION,
  CREATE_ADMIN_STORE_CATEGORY_MUTATION,
  UPDATE_ADMIN_STORE_BRAND_MUTATION,
  UPDATE_ADMIN_STORE_CATEGORY_MUTATION,
  type AdminStoreBrandRow,
  type AdminStoreCategoryRow,
} from "./queries";

type Kind = "category" | "brand";

/** One row of either list, in the shape the panel shows. */
type Row = {
  id: string;
  name: string;
  slug: string | null;
  isActive: boolean;
  imageUrl: string | null;
  order: number;
  parentId: string | null;
  parentName: string | null;
};

const COPY: Record<Kind, { one: string; add: string; emptyTitle: string; emptyText: string; imageLabel: string }> = {
  category: {
    one: "categoría",
    add: "Nueva categoría",
    emptyTitle: "Todavía no hay categorías",
    emptyText: "Agrega la primera para poder asignarla a un producto.",
    imageLabel: "Imagen",
  },
  brand: {
    one: "marca",
    add: "Nueva marca",
    emptyTitle: "Todavía no hay marcas",
    emptyText: "Agrega la primera para poder asignarla a un producto.",
    imageLabel: "Logo",
  },
};

type Draft = { id: string | null; name: string; parentId: string; order: string; isActive: boolean; file: File | null };

const EMPTY_DRAFT: Draft = { id: null, name: "", parentId: "", order: "0", isActive: true, file: null };

/**
 * Tienda → Categorías and Tienda → Marcas: two short lists with the same shape (name, image,
 * active). Categories also have a parent (two levels) and an order.
 */
export default function AdminStoreTaxonomyPanel({ kind }: { kind: Kind }) {
  const isCategory = kind === "category";
  const copy = COPY[kind];

  const categories = useQuery<{ storeCategories: AdminStoreCategoryRow[] }>(ADMIN_STORE_CATEGORIES_QUERY, {
    variables: { take: ADMIN_STORE_TAXONOMY_TAKE },
    fetchPolicy: "network-only",
    skip: !isCategory,
  });
  const brands = useQuery<{ storeBrands: AdminStoreBrandRow[] }>(ADMIN_STORE_BRANDS_QUERY, {
    variables: { take: ADMIN_STORE_TAXONOMY_TAKE },
    fetchPolicy: "network-only",
    skip: isCategory,
  });
  const active = isCategory ? categories : brands;

  // The product form and the filters read these lists from `AdminStoreOptions`: keep it fresh.
  const refetchQueries = [{ query: ADMIN_STORE_OPTIONS_QUERY, variables: { take: ADMIN_STORE_TAXONOMY_TAKE } }];
  const [createCategory] = useMutation(CREATE_ADMIN_STORE_CATEGORY_MUTATION, { refetchQueries });
  const [updateCategory] = useMutation(UPDATE_ADMIN_STORE_CATEGORY_MUTATION, { refetchQueries });
  const [createBrand] = useMutation(CREATE_ADMIN_STORE_BRAND_MUTATION, { refetchQueries });
  const [updateBrand] = useMutation(UPDATE_ADMIN_STORE_BRAND_MUTATION, { refetchQueries });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const rows: Row[] = isCategory
    ? (categories.data?.storeCategories ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        isActive: row.isActive !== false,
        imageUrl: row.image?.url ?? null,
        order: row.order ?? 0,
        parentId: row.parent?.id ?? null,
        parentName: row.parent?.name ?? null,
      }))
    : (brands.data?.storeBrands ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        isActive: row.isActive !== false,
        imageUrl: row.logo?.url ?? null,
        order: 0,
        parentId: null,
        parentName: null,
      }));

  // Two levels only: a category that has children, or is one, cannot take a parent of its own.
  const parentIds = new Set(rows.map((row) => row.parentId).filter(Boolean));
  const parentOptions = rows.filter((row) => !row.parentId && row.id !== draft?.id);
  const draftHasChildren = Boolean(draft?.id && parentIds.has(draft.id));

  function startEdit(row: Row) {
    setDraft({
      id: row.id,
      name: row.name,
      parentId: row.parentId ?? "",
      order: String(row.order),
      isActive: row.isActive,
      file: null,
    });
  }

  function onFile(file: File | undefined) {
    if (!file || !draft) return;
    const message = imageFileError(file);
    if (message) return void sileo.warning({ title: message });
    setDraft({ ...draft, file });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) return void sileo.warning({ title: `Escribe el nombre de la ${copy.one}.` });
    const order = inputToInt(draft.order);
    if (isCategory && (order === null || Number.isNaN(order))) {
      return void sileo.warning({ title: "El orden debe ser un número entero." });
    }

    const data: Record<string, unknown> = { name, isActive: draft.isActive };
    if (draft.file) data[isCategory ? "image" : "logo"] = { upload: draft.file };
    if (isCategory) {
      data.order = order;
      if (draft.parentId) data.parent = { connect: { id: draft.parentId } };
      else if (draft.id) data.parent = { disconnect: true };
    }

    setSaving(true);
    try {
      if (draft.id) {
        await (isCategory ? updateCategory : updateBrand)({ variables: { id: draft.id, data } });
      } else {
        await (isCategory ? createCategory : createBrand)({ variables: { data } });
      }
      sileo.success({ title: draft.id ? "Cambios guardados" : `Se agregó la ${copy.one}` });
      setDraft(null);
      await active.refetch();
    } catch (err) {
      sileo.error({
        title: `No se pudo guardar la ${copy.one}`,
        description: adminErrorText(err, "Intenta de nuevo."),
      });
    } finally {
      setSaving(false);
    }
  }

  // Parents first, each followed by its children.
  const ordered: Row[] = isCategory
    ? rows
        .filter((row) => !row.parentId)
        .flatMap((parent) => [parent, ...rows.filter((row) => row.parentId === parent.id)])
    : rows;

  return (
    <div className="flex flex-col gap-4">
      <AdminButton icon={PlusSignIcon} onClick={() => setDraft(EMPTY_DRAFT)} className="self-start">
        {copy.add}
      </AdminButton>

      <AdminModal
        open={Boolean(draft)}
        onClose={saving ? () => undefined : () => setDraft(null)}
        title={draft?.id ? `Editar ${copy.one}` : copy.add}
        subtitle="La dirección en la tienda se arma sola con el nombre y no cambia al renombrar."
        ariaLabel={draft?.id ? `Editar ${copy.one}` : copy.add}
      >
        {draft ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className={adminLabelClass}>Nombre</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className={adminInputClass}
                maxLength={80}
                autoFocus
              />
            </label>
            {isCategory ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={adminLabelClass}>Dentro de</span>
                  <select
                    value={draft.parentId}
                    onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}
                    disabled={draftHasChildren}
                    className={adminSelectClass}
                  >
                    <option value="">Ninguna (categoría principal)</option>
                    {parentOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {draftHasChildren ? (
                    <span className="mt-1 block text-xs text-dash-faint">
                      Ya tiene subcategorías: solo hay dos niveles.
                    </span>
                  ) : null}
                </label>
                <label className="block">
                  <span className={adminLabelClass}>Orden</span>
                  <input
                    value={draft.order}
                    onChange={(event) => setDraft({ ...draft, order: event.target.value })}
                    className={adminInputClass}
                    inputMode="numeric"
                  />
                  <span className="mt-1 block text-xs text-dash-faint">El número menor sale primero.</span>
                </label>
              </div>
            ) : null}
            <div>
              <span className={adminLabelClass}>{copy.imageLabel}</span>
              <label className="inline-flex h-11 max-w-full cursor-pointer items-center truncate rounded-full border border-dash-line px-4 text-sm font-semibold text-dash-ink">
                {draft.file ? draft.file.name : "Elegir imagen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => onFile(event.target.files?.[0])}
                />
              </label>
            </div>
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 text-[15px] text-dash-ink">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                className="size-4 accent-orange-500"
              />
              Visible en la tienda
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <AdminButton variant="ghost" onClick={() => setDraft(null)} disabled={saving}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>

      {active.error ? (
        <AdminErrorState message={adminErrorText(active.error, "No se pudo cargar la lista. Intenta de nuevo.")} />
      ) : active.loading && rows.length === 0 ? (
        <AdminLoadingRows rows={4} />
      ) : rows.length === 0 ? (
        <AdminEmptyState title={copy.emptyTitle} description={copy.emptyText} />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {ordered.map((row) => (
            <li key={row.id} className={`flex items-center gap-3 p-4 ${row.parentId ? "pl-8 sm:pl-12" : ""}`}>
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
              ) : (
                <span className="size-12 shrink-0 rounded-xl bg-dash-surface-2" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-dash-ink">{row.name}</span>
                  {!row.isActive ? (
                    <AdminStatusBadge label="Oculta" className="bg-dash-surface-2 text-dash-soft" />
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-dash-faint">
                  {row.parentName ? `En ${row.parentName} · ` : ""}/{row.slug ?? "—"}
                </p>
              </div>
              <AdminButton variant="ghost" size="sm" onClick={() => startEdit(row)}>
                Editar
              </AdminButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
