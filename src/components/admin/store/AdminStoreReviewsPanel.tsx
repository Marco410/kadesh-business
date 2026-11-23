"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { ConfirmModal, ModalPortal } from "kadesh/components/shared";
import { formatDateShort } from "kadesh/utils/format-date";
import { adminErrorText } from "../errors";
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminStatusBadge,
  adminTextareaClass,
  formatPersonName,
  surfaceClass,
} from "../ui";
import {
  ADMIN_STORE_REVIEWS_PAGE_SIZE,
  STORE_REVIEW_FILTER_OPTIONS,
  STORE_REVIEW_STATUS,
  type StoreReviewFilter,
} from "./constants";
import {
  ADMIN_STORE_REVIEWS_QUERY,
  DELETE_ADMIN_STORE_REVIEW_MUTATION,
  UPDATE_ADMIN_STORE_REVIEW_MUTATION,
  type AdminStoreReviewRow,
  type AdminStoreReviewsResponse,
} from "./queries";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={15}
          className={star <= rating ? "text-orange-500" : "text-dash-line-strong"}
        />
      ))}
      <span className="ml-1 text-xs font-semibold tabular-nums text-dash-soft">{rating}</span>
    </span>
  );
}

/**
 * Tienda → Reseñas: what people wrote about the products. Hiding one takes it out of the store and
 * out of the product's stars (the backend recalculates them); the author cannot publish it again.
 */
export default function AdminStoreReviewsPanel() {
  const [filter, setFilter] = useState<StoreReviewFilter>("todas");
  const [page, setPage] = useState(1);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const variables = useMemo(
    () => ({
      where: filter === "todas" ? {} : { status: { equals: filter } },
      take: ADMIN_STORE_REVIEWS_PAGE_SIZE,
      skip: (page - 1) * ADMIN_STORE_REVIEWS_PAGE_SIZE,
    }),
    [filter, page],
  );

  const { data, loading, error, refetch } = useQuery<AdminStoreReviewsResponse>(ADMIN_STORE_REVIEWS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const [updateReview] = useMutation(UPDATE_ADMIN_STORE_REVIEW_MUTATION);
  const [deleteReview] = useMutation(DELETE_ADMIN_STORE_REVIEW_MUTATION);

  const rows = data?.storeProductReviews ?? [];
  const total = data?.storeProductReviewsCount ?? 0;

  async function run(id: string, action: () => Promise<unknown>, done: string) {
    setBusyId(id);
    try {
      await action();
      sileo.success({ title: done });
      await refetch();
    } catch (err) {
      sileo.error({ title: "No se pudo guardar", description: adminErrorText(err, "Intenta de nuevo.") });
    } finally {
      setBusyId(null);
    }
  }

  function toggleHidden(row: AdminStoreReviewRow) {
    const hidden = row.status === STORE_REVIEW_STATUS.HIDDEN;
    void run(
      row.id,
      () =>
        updateReview({
          variables: {
            id: row.id,
            data: { status: hidden ? STORE_REVIEW_STATUS.PUBLISHED : STORE_REVIEW_STATUS.HIDDEN },
          },
        }),
      hidden ? "Reseña publicada de nuevo" : "Reseña oculta",
    );
  }

  function saveReply(row: AdminStoreReviewRow) {
    void run(
      row.id,
      () => updateReview({ variables: { id: row.id, data: { adminReply: replyText.trim() } } }),
      replyText.trim() ? "Respuesta guardada" : "Respuesta quitada",
    ).then(() => setReplyingId(null));
  }

  function remove(id: string) {
    void run(id, () => deleteReview({ variables: { id } }), "Reseña borrada").then(() => setConfirmDeleteId(null));
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminFilterChips
        options={STORE_REVIEW_FILTER_OPTIONS}
        value={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />

      {error ? (
        <AdminErrorState message={adminErrorText(error, "No se pudieron cargar las reseñas. Intenta de nuevo.")} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin reseñas"
          description="Todos los productos empiezan sin estrellas. Aquí aparecen las reseñas que deja la gente."
        />
      ) : (
        <ul className={`${surfaceClass} divide-y divide-dash-line`}>
          {rows.map((row) => {
            const hidden = row.status === STORE_REVIEW_STATUS.HIDDEN;
            const busy = busyId === row.id;
            return (
              <li key={row.id} className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={row.rating} />
                  {hidden ? (
                    <AdminStatusBadge label="Oculta" className="bg-dash-surface-2 text-dash-soft" />
                  ) : null}
                  {row.verifiedPurchase ? (
                    <AdminStatusBadge
                      label="Compra verificada"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                    />
                  ) : null}
                  <span className="text-xs text-dash-faint">{formatDateShort(row.createdAt, false)}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-dash-ink">
                    {row.product?.name ?? "Producto borrado"}
                  </p>
                  <p className="truncate text-xs text-dash-muted">
                    {row.user ? formatPersonName(row.user.name, row.user.lastName) : "Cuenta borrada"}
                    {row.user?.email ? ` · ${row.user.email}` : ""}
                  </p>
                </div>
                {row.title ? <p className="text-sm font-semibold text-dash-ink">{row.title}</p> : null}
                {row.body ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-dash-soft [overflow-wrap:anywhere]">
                    {row.body}
                  </p>
                ) : (
                  <p className="text-sm text-dash-faint">Solo dejó la calificación.</p>
                )}

                {replyingId === row.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      className={adminTextareaClass}
                      placeholder="Respuesta pública de Kadesh. Vacío para quitarla."
                      maxLength={1000}
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <AdminButton size="sm" onClick={() => saveReply(row)} disabled={busy}>
                        Guardar respuesta
                      </AdminButton>
                      <AdminButton variant="ghost" size="sm" onClick={() => setReplyingId(null)} disabled={busy}>
                        Cancelar
                      </AdminButton>
                    </div>
                  </div>
                ) : row.adminReply ? (
                  <p className="rounded-2xl bg-dash-surface-2 px-4 py-3 text-sm text-dash-soft [overflow-wrap:anywhere]">
                    <span className="font-semibold text-dash-ink">Kadesh respondió: </span>
                    {row.adminReply}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="outline" size="sm" onClick={() => toggleHidden(row)} disabled={busy}>
                    {hidden ? "Publicar de nuevo" : "Ocultar"}
                  </AdminButton>
                  {replyingId !== row.id ? (
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyText(row.adminReply ?? "");
                        setReplyingId(row.id);
                      }}
                      disabled={busy}
                    >
                      {row.adminReply ? "Editar respuesta" : "Responder"}
                    </AdminButton>
                  ) : null}
                  <AdminButton variant="danger-ghost" size="sm" onClick={() => setConfirmDeleteId(row.id)} disabled={busy} className="sm:ml-auto">
                    Borrar
                  </AdminButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination
        totalCount={total}
        pageSize={ADMIN_STORE_REVIEWS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />

      <ModalPortal>
        <ConfirmModal
          isOpen={Boolean(confirmDeleteId)}
          onClose={() => {
            if (!busyId) setConfirmDeleteId(null);
          }}
          onConfirm={() => {
            if (confirmDeleteId) remove(confirmDeleteId);
          }}
          title="Borrar reseña"
          message="¿Borrar esta reseña? No se puede deshacer. Para sacarla de la tienda basta con ocultarla."
          confirmText="Borrar"
          cancelText="Cancelar"
          isLoading={Boolean(busyId && busyId === confirmDeleteId)}
          confirmButtonColor="red"
        />
      </ModalPortal>
    </div>
  );
}
