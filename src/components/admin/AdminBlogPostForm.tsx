"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { DASH_EASE } from "kadesh/components/app-shell";
import { sileo } from "sileo";
import { getCategoryLabel } from "kadesh/components/blog/constants";
import { useObjectUrl } from "kadesh/utils/useObjectUrl";
import { useUser } from "kadesh/utils/UserContext";
import { imageFileError } from "./blog-image";
import { emptyBlogDocument, normalizeBlogDocument, type BlogDocument } from "./blog-document";
import AdminBlogEditor from "./AdminBlogEditor";
import { adminErrorText } from "./errors";
import {
  ADMIN_BLOG_CATEGORIES_QUERY,
  ADMIN_BLOG_LIST_TAKE,
  ADMIN_BLOG_POST_QUERY,
  ADMIN_BLOG_TAGS_QUERY,
  CREATE_ADMIN_POST_MUTATION,
  UPDATE_ADMIN_POST_MUTATION,
  type AdminBlogCategoriesResponse,
  type AdminBlogPostAuthor,
  type AdminBlogPostResponse,
  type AdminBlogTagsResponse,
} from "./blog-queries";
import {
  POST_PRODUCT,
  POST_PRODUCT_LABELS,
  POST_PRODUCT_OPTIONS,
} from "./constants";
import { AdminErrorState } from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-dash-line bg-dash-surface px-3 text-sm text-dash-ink placeholder:text-dash-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-dash-muted mb-1";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function authorName(author: AdminBlogPostAuthor | null) {
  if (!author) return "";
  return [author.name, author.lastName].filter(Boolean).join(" ").trim();
}

export default function AdminBlogPostForm({
  postId,
  onClose,
  onSaved,
}: {
  /** `"new"` abre el alta. Un id abre la edición. `null` cierra. */
  postId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isOpen = Boolean(postId);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && postId ? (
        <>
          <motion.div data-body-scroll-lock
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: DASH_EASE }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={postId === "new" ? "Nuevo artículo" : "Editar artículo"}
              className="bg-dash-surface rounded-t-3xl sm:rounded-3xl shadow-dash-lift font-dash text-dash-ink w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-dash-line"
              onClick={(event) => event.stopPropagation()}
            >
              <PostFormBody
                key={postId}
                postId={postId}
                onClose={onClose}
                onSaved={onSaved}
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PostFormBody({
  postId,
  onClose,
  onSaved,
}: {
  postId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = postId === "new";
  const { user } = useUser();
  const [saving, setSaving] = useState(false);

  const { data, loading, error } = useQuery<AdminBlogPostResponse>(
    ADMIN_BLOG_POST_QUERY,
    { variables: { id: postId }, skip: isNew, fetchPolicy: "network-only" },
  );

  const post = data?.post ?? null;
  const ready = isNew || Boolean(post);

  const me: AdminBlogPostAuthor | null = user
    ? {
        id: user.id,
        name: user.name ?? null,
        lastName: user.lastName ?? null,
        profileImage: user.profileImage ?? null,
      }
    : null;

  return (
    <>
      <div className="sticky top-0 z-10 bg-dash-surface px-4 sm:px-6 py-4 border-b border-dash-line flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-dash-ink">
            {isNew ? "Nuevo artículo" : "Editar artículo"}
          </h3>
          <p className="text-sm text-dash-muted mt-1">
            Elige si sale en Pet, en SaaS o en los dos blogs.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink cursor-pointer disabled:opacity-60"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      {error ? (
        <div className="p-4 sm:p-6">
          <AdminErrorState message="No se pudo cargar el artículo." />
        </div>
      ) : !ready || loading ? (
        <div className="p-4 sm:p-6 space-y-3" aria-hidden>
          <div className="h-11 rounded-xl dash-shimmer" />
          <div className="h-40 rounded-xl dash-shimmer" />
          <div className="h-40 rounded-xl dash-shimmer" />
        </div>
      ) : (
        <PostFormFields
          postId={isNew ? null : postId}
          me={me}
          savedAuthor={post?.author ?? null}
          initialTitle={post?.title ?? ""}
          initialExcerpt={post?.excerpt ?? ""}
          initialProduct={post?.product ?? POST_PRODUCT.SAAS}
          initialPublished={Boolean(post?.published)}
          initialPublishedAt={toDatetimeLocal(post?.publishedAt)}
          initialDocument={normalizeBlogDocument(post?.content?.document)}
          initialCategoryId={post?.category?.id ?? ""}
          initialTagIds={(post?.tags ?? []).map((tag) => tag.id)}
          initialImageUrl={post?.image?.url ?? null}
          saving={saving}
          setSaving={setSaving}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

function PostFormFields({
  postId,
  me,
  savedAuthor,
  initialTitle,
  initialExcerpt,
  initialProduct,
  initialPublished,
  initialPublishedAt,
  initialDocument,
  initialCategoryId,
  initialTagIds,
  initialImageUrl,
  saving,
  setSaving,
  onClose,
  onSaved,
}: {
  postId: string | null;
  /** Quien está editando. Es el autor por defecto de un artículo nuevo. */
  me: AdminBlogPostAuthor | null;
  /** Autor guardado. `null` en los nuevos y en los que llegan de ClickUp. */
  savedAuthor: AdminBlogPostAuthor | null;
  initialTitle: string;
  initialExcerpt: string;
  initialProduct: string;
  initialPublished: boolean;
  initialPublishedAt: string;
  initialDocument: BlogDocument;
  initialCategoryId: string;
  initialTagIds: string[];
  initialImageUrl: string | null;
  saving: boolean;
  setSaving: (value: boolean) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [product, setProduct] = useState(initialProduct);
  const [published, setPublished] = useState(initialPublished);
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
  const [body, setBody] = useState<BlogDocument>(initialDocument);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const previewUrl = useObjectUrl(imageFile);
  // Solo guarda lo que se eligió a mano: así un artículo nuevo toma a `me`
  // aunque la sesión termine de cargar después de abrir el formulario.
  const [chosenAuthor, setChosenAuthor] = useState<AdminBlogPostAuthor | null>(
    null,
  );
  const author = chosenAuthor ?? (postId ? savedAuthor : me);
  const authorIsMe = Boolean(me && author?.id === me.id);
  const authorPending = Boolean(author && author.id !== savedAuthor?.id);

  const { data: categoriesData } = useQuery<AdminBlogCategoriesResponse>(
    ADMIN_BLOG_CATEGORIES_QUERY,
    {
      variables: { take: ADMIN_BLOG_LIST_TAKE },
      fetchPolicy: "network-only",
    },
  );
  const { data: tagsData } = useQuery<AdminBlogTagsResponse>(
    ADMIN_BLOG_TAGS_QUERY,
    {
      variables: { take: ADMIN_BLOG_LIST_TAKE },
      fetchPolicy: "network-only",
    },
  );

  const [createPost] = useMutation(CREATE_ADMIN_POST_MUTATION);
  const [updatePost] = useMutation(UPDATE_ADMIN_POST_MUTATION);

  const categories = useMemo(() => {
    const rows = categoriesData?.categories ?? [];
    if (product === POST_PRODUCT.ALL) return rows;
    return rows.filter(
      (category) =>
        category.product === product || category.product === POST_PRODUCT.ALL,
    );
  }, [categoriesData, product]);

  const cover = previewUrl ?? initialImageUrl;

  function toggleTag(id: string) {
    setTagIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function onProductChange(next: string) {
    setProduct(next);
    if (!categoriesData) return;
    const stillValid = categoriesData.categories.some(
      (category) =>
        category.id === categoryId &&
        (next === POST_PRODUCT.ALL ||
          category.product === next ||
          category.product === POST_PRODUCT.ALL),
    );
    if (!stillValid) setCategoryId("");
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
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      sileo.warning({ title: "El título es obligatorio." });
      return;
    }

    const payload: Record<string, unknown> = {
      title: trimmedTitle,
      product,
      excerpt: excerpt.trim(),
      published,
      category: categoryId
        ? { connect: { id: categoryId } }
        : postId
          ? { disconnect: true }
          : undefined,
    };

    payload.content = body;

    if (publishedAt !== initialPublishedAt) {
      payload.publishedAt = publishedAt
        ? new Date(publishedAt).toISOString()
        : null;
    }

    if (postId) {
      payload.tags = { set: tagIds.map((id) => ({ id })) };
    } else if (tagIds.length > 0) {
      payload.tags = { connect: tagIds.map((id) => ({ id })) };
    }

    if (imageFile) payload.image = { upload: imageFile };
    if (author && authorPending) payload.author = { connect: { id: author.id } };

    if (!payload.category) delete payload.category;

    setSaving(true);
    try {
      if (postId) {
        await updatePost({ variables: { id: postId, data: payload } });
      } else {
        await createPost({ variables: { data: payload } });
      }
      sileo.success({
        title: published ? "Artículo publicado" : "Artículo guardado",
      });
      onSaved();
      onClose();
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar el artículo",
        description: adminErrorText(err, "Intenta de nuevo."),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="px-4 sm:px-6 py-5 flex flex-col gap-5">
        <label className="block">
          <span className={labelClass}>Título</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClass}
            placeholder="Cómo conseguir clientes en tu zona"
            required
          />
        </label>

        <fieldset>
          <legend className={labelClass}>Dónde se publica</legend>
          <div className="grid grid-cols-3 gap-2">
            {POST_PRODUCT_OPTIONS.map((option) => {
              const selected = product === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onProductChange(option.value)}
                  className={`h-11 rounded-xl border text-sm font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    selected
                      ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                      : "border-dash-line text-dash-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className={labelClass}>Categoría</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={fieldClass}
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryLabel(category.name)}
                {category.product
                  ? ` · ${POST_PRODUCT_LABELS[category.product] ?? category.product}`
                  : ""}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <p className="mt-1 text-xs text-dash-muted">
              No hay categorías de {POST_PRODUCT_LABELS[product] ?? "este blog"}.
              Créalas en la vista Categorías.
            </p>
          ) : null}
        </label>

        <div>
          <span className={labelClass}>Autor</span>
          <div className="flex flex-col gap-3 rounded-xl border border-dash-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {author?.profileImage?.url ? (
                <img
                  src={author.profileImage.url}
                  alt=""
                  className="size-10 shrink-0 rounded-full object-cover bg-dash-surface-2"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dash-surface-2 text-sm font-semibold text-dash-muted"
                >
                  {authorName(author).charAt(0).toUpperCase() || "?"}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dash-ink">
                  {author ? authorName(author) || "Sin nombre" : "Sin autor"}
                </p>
                <p className="text-xs text-dash-muted">
                  {!author
                    ? "En el blog no sale quién lo escribió."
                    : authorPending && postId
                      ? `${authorIsMe ? "Tú. " : ""}Se cambia al guardar el artículo.`
                      : authorIsMe
                        ? "Tú"
                        : "Sale en el blog como autor."}
                </p>
              </div>
            </div>
            {me && !authorIsMe ? (
              <button
                type="button"
                onClick={() => setChosenAuthor(me)}
                className="h-11 w-full shrink-0 rounded-full border border-dash-line px-4 text-sm font-semibold text-dash-ink cursor-pointer hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:w-auto"
              >
                Ponerme como autor
              </button>
            ) : null}
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>Etiquetas</legend>
          {(tagsData?.tags ?? []).length === 0 ? (
            <p className="text-sm text-dash-muted">
              Todavía no hay etiquetas. Puedes agregarlas en la vista Etiquetas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(tagsData?.tags ?? []).map((tag) => {
                const selected = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag.id)}
                    className={`min-h-11 rounded-full border px-3 text-sm font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                      selected
                        ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                        : "border-dash-line text-dash-soft"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <label className="block">
          <span className={labelClass}>Extracto</span>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            className={`${fieldClass} h-auto py-3`}
            placeholder="Una o dos frases que se ven en la lista y en el aviso."
          />
        </label>

        <div>
          <span className={labelClass}>Artículo</span>
          <AdminBlogEditor
            value={body.length > 0 ? body : emptyBlogDocument()}
            onChange={setBody}
          />
        </div>

        <div>
          <span className={labelClass}>Portada</span>
          {cover ? (
            <img
              src={cover}
              alt=""
              className="mb-3 h-40 w-full rounded-xl object-cover bg-dash-surface-2"
            />
          ) : (
            <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-dash-line text-sm text-dash-muted">
              Sin imagen
            </div>
          )}
          <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-dash-line px-4 text-sm font-semibold text-dash-ink">
            {cover ? "Cambiar imagen" : "Elegir imagen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => onImageChange(event.target.files?.[0])}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 min-h-11">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="mt-1 h-5 w-5 accent-orange-500"
          />
          <span>
            <span className="block text-sm font-semibold text-dash-ink">
              Publicado
            </span>
            <span className="block text-xs text-dash-muted mt-0.5">
              Si lo publicas ahora, avisamos a quienes siguen ese blog y lo
              compartimos en Facebook. Una fecha futura lo deja oculto hasta ese
              momento. Guardar uno que ya estaba publicado no vuelve a avisar.
            </span>
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>Fecha de publicación</span>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-dash-line bg-dash-surface px-4 sm:px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-11 rounded-full px-5 text-sm font-semibold text-dash-muted cursor-pointer disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full dash-grad-accent hover:shadow-dash-accent-lift text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-dash-accent"
        >
          {saving ? "Guardando..." : "Guardar artículo"}
        </button>
      </div>
    </form>
  );
}
