"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { getCategoryLabel } from "kadesh/components/blog/constants";
import { imageFileError } from "./blog-image";
import { adminErrorText } from "./errors";
import {
  ADMIN_BLOG_CATEGORIES_QUERY,
  ADMIN_BLOG_LIST_TAKE,
  CREATE_ADMIN_CATEGORY_MUTATION,
  UPDATE_ADMIN_CATEGORY_MUTATION,
  type AdminBlogCategoriesResponse,
  type AdminBlogCategoryRow,
} from "./blog-queries";
import {
  POST_PRODUCT,
  POST_PRODUCT_BADGE,
  POST_PRODUCT_LABELS,
  POST_PRODUCT_OPTIONS,
} from "./constants";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminStatusBadge,
  surfaceClass,
} from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

export default function AdminBlogCategoriesPanel() {
  const [editing, setEditing] = useState<AdminBlogCategoryRow | null>(null);
  const [name, setName] = useState("");
  const [product, setProduct] = useState<string>(POST_PRODUCT.SAAS);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery<AdminBlogCategoriesResponse>(
    ADMIN_BLOG_CATEGORIES_QUERY,
    {
      variables: { take: ADMIN_BLOG_LIST_TAKE },
      fetchPolicy: "network-only",
    },
  );

  const [createCategory] = useMutation(CREATE_ADMIN_CATEGORY_MUTATION);
  const [updateCategory] = useMutation(UPDATE_ADMIN_CATEGORY_MUTATION);

  const categories = data?.categories ?? [];
  const nameLocked = Boolean(editing && (editing.postsCount ?? 0) > 0);

  function resetForm() {
    setEditing(null);
    setName("");
    setProduct(POST_PRODUCT.SAAS);
    setImageFile(null);
  }

  function startEdit(category: AdminBlogCategoryRow) {
    setEditing(category);
    setName(category.name ?? "");
    setProduct(category.product ?? POST_PRODUCT.SAAS);
    setImageFile(null);
  }

  function onImageChange(file: File | undefined) {
    if (!file) return;
    const message = imageFileError(file);
    if (message) {
      sileo.warning({ title: message });
      return;
    }
    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      sileo.warning({ title: "Escribe el nombre de la categoría." });
      return;
    }

    const payload: Record<string, unknown> = { product };
    if (!editing || (!nameLocked && trimmed !== (editing.name ?? ""))) {
      payload.name = trimmed;
    }
    if (imageFile) payload.image = { upload: imageFile };

    setSaving(true);
    try {
      if (editing) {
        await updateCategory({
          variables: { id: editing.id, data: payload },
        });
        sileo.success({ title: "Categoría actualizada" });
      } else {
        await createCategory({ variables: { data: payload } });
        sileo.success({ title: "Categoría agregada" });
      }
      resetForm();
      await refetch();
    } catch (err) {
      sileo.error({
        title: editing
          ? "No se pudo guardar la categoría"
          : "No se pudo agregar la categoría",
        description: adminErrorText(err, "Intenta de nuevo."),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className={`${surfaceClass} p-4 sm:p-5 flex flex-col gap-4`}
      >
        <div>
          <h2 className="text-lg font-bold text-[#212121] dark:text-white">
            {editing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
            El nombre es el que ve la gente. La dirección se arma sola. Si ya
            tiene artículos, el nombre se queda para no cambiar esa dirección.
          </p>
        </div>

        <label className="block">
          <span className={labelClass}>Nombre</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={nameLocked || saving}
            className={`${fieldClass} disabled:opacity-60`}
            placeholder="Prospección B2B"
          />
        </label>

        <fieldset>
          <legend className={labelClass}>Blog</legend>
          <div className="grid grid-cols-3 gap-2">
            {POST_PRODUCT_OPTIONS.map((option) => {
              const selected = product === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setProduct(option.value)}
                  className={`h-11 rounded-xl border text-sm font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    selected
                      ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                      : "border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <span className={labelClass}>Imagen</span>
          {editing?.image?.url && !imageFile ? (
            <img
              src={editing.image.url}
              alt=""
              className="mb-3 h-24 w-24 rounded-xl object-cover"
            />
          ) : null}
          <label className="inline-flex h-11 max-w-full cursor-pointer items-center truncate rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-sm font-semibold text-[#212121] dark:text-white">
            {imageFile ? imageFile.name : "Elegir imagen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => onImageChange(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="h-11 rounded-xl px-5 text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] cursor-pointer"
            >
              Cancelar
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving
              ? "Guardando..."
              : editing
                ? "Guardar categoría"
                : "Agregar categoría"}
          </button>
        </div>
      </form>

      {error ? (
        <AdminErrorState message="No se pudieron cargar las categorías." />
      ) : loading && categories.length === 0 ? (
        <AdminLoadingRows rows={4} />
      ) : categories.length === 0 ? (
        <AdminEmptyState
          title="Todavía no hay categorías"
          description="Agrega la primera para poder asignarla a un artículo."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id} className={`${surfaceClass} p-3 sm:p-4`}>
              <div className="flex items-center gap-3">
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#212121] dark:text-white truncate">
                    {getCategoryLabel(category.name)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <AdminStatusBadge
                      label={
                        POST_PRODUCT_LABELS[category.product ?? ""] ??
                        category.product ??
                        "—"
                      }
                      className={
                        POST_PRODUCT_BADGE[category.product ?? ""] ??
                        POST_PRODUCT_BADGE.all
                      }
                    />
                    <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {category.postsCount ?? 0} artículos
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-orange-600 dark:text-orange-400 cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
