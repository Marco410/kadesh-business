"use client";

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorState } from "../shared";
import BlogCard from "./BlogCard";
import { PostFavoritesBatchProvider } from "./hooks/PostFavoritesBatch";
import BlogCardSkeleton from "./BlogCardSkeleton";
import EmptyBlogState from "./EmptyBlogState";
import { useBlogPosts } from "./hooks/useBlogPosts";
import { BlogPost, PostWhereInput } from "./types";
import { friendlyErrorText } from "kadesh/utils/errorText";

interface BlogSectionProps {
  /** Clases de la cuadrícula; con la columna lateral del índice va a 3 por fila. */
  gridClassName?: string;
  postsPerPage?: number;
  showPagination?: boolean;
  initialPosts?: BlogPost[];
  initialCount?: number;
  initialCategory?: string | null;
}

function PaginationButton({
  children,
  onClick,
  disabled,
  isActive = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'bg-[#f5f5f5] text-[#212121] hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e1e1e] dark:text-[#ffffff] dark:hover:bg-orange-500'
      }`}
    >
      {children}
    </button>
  );
}

const DEFAULT_GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4';

function BlogSectionContent({
  gridClassName = DEFAULT_GRID,
  postsPerPage = 12,
  showPagination = true,
  initialPosts = [],
  initialCount = 0,
  initialCategory = null,
}: BlogSectionProps) {
  const searchParams = useSearchParams();
  const categoryUrl = searchParams.get('category');
  const matchesInitialCategory =
    (categoryUrl || null) === (initialCategory || null);

  const where: PostWhereInput | null = useMemo(() => {
    return categoryUrl
      ? {
          category: {
            url: {
              equals: categoryUrl,
            },
          },
        }
      : null;
  }, [categoryUrl]);

  const {
    posts,
    loading,
    isPageLoading,
    error,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
  } = useBlogPosts({
    where,
    postsPerPage,
    initialPosts: matchesInitialCategory ? initialPosts : [],
    initialCount: matchesInitialCategory ? initialCount : 0,
  });

  const pageNumbers = useMemo(() => {
    const count = Math.min(totalPages, 5);
    return Array.from({ length: count }, (_, i) => {
      if (totalPages <= 5) {
        return i + 1;
      }
      if (currentPage <= 3) {
        return i + 1;
      }
      if (currentPage >= totalPages - 2) {
        return totalPages - 4 + i;
      }
      return currentPage - 2 + i;
    });
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: postsPerPage || 8 }).map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <ErrorState
        message={friendlyErrorText(error, 'Error desconocido al cargar los posts')}
        title="Error al cargar los posts"
      />
    );
  }

  if (posts.length === 0) {
    return <EmptyBlogState />;
  }

  return (
    <>
      <div
        id="blog-posts"
        className={`${gridClassName} ${
          isPageLoading ? 'opacity-60' : ''
        }`}
      >
        <PostFavoritesBatchProvider postIds={posts.map((post) => post.id)}>
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </PostFavoritesBatchProvider>
      </div>

      {showPagination && totalPages > 1 && (
        <nav
          aria-label="Paginación del blog"
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          <PaginationButton
            onClick={previousPage}
            disabled={!hasPreviousPage || isPageLoading}
            ariaLabel="Página anterior"
          >
            Anterior
          </PaginationButton>

          {pageNumbers.map((page) => (
            <PaginationButton
              key={page}
              onClick={() => goToPage(page)}
              disabled={isPageLoading}
              isActive={currentPage === page}
              ariaLabel={`Ir a la página ${page}`}
            >
              {page}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={nextPage}
            disabled={!hasNextPage || isPageLoading}
            ariaLabel="Página siguiente"
          >
            Siguiente
          </PaginationButton>
        </nav>
      )}
    </>
  );
}

export default function BlogSection({
  gridClassName = DEFAULT_GRID,
  postsPerPage = 12,
  showPagination = true,
  initialPosts = [],
  initialCount = 0,
  initialCategory = null,
}: BlogSectionProps) {
  return (
    <Suspense
      fallback={
        <div className={gridClassName}>
          {Array.from({ length: postsPerPage || 8 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      }
    >
      <BlogSectionContent
        gridClassName={gridClassName}
        postsPerPage={postsPerPage}
        showPagination={showPagination}
        initialPosts={initialPosts}
        initialCount={initialCount}
        initialCategory={initialCategory}
      />
    </Suspense>
  );
}
