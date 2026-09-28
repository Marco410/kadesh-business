"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { sileo } from "sileo";
import { getCategoryLabel } from "kadesh/components/blog/constants";
import { useUser } from "kadesh/utils/UserContext";
import { imageFileError } from "./blog-image";
import { documentToText, textToDocument } from "./blog-document";
import { adminErrorText } from "./errors";
import {
  ADMIN_BLOG_CATEGORIES_QUERY,
  ADMIN_BLOG_LIST_TAKE,
  ADMIN_BLOG_POST_QUERY,
  ADMIN_BLOG_TAGS_QUERY,
  CREATE_ADMIN_POST_MUTATION,
  UPDATE_ADMIN_POST_MUTATION,
  type AdminBlogCategoriesResponse,
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
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={postId === "new" ? "Nuevo artículo" : "Editar artículo"}
              className="bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
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

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-[#212121] dark:text-white">
            {isNew ? "Nuevo artículo" : "Editar artículo"}
          </h3>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
            Elige si sale en Pet, en SaaS o en los dos blogs.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-11 w-11 shrink-0 rounded-xl text-2xl text-[#616161] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] cursor-pointer disabled:opacity-60"
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
          <div className="h-11 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
          <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
          <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
        </div>
      ) : (
        <PostFormFields
          postId={isNew ? null : postId}
          authorId={user?.id ?? null}
          initialTitle={post?.title ?? ""}
          initialExcerpt={post?.excerpt ?? ""}
          initialProduct={post?.product ?? POST_PRODUCT.SAAS}
          initialPublished={Boolean(post?.published)}
          initialPublishedAt={toDatetimeLocal(post?.publishedAt)}
          initialContent={documentToText(post?.content?.document)}
          originalDocument={post?.content?.document ?? null}
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
  authorId,
  initialTitle,
  initialExcerpt,
  initialProduct,
  initialPublished,
  initialPublishedAt,
  initialContent,
  originalDocument,
  initialCategoryId,
  initialTagIds,
  initialImageUrl,
  saving,
  setSaving,
  onClose,
  onSaved,
}: {
  postId: string | null;
  authorId: string | null;
  initialTitle: string;
  initialExcerpt: string;
  initialProduct: string;
  initialPublished: boolean;
  initialPublishedAt: string;
  initialContent: string;
  originalDocument: unknown;
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
  const [content, setContent] = useState(initialContent);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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

    if (!postId || content !== initialContent) {
      payload.content = textToDocument(content);
    } else if (originalDocument) {
      payload.content = originalDocument;
    }

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
    if (!postId && authorId) payload.author = { connect: { id: authorId } };

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
                      : "border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-white"
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
            <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
              No hay categorías de {POST_PRODUCT_LABELS[product] ?? "este blog"}.
              Créalas en la vista Categorías.
            </p>
          ) : null}
        </label>

        <fieldset>
          <legend className={labelClass}>Etiquetas</legend>
          {(tagsData?.tags ?? []).length === 0 ? (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
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
                        : "border-[#e0e0e0] dark:border-[#3a3a3a] text-[#424242] dark:text-[#e0e0e0]"
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

        <label className="block">
          <span className={labelClass}>Artículo</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            className={`${fieldClass} h-auto min-h-48 py-3 leading-relaxed`}
            placeholder={"Primer párrafo.\n\n## Un subtítulo\n\n- Una idea\n- Otra idea"}
          />
          <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Deja una línea en blanco entre párrafos. # título, ## subtítulo, - lista,
            **negrita**, *cursiva*, [texto](https://…) y --- para separar.
          </p>
        </label>

        <div>
          <span className={labelClass}>Portada</span>
          {cover ? (
            <img
              src={cover}
              alt=""
              className="mb-3 h-40 w-full rounded-xl object-cover bg-[#f5f5f5] dark:bg-[#2a2a2a]"
            />
          ) : (
            <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] text-sm text-[#616161] dark:text-[#b0b0b0]">
              Sin imagen
            </div>
          )}
          <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] px-4 text-sm font-semibold text-[#212121] dark:text-white">
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
            <span className="block text-sm font-semibold text-[#212121] dark:text-white">
              Publicado
            </span>
            <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
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

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 sm:px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-11 rounded-xl px-5 text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] cursor-pointer disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar artículo"}
        </button>
      </div>
    </form>
  );
}
