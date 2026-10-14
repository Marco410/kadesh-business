"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  EyeIcon,
  FavouriteIcon,
  Comment01Icon,
  LinkSquare02Icon,
  Facebook01Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
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
} from "../ui";
import {
  ADMIN_ANIMALS_QUERY,
  ADMIN_PUBLISH_ANIMAL_TO_FACEBOOK_MUTATION,
  ANIMAL_TYPES_QUERY,
  type AdminActionResult,
  type AdminAnimalRow,
  type AdminAnimalsResponse,
} from "./queries";
import {
  ADMIN_ANIMALS_PAGE_SIZE,
  ANIMAL_STATUS_CLASS,
  ANIMAL_STATUS_DEFAULT_CLASS,
  ANIMAL_STATUS_LABELS,
  CREATOR_FILTER_API,
  CREATOR_FILTER_OPTIONS,
  FACEBOOK_FILTER_API,
  FACEBOOK_FILTER_OPTIONS,
  petAnimalEditUrl,
  petAnimalUrl,
  type AnimalCreatorFilter,
  type AnimalFacebookFilter,
} from "./constants";
import AdminAnimalDetailDrawer from "./AdminAnimalDetailDrawer";

const iconButton =
  "inline-flex size-10 items-center justify-center rounded-xl border border-[#e0e0e0] text-[#424242] transition-colors hover:border-orange-400 hover:text-orange-800 disabled:opacity-40 dark:border-[#3a3a3a] dark:text-[#d6d6d6] dark:hover:text-orange-300";

/**
 * Kadesh Pet → Animales: todos los animales (de usuarios y del admin) con filtros, estadísticas
 * y acciones: ver detalle, editar en Kadesh Pet, abrir la ficha pública y publicar en Facebook.
 * El animal abierto vive en `?animal=` para que la campana pueda llevar directo a él.
 */
export default function AdminAnimalsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("animal");

  const [search, setSearch] = useState("");
  const [animalTypeId, setAnimalTypeId] = useState("");
  const [creator, setCreator] = useState<AnimalCreatorFilter>("todos");
  const [facebook, setFacebook] = useState<AnimalFacebookFilter>("todos");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const variables = useMemo(
    () => ({
      search: debouncedSearch.trim() || null,
      animalTypeId: animalTypeId || null,
      creator: CREATOR_FILTER_API[creator],
      facebook: FACEBOOK_FILTER_API[facebook],
      take: ADMIN_ANIMALS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_ANIMALS_PAGE_SIZE,
    }),
    [animalTypeId, creator, debouncedSearch, facebook, page],
  );

  const { data, loading, error, refetch } = useQuery<AdminAnimalsResponse>(ADMIN_ANIMALS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const { data: typesData } = useQuery<{ animalTypes: Array<{ id: string; name: string }> }>(
    ANIMAL_TYPES_QUERY,
  );
  const [publish] = useMutation<{ adminPublishAnimalToFacebook: AdminActionResult }>(
    ADMIN_PUBLISH_ANIMAL_TO_FACEBOOK_MUTATION,
  );
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const rows = data?.adminAnimals.items ?? [];
  const total = data?.adminAnimals.total ?? 0;

  const setSelected = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("animal", id);
      else params.delete("animal");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const publishToFacebook = useCallback(
    async (row: AdminAnimalRow) => {
      const force = Boolean(row.facebookPublishedAt);
      if (force && !window.confirm(`"${row.name}" ya está en Facebook. ¿Publicarlo otra vez?`)) return;
      setPublishingId(row.id);
      try {
        const { data: result } = await publish({ variables: { animalId: row.id, force } });
        const outcome = result?.adminPublishAnimalToFacebook;
        if (outcome?.success) sileo.success({ title: outcome.message });
        else sileo.error({ title: "No se publicó", description: outcome?.message });
        await refetch();
      } catch (err) {
        sileo.error({
          title: "No se publicó",
          description: err instanceof Error ? err.message : "Intenta de nuevo.",
        });
      } finally {
        setPublishingId(null);
      }
    },
    [publish, refetch],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminAnimalDetailDrawer
        animalId={selectedId}
        onClose={() => setSelected(null)}
        onPublish={publishToFacebook}
        publishing={Boolean(selectedId && publishingId === selectedId)}
        onChanged={() => void refetch()}
      />

      <AdminSearchInput
        value={search}
        onChange={resetPage(setSearch)}
        placeholder="Buscar por nombre, ciudad o quién lo publicó"
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <AdminFilterChips
            label="Publicado por"
            options={CREATOR_FILTER_OPTIONS}
            value={creator}
            onChange={resetPage(setCreator)}
          />
          <AdminFilterChips
            label="Facebook"
            options={FACEBOOK_FILTER_OPTIONS}
            value={facebook}
            onChange={resetPage(setFacebook)}
          />
        </div>
        <select
          value={animalTypeId}
          onChange={(e) => resetPage(setAnimalTypeId)(e.target.value)}
          aria-label="Tipo de animal"
          className="h-11 rounded-xl border border-[#e0e0e0] bg-white px-3 text-sm text-[#212121] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white"
        >
          <option value="">Todos los tipos</option>
          {(typesData?.animalTypes ?? []).map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <AdminEmptyState title="Sin animales" description="Ningún animal coincide con los filtros." />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-[#eee] dark:divide-[#2a2a2a]`}>
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setSelected(row.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                  <span className="size-14 shrink-0 rounded-xl bg-[#eee] dark:bg-[#2a2a2a]" />
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-[#212121] dark:text-white">{row.name}</span>
                    {row.status ? (
                      <AdminStatusBadge
                        label={ANIMAL_STATUS_LABELS[row.status] ?? row.status}
                        className={ANIMAL_STATUS_CLASS[row.status] ?? ANIMAL_STATUS_DEFAULT_CLASS}
                      />
                    ) : null}
                    {row.facebookPublishedAt ? (
                      <AdminStatusBadge
                        label="En Facebook"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300"
                      />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {[row.animalType, row.breed, [row.city, row.state].filter(Boolean).join(", ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#9e9e9e]">
                    {row.creator ? formatPersonName(row.creator.name, row.creator.lastName) : "Sin dueño"}
                    {row.creatorIsAdmin ? " (admin)" : ""} · {formatDateShort(row.createdAt, false)}
                  </span>
                </span>
              </button>

              <div className="flex items-center gap-4 text-xs text-[#616161] dark:text-[#b0b0b0]">
                <span className="inline-flex items-center gap-1" title="Vistas (7 días)">
                  <HugeiconsIcon icon={EyeIcon} size={14} /> {row.views}
                  <span className="text-[#9e9e9e]">({row.views7d})</span>
                </span>
                <span className="inline-flex items-center gap-1" title="Favoritos">
                  <HugeiconsIcon icon={FavouriteIcon} size={14} /> {row.favorites}
                </span>
                <span className="inline-flex items-center gap-1" title="Comentarios">
                  <HugeiconsIcon icon={Comment01Icon} size={14} /> {row.comments}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={iconButton}
                  onClick={() => void publishToFacebook(row)}
                  disabled={publishingId === row.id}
                  aria-label={row.facebookPublishedAt ? "Volver a publicar en Facebook" : "Publicar en Facebook"}
                  title={row.facebookPublishedAt ? "Volver a publicar en Facebook" : "Publicar en Facebook"}
                >
                  <HugeiconsIcon icon={Facebook01Icon} size={18} />
                </button>
                {row.slug ? (
                  <>
                    <a
                      className={iconButton}
                      href={petAnimalEditUrl(row.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Editar en Kadesh Pet"
                      title="Editar en Kadesh Pet"
                    >
                      <HugeiconsIcon icon={Edit02Icon} size={18} />
                    </a>
                    <a
                      className={iconButton}
                      href={petAnimalUrl(row.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver ficha pública"
                      title="Ver ficha pública"
                    >
                      <HugeiconsIcon icon={LinkSquare02Icon} size={18} />
                    </a>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminPagination
        totalCount={total}
        pageSize={ADMIN_ANIMALS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
