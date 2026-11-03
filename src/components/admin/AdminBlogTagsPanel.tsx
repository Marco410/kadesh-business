"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { adminErrorText } from "./errors";
import {
  ADMIN_BLOG_LIST_TAKE,
  ADMIN_BLOG_TAGS_QUERY,
  CREATE_ADMIN_TAG_MUTATION,
  type AdminBlogTagsResponse,
} from "./blog-queries";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  surfaceClass,
} from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-dash-line bg-dash-surface px-3 text-sm text-dash-ink placeholder:text-dash-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

export default function AdminBlogTagsPanel() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery<AdminBlogTagsResponse>(
    ADMIN_BLOG_TAGS_QUERY,
    {
      variables: { take: ADMIN_BLOG_LIST_TAKE },
      fetchPolicy: "network-only",
    },
  );
  const [createTag] = useMutation(CREATE_ADMIN_TAG_MUTATION);
  const tags = data?.tags ?? [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      sileo.warning({ title: "Escribe el nombre de la etiqueta." });
      return;
    }
    if (
      tags.some((tag) => tag.name?.trim().toLowerCase() === trimmed.toLowerCase())
    ) {
      sileo.warning({ title: "Esa etiqueta ya existe." });
      return;
    }

    setSaving(true);
    try {
      await createTag({ variables: { data: { name: trimmed } } });
      sileo.success({ title: "Etiqueta agregada" });
      setName("");
      await refetch();
    } catch (err) {
      sileo.error({
        title: "No se pudo agregar la etiqueta",
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
          <h2 className="text-lg font-bold text-dash-ink">
            Nueva etiqueta
          </h2>
          <p className="text-sm text-dash-muted mt-1">
            Sirven para los dos blogs. Un artículo puede llevar varias.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="block flex-1">
            <span className="sr-only">Nombre de la etiqueta</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
              placeholder="WhatsApp, primer contacto, veterinarias..."
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-dash-accent"
          >
            {saving ? "Guardando..." : "Agregar etiqueta"}
          </button>
        </div>
      </form>

      {error ? (
        <AdminErrorState message="No se pudieron cargar las etiquetas." />
      ) : loading && tags.length === 0 ? (
        <AdminLoadingRows rows={4} />
      ) : tags.length === 0 ? (
        <AdminEmptyState
          title="Todavía no hay etiquetas"
          description="Agrega la primera para poder marcar artículos."
        />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-3 px-4 py-3 min-h-14"
            >
              <p className="font-semibold text-dash-ink truncate">
                {tag.name}
              </p>
              <p className="shrink-0 text-xs text-dash-muted">
                {tag.postsCount ?? 0} artículos
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
