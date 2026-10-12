"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminStatusBadge,
  surfaceClass,
} from "../ui";
import ReleaseEditor from "./ReleaseEditor";
import { ADMIN_RELEASES_QUERY, type AdminRelease, type AdminReleasesResponse } from "./releases-queries";
import {
  RELEASE_PRODUCT_FILTERS,
  RELEASE_PRODUCT_LABELS,
  RELEASE_STATUS_FILTERS,
} from "./constants";

function emailLine(release: AdminRelease): string {
  if (release.emailedAt) return `Correo enviado el ${formatDateShort(release.emailedAt, false)}`;
  if (!release.notifyByEmail) return "Sin correo";
  return release.isPublished ? "Publicada sin correo" : "Mandará correo al publicar";
}

/**
 * Operaciones → Novedades: lo nuevo de la plataforma (`SystemRelease`). Lo publicado sale en
 * Novedades del panel del cliente (y en Pet si aplica); los borradores solo los ve Kadesh.
 */
export default function AdminReleasesPanel() {
  const { searchParams, setParams } = useAdminNavigation();
  const status = RELEASE_STATUS_FILTERS.find((f) => f.value === searchParams.get("estado"))?.value ?? "todas";
  const product = RELEASE_PRODUCT_FILTERS.find((f) => f.value === searchParams.get("producto"))?.value ?? "todos";
  const [editing, setEditing] = useState<AdminRelease | "new" | null>(null);

  const where = useMemo(() => {
    const filter: Record<string, unknown> = {};
    if (status === "publicadas") filter.isPublished = { equals: true };
    if (status === "borradores") filter.isPublished = { equals: false };
    if (product !== "todos") filter.product = { equals: product };
    return filter;
  }, [status, product]);
  const { data, loading, error, refetch } = useQuery<AdminReleasesResponse>(ADMIN_RELEASES_QUERY, {
    variables: { where },
    fetchPolicy: "cache-and-network",
  });
  const releases = data?.systemReleases ?? [];

  return (
    <div className="flex flex-col gap-4" data-tour="admin-novedades">
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-[#424242] dark:border-orange-900/60 dark:bg-orange-500/10 dark:text-[#e0e0e0]">
        <p className="font-semibold text-[#212121] dark:text-white">Cómo funciona</p>
        <p className="mt-1">
          Escribe lo nuevo de la plataforma con palabras de tus clientes. Guárdalo como borrador
          mientras lo revisas; al publicarlo aparece en Novedades del panel y, si lo dejas marcado,
          se manda un correo a las personas de ese producto una sola vez. Editar una novedad ya
          publicada no vuelve a mandar correo.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <AdminFilterChips
            label="Estado"
            options={[...RELEASE_STATUS_FILTERS]}
            value={status}
            onChange={(value) => setParams({ estado: value === "todas" ? null : value })}
          />
          <AdminFilterChips
            label="Producto"
            options={[...RELEASE_PRODUCT_FILTERS]}
            value={product}
            onChange={(value) => setParams({ producto: value === "todos" ? null : value })}
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Nueva novedad
        </button>
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && releases.length === 0 ? (
        <AdminLoadingRows rows={5} />
      ) : releases.length === 0 ? (
        <AdminEmptyState
          title="No hay novedades con estos filtros"
          description="Crea la primera con Nueva novedad."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {releases.map((release) => (
            <li key={release.id}>
              <button
                type="button"
                onClick={() => setEditing(release)}
                className={cn(
                  surfaceClass,
                  "flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:border-orange-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:hover:border-orange-500 cursor-pointer",
                )}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-[#f0f0f0] px-2 py-0.5 font-mono text-xs font-bold text-[#212121] dark:bg-[#2a2a2a] dark:text-orange-300">
                      v{release.version}
                    </span>
                    <AdminStatusBadge
                      label={release.isPublished ? "Publicada" : "Borrador"}
                      className={
                        release.isPublished
                          ? "bg-emerald-500/15 px-2 py-0.5 text-emerald-800 dark:text-emerald-300"
                          : "bg-black/5 px-2 py-0.5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]"
                      }
                    />
                    <AdminStatusBadge
                      label={RELEASE_PRODUCT_LABELS[release.product] ?? release.product}
                      className="bg-orange-500/10 px-2 py-0.5 text-orange-800 dark:text-orange-300"
                    />
                  </span>
                  <span className="mt-1.5 block font-semibold text-[#212121] dark:text-white">
                    {release.title?.trim() || `Versión ${release.version}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {formatDateShort(release.releasedAt, false)} · {emailLine(release)}
                  </span>
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="mt-1 shrink-0 text-[#9e9e9e]" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ReleaseEditor
          key={editing === "new" ? "new" : editing.id}
          release={editing === "new" ? null : editing}
          open
          onClose={() => setEditing(null)}
          onSaved={() => void refetch()}
        />
      ) : null}
    </div>
  );
}
