"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  AdminDefinitionList,
  AdminDrawer,
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  formatPersonName,
} from "../ui";
import {
  ADMIN_ANIMAL_DETAIL_QUERY,
  ADMIN_PURGE_ANIMAL_VIEWS_MUTATION,
  DELETE_ANIMAL_COMMENT_MUTATION,
  DELETE_ANIMAL_FAVORITE_MUTATION,
  type AdminActionResult,
  type AdminAnimalDetailResponse,
  type AdminAnimalRow,
  type AdminPersonRef,
} from "./queries";
import {
  ANIMAL_STATUS_CLASS,
  ANIMAL_STATUS_DEFAULT_CLASS,
  ANIMAL_STATUS_LABELS,
  REPORTED_BY_LABELS,
  SEX_LABELS,
  facebookPostUrl,
  petAnimalEditUrl,
  petAnimalUrl,
} from "./constants";

const actionLink =
  "inline-flex h-10 items-center justify-center rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] transition-colors hover:border-orange-400 dark:border-[#3a3a3a] dark:text-white";
const dangerText = "text-xs font-medium text-red-700 hover:underline disabled:opacity-40 dark:text-red-400";

function personLabel(person: AdminPersonRef | null): string {
  if (!person) return "Sin sesión";
  return formatPersonName(person.name, person.lastName) || person.email || "Sin nombre";
}

/**
 * Detalle de un animal en Operaciones: fotos, datos, etapas, estadísticas (vistas por día),
 * comentarios y favoritos con acciones de admin (borrar), y publicar en Facebook.
 */
export default function AdminAnimalDetailDrawer({
  animalId,
  onClose,
  onPublish,
  publishing,
  onChanged,
}: {
  animalId: string | null;
  onClose: () => void;
  onPublish: (row: AdminAnimalRow) => Promise<void>;
  publishing: boolean;
  onChanged: () => void;
}) {
  const { data, loading, error, refetch } = useQuery<AdminAnimalDetailResponse>(ADMIN_ANIMAL_DETAIL_QUERY, {
    variables: { id: animalId ?? "" },
    skip: !animalId,
    fetchPolicy: "cache-and-network",
  });
  const [deleteComment] = useMutation(DELETE_ANIMAL_COMMENT_MUTATION);
  const [deleteFavorite] = useMutation(DELETE_ANIMAL_FAVORITE_MUTATION);
  const [purgeViews] = useMutation<{ adminPurgeAnimalViews: AdminActionResult }>(ADMIN_PURGE_ANIMAL_VIEWS_MUTATION);
  const [busy, setBusy] = useState<string | null>(null);

  const detail = data?.adminAnimalDetail ?? null;
  const animal = detail?.animal ?? null;

  const run = async (key: string, confirmText: string, action: () => Promise<unknown>, done: string) => {
    if (!window.confirm(confirmText)) return;
    setBusy(key);
    try {
      await action();
      sileo.success({ title: done });
      await refetch();
      onChanged();
    } catch (err) {
      sileo.error({ title: "No se pudo", description: err instanceof Error ? err.message : "Intenta de nuevo." });
    } finally {
      setBusy(null);
    }
  };

  const purge = (onlyAnonymous: boolean) =>
    run(
      onlyAnonymous ? "purge-anon" : "purge-all",
      onlyAnonymous ? "¿Borrar las vistas sin sesión de este animal?" : "¿Borrar TODAS las vistas de este animal?",
      async () => {
        const { data: result } = await purgeViews({ variables: { animalId, onlyAnonymous } });
        if (!result?.adminPurgeAnimalViews.success) throw new Error(result?.adminPurgeAnimalViews.message);
      },
      "Vistas borradas",
    );

  const maxDaily = Math.max(1, ...(detail?.viewStats.daily ?? []).map((d) => d.count));

  return (
    <AdminDrawer
      open={Boolean(animalId)}
      onClose={onClose}
      ariaLabel="Detalle del animal"
      title={animal?.name ?? "Animal"}
      subtitle={animal ? [animal.animalType, animal.breed].filter(Boolean).join(" · ") : undefined}
    >
      {error ? (
        <AdminErrorState message={error.message} />
      ) : !detail || !animal ? (
        loading ? <AdminLoadingRows rows={5} /> : <AdminErrorState message="No encontramos ese animal." />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onPublish(animal).then(() => refetch())}
              disabled={publishing}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1877F2] px-4 text-sm font-semibold text-white hover:bg-[#166FE5] disabled:opacity-50"
            >
              {animal.facebookPublishedAt ? "Volver a publicar en Facebook" : "Publicar en Facebook"}
            </button>
            {animal.slug ? (
              <>
                <a className={actionLink} href={petAnimalEditUrl(animal.slug)} target="_blank" rel="noopener noreferrer">
                  Editar en Kadesh Pet
                </a>
                <a className={actionLink} href={petAnimalUrl(animal.slug)} target="_blank" rel="noopener noreferrer">
                  Ver ficha pública
                </a>
              </>
            ) : null}
          </div>

          {detail.photos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {detail.photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-32 w-32 shrink-0 rounded-xl object-cover" loading="lazy" />
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AdminStatTile label="Vistas" value={detail.viewStats.total} hint={`${detail.viewStats.last7d} en 7 días`} />
            <AdminStatTile label="Con sesión" value={detail.viewStats.signedIn} hint={`${detail.viewStats.anonymous} sin sesión`} />
            <AdminStatTile label="Favoritos" value={animal.favorites} />
            <AdminStatTile label="Comentarios" value={animal.comments} />
          </div>

          <AdminSectionCard
            title="Vistas por día"
            description="Últimos 30 días, hora de CDMX."
            action={
              <div className="flex gap-3">
                <button type="button" className={dangerText} disabled={busy !== null} onClick={() => void purge(true)}>
                  Borrar sin sesión
                </button>
                <button type="button" className={dangerText} disabled={busy !== null} onClick={() => void purge(false)}>
                  Borrar todas
                </button>
              </div>
            }
          >
            <div className="flex h-24 items-end gap-[3px]" role="img" aria-label="Vistas por día en los últimos 30 días">
              {detail.viewStats.daily.map((day) => (
                <span
                  key={day.day}
                  title={`${day.day}: ${day.count}`}
                  className="flex-1 rounded-t bg-orange-400/80 dark:bg-orange-500/70"
                  style={{ height: `${Math.max(4, (day.count / maxDaily) * 100)}%`, opacity: day.count ? 1 : 0.25 }}
                />
              ))}
            </div>
            {detail.viewStats.recentViewers.length > 0 ? (
              <p className="mt-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                Lo vieron hace poco: {detail.viewStats.recentViewers.map(personLabel).join(", ")}
              </p>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard title="Datos">
            <AdminDefinitionList
              columns={2}
              items={[
                {
                  label: "Etapa",
                  value: animal.status ? (
                    <AdminStatusBadge
                      label={ANIMAL_STATUS_LABELS[animal.status] ?? animal.status}
                      className={ANIMAL_STATUS_CLASS[animal.status] ?? ANIMAL_STATUS_DEFAULT_CLASS}
                    />
                  ) : (
                    "—"
                  ),
                },
                { label: "Publicado por", value: `${personLabel(animal.creator)}${animal.creatorIsAdmin ? " (admin)" : ""}` },
                { label: "Reporta", value: REPORTED_BY_LABELS[animal.reportedBy ?? ""] ?? "—" },
                { label: "Sexo", value: SEX_LABELS[animal.sex ?? ""] ?? "—" },
                { label: "Edad", value: detail.age || "—" },
                { label: "Color / tamaño", value: [detail.color, detail.size].filter(Boolean).join(" · ") || "—" },
                { label: "Teléfono", value: [detail.contactNumber, detail.contactNumber2].filter(Boolean).join(" · ") || "—" },
                { label: "Ubicación", value: [animal.city, animal.state].filter(Boolean).join(", ") || "—" },
                { label: "Creado", value: formatDateShort(animal.createdAt) },
                {
                  label: "Facebook",
                  value: animal.facebookPublishedAt ? (
                    <span>
                      {formatDateShort(animal.facebookPublishedAt)}
                      {detail.facebookPublishedBy ? ` · ${personLabel(detail.facebookPublishedBy)}` : ""}
                      {animal.facebookPostId ? (
                        <>
                          {" · "}
                          <a
                            href={facebookPostUrl(animal.facebookPostId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-800 underline dark:text-orange-300"
                          >
                            ver post
                          </a>
                        </>
                      ) : null}
                    </span>
                  ) : (
                    "Sin publicar"
                  ),
                },
              ]}
            />
            {detail.physicalDescription ? (
              <p className="mt-3 whitespace-pre-line text-sm text-[#424242] dark:text-[#d6d6d6]">
                {detail.physicalDescription}
              </p>
            ) : null}
            {detail.sourceUrl ? (
              <a
                href={detail.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-orange-800 underline dark:text-orange-300"
              >
                Publicación original
              </a>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard title="Etapas" description="La más reciente arriba.">
            {detail.logs.length === 0 ? (
              <p className="text-sm text-[#757575]">Sin etapas.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {detail.logs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="font-medium text-[#212121] dark:text-white">
                      {ANIMAL_STATUS_LABELS[log.status ?? ""] ?? log.status ?? "—"}
                    </span>
                    <span className="text-[#9e9e9e]"> · {formatDateShort(log.createdAt)}</span>
                    <span className="block text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {[log.address, log.city, log.state].filter(Boolean).join(", ")}
                    </span>
                    {log.notes ? <span className="block text-xs text-[#616161] dark:text-[#b0b0b0]">{log.notes}</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </AdminSectionCard>

          <AdminSectionCard title={`Comentarios (${detail.comments.length})`}>
            {detail.comments.length === 0 ? (
              <p className="text-sm text-[#757575]">Sin comentarios.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {detail.comments.map((comment) => (
                  <li key={comment.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium text-[#212121] dark:text-white">{personLabel(comment.user)}</span>
                      <span className="text-xs text-[#9e9e9e]"> · {formatDateShort(comment.createdAt)}</span>
                      <span className="block whitespace-pre-line text-[#424242] [overflow-wrap:anywhere] dark:text-[#d6d6d6]">
                        {comment.comment}
                      </span>
                    </span>
                    <button
                      type="button"
                      className={dangerText}
                      disabled={busy !== null}
                      onClick={() =>
                        void run(
                          `comment-${comment.id}`,
                          "¿Borrar este comentario?",
                          () => deleteComment({ variables: { id: comment.id } }),
                          "Comentario borrado",
                        )
                      }
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>

          <AdminSectionCard title={`Favoritos (${detail.favoritesList.length})`}>
            {detail.favoritesList.length === 0 ? (
              <p className="text-sm text-[#757575]">Nadie lo ha guardado.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {detail.favoritesList.map((favorite) => (
                  <li key={favorite.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="text-[#212121] dark:text-white">{personLabel(favorite.user)}</span>
                      <span className="text-xs text-[#9e9e9e]"> · {formatDateShort(favorite.createdAt)}</span>
                    </span>
                    <button
                      type="button"
                      className={dangerText}
                      disabled={busy !== null}
                      onClick={() =>
                        void run(
                          `favorite-${favorite.id}`,
                          "¿Quitar este favorito?",
                          () => deleteFavorite({ variables: { id: favorite.id } }),
                          "Favorito quitado",
                        )
                      }
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>
        </div>
      )}
    </AdminDrawer>
  );
}
