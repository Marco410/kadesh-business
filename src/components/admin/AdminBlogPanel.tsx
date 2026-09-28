"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { getCategoryLabel } from "kadesh/components/blog/constants";
import { formatDateShort } from "kadesh/utils/format-date";
import AdminBlogCategoriesPanel from "./AdminBlogCategoriesPanel";
import AdminBlogPostForm from "./AdminBlogPostForm";
import AdminBlogTagsPanel from "./AdminBlogTagsPanel";
import {
  ADMIN_BLOG_POSTS_QUERY,
  type AdminBlogPostsResponse,
} from "./blog-queries";
import {
  ADMIN_PAGE_SIZE,
  BLOG_VISTAS,
  POST_PRODUCT_BADGE,
  POST_PRODUCT_LABELS,
  POST_STATUS_FILTERS,
  type BlogVista,
} from "./constants";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterChips,
  AdminLoadingRows,
  AdminPagination,
  AdminSearchInput,
  AdminSegmented,
  AdminStatusBadge,
  surfaceClass,
} from "./ui";

const PRODUCT_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "pet", label: "Pet" },
  { value: "saas", label: "SaaS" },
  { value: "all-products", label: "Ambos" },
];

export default function AdminBlogPanel({
  vista = BLOG_VISTAS.ARTICLES,
  onVistaChange,
}: {
  vista?: BlogVista;
  onVistaChange?: (vista: BlogVista) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        ariaLabel="Vista del blog"
        items={[
          { id: BLOG_VISTAS.ARTICLES, label: "Artículos" },
          { id: BLOG_VISTAS.CATEGORIES, label: "Categorías" },
          { id: BLOG_VISTAS.TAGS, label: "Etiquetas" },
        ]}
        value={vista}
        onChange={(next) => onVistaChange?.(next)}
      />
      {vista === BLOG_VISTAS.CATEGORIES ? <AdminBlogCategoriesPanel /> : null}
      {vista === BLOG_VISTAS.TAGS ? <AdminBlogTagsPanel /> : null}
      {vista === BLOG_VISTAS.ARTICLES ? <AdminBlogPostsPanel /> : null}
    </div>
  );
}

function AdminBlogPostsPanel() {
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState("all");
  const [status, setStatus] = useState<(typeof POST_STATUS_FILTERS)[number]["value"]>(
    "all",
  );
  const [page, setPage] = useState(1);
  const [editorId, setEditorId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const where = useMemo(() => {
    const filters: Record<string, unknown>[] = [];
    const query = debouncedSearch.trim();
    if (query) {
      filters.push({ title: { contains: query, mode: "insensitive" } });
    }
    if (product === "pet" || product === "saas") {
      filters.push({ product: { equals: product } });
    }
    if (product === "all-products") {
      filters.push({ product: { equals: "all" } });
    }
    if (status === "published") filters.push({ published: { equals: true } });
    if (status === "draft") filters.push({ published: { equals: false } });
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { AND: filters };
  }, [debouncedSearch, product, status]);

  const { data, loading, error, refetch } = useQuery<AdminBlogPostsResponse>(
    ADMIN_BLOG_POSTS_QUERY,
    {
      variables: {
        where,
        take: ADMIN_PAGE_SIZE,
        skip: (page - 1) * ADMIN_PAGE_SIZE,
      },
      fetchPolicy: "network-only",
    },
  );

  const posts = data?.posts ?? [];
  const totalCount = data?.postsCount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <AdminBlogPostForm
        postId={editorId}
        onClose={() => setEditorId(null)}
        onSaved={() => {
          void refetch();
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] max-w-xl">
          Artículos de Pet, de SaaS o de los dos. La portada es la imagen que
          se ve en la lista y al abrir el artículo.
        </p>
        <button
          type="button"
          onClick={() => setEditorId("new")}
          className="h-11 shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold cursor-pointer"
        >
          Nuevo artículo
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por título"
        />
        <AdminFilterChips
          label="Blog"
          options={PRODUCT_FILTERS}
          value={product}
          onChange={(value) => {
            setProduct(value);
            setPage(1);
          }}
        />
        <AdminFilterChips
          label="Estado"
          options={[...POST_STATUS_FILTERS]}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <AdminErrorState message="No se pudieron cargar los artículos." />
      ) : loading && posts.length === 0 ? (
        <AdminLoadingRows />
      ) : posts.length === 0 ? (
        <AdminEmptyState
          title="No hay artículos con este filtro"
          description="Crea uno nuevo o cambia el blog y el estado."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} onOpen={() => setEditorId(post.id)} />
              </li>
            ))}
          </ul>

          <div className={`${surfaceClass} hidden md:block overflow-x-auto`}>
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] border-b border-[#e8e8e8] dark:border-[#333]">
                  <th className="px-4 py-3">Artículo</th>
                  <th className="px-4 py-3">Blog</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setEditorId(post.id)}
                        className="flex items-center gap-3 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-lg"
                      >
                        <PostThumb url={post.image?.url} />
                        <span className="min-w-0">
                          <span className="block font-semibold text-[#212121] dark:text-white">
                            {post.title || "Sin título"}
                          </span>
                          <span className="block text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                            {getCategoryLabel(post.category?.name)}
                            {post.tags.length > 0
                              ? ` · ${post.tags.map((tag) => tag.name).filter(Boolean).join(", ")}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <ProductBadge product={post.product} />
                    </td>
                    <td className="px-4 py-3">
                      <PublishedBadge published={Boolean(post.published)} />
                    </td>
                    <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                      {formatDateShort(post.updatedAt, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            totalCount={totalCount}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function PostCard({
  post,
  onOpen,
}: {
  post: AdminBlogPostsResponse["posts"][number];
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${surfaceClass} w-full p-3 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
    >
      <div className="flex items-start gap-3">
        <PostThumb url={post.image?.url} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[#212121] dark:text-white">
            {post.title || "Sin título"}
          </span>
          <span className="mt-1 flex flex-wrap gap-1.5">
            <ProductBadge product={post.product} />
            <PublishedBadge published={Boolean(post.published)} />
          </span>
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            {getCategoryLabel(post.category?.name)}
          </span>
        </span>
      </div>
    </button>
  );
}

function PostThumb({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <span className="h-14 w-14 shrink-0 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a]" />
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="h-14 w-14 shrink-0 rounded-xl object-cover"
    />
  );
}

function ProductBadge({ product }: { product: string | null }) {
  return (
    <AdminStatusBadge
      label={POST_PRODUCT_LABELS[product ?? ""] ?? product ?? "—"}
      className={POST_PRODUCT_BADGE[product ?? ""] ?? POST_PRODUCT_BADGE.all}
    />
  );
}

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <AdminStatusBadge
      label={published ? "Publicado" : "Borrador"}
      className={
        published
          ? "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20"
          : "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
      }
    />
  );
}
