"use client";

import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, ViewIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { BLOG_AD_SLOT } from 'kadesh/core/ads';
import AdSlot from 'kadesh/components/shared/AdSlot';
import { cn } from 'kadesh/utils/cn';
import { formatShortDateMx } from 'kadesh/utils/format-date';
import { getCategoryLabel } from './constants';
import type { BlogSidebarCategory, BlogSidebarPost } from './types';

const viewsFormat = new Intl.NumberFormat('es-MX');

/**
 * Publicidad + categorías se quedan fijas al hacer scroll solo en escritorio y con pantalla alta:
 * si no caben, lo de abajo no se alcanzaría a ver hasta el final del contenido.
 */
const STICKY_WHEN_TALL =
  '[@media(min-width:1024px)_and_(min-height:56rem)]:sticky [@media(min-width:1024px)_and_(min-height:56rem)]:top-24';

function viewsLabel(count: number) {
  return `${viewsFormat.format(count)} ${count === 1 ? 'vista' : 'vistas'}`;
}

interface BlogSidebarProps {
  title: string;
  posts: BlogSidebarPost[];
  /** Lo más leído: la lista va numerada y muestra las vistas; si no, la fecha. */
  ranked?: boolean;
  /** Categorías del blog, debajo de la publicidad. */
  categories?: BlogSidebarCategory[];
  /** URL de la categoría que se está viendo (se marca en la lista). */
  activeCategory?: string | null;
  className?: string;
}

/**
 * Columna derecha del blog: una lista de artículos (lo más leído o relacionados), el bloque de
 * publicidad y las categorías. En móvil va después del contenido. Las fechas van en hora de México
 * para que el servidor y el navegador coincidan.
 */
export default function BlogSidebar({
  title,
  posts,
  ranked = false,
  categories = [],
  activeCategory = null,
  className,
}: BlogSidebarProps) {
  const List = ranked ? 'ol' : 'ul';

  return (
    <aside
      aria-label="Más del blog"
      className={cn('flex min-w-0 flex-col gap-10 lg:self-stretch', className)}
    >
      {posts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold tracking-[-0.01em] text-[#212121] dark:text-white">
            {title}
          </h2>
          <List className="mt-3 divide-y divide-[#e0e0e0] dark:divide-[#3a3a3a]">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={Routes.blog.post(post.url)}
                  className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-[#1e1e1e]"
                >
                  {ranked && (
                    <span
                      aria-hidden="true"
                      className="w-5 shrink-0 pt-0.5 text-right text-base font-black tabular-nums leading-snug text-orange-500"
                    >
                      {index + 1}
                    </span>
                  )}
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e]">
                    {post.image?.url ? (
                      <Image
                        src={post.image.url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[#9e9e9e]">
                        <HugeiconsIcon icon={Image01Icon} size={22} strokeWidth={1.5} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-3 text-sm font-semibold leading-snug text-[#212121] transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400">
                      {post.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {ranked ? (
                        <>
                          <HugeiconsIcon icon={ViewIcon} size={14} strokeWidth={1.5} aria-hidden="true" />
                          {viewsLabel(post.post_viewsCount ?? 0)}
                        </>
                      ) : (
                        <time dateTime={post.publishedAt || post.createdAt}>
                          {formatShortDateMx(post.publishedAt || post.createdAt)}
                        </time>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </List>
        </section>
      )}

      <div className={cn('flex flex-col gap-10', STICKY_WHEN_TALL)}>
        {/* El mismo bloque de publicidad que el detalle de animal (solo se pinta en el navegador). */}
        <AdSlot slot={BLOG_AD_SLOT} />

        {categories.length > 0 && (
          <nav aria-label="Categorías del blog">
            <h2 className="text-lg font-bold tracking-[-0.01em] text-[#212121] dark:text-white">
              Categorías
            </h2>
            <ul className="mt-2">
              {categories.map((category) => {
                const active = category.url === activeCategory;
                return (
                  <li key={category.id}>
                    <Link
                      href={`${Routes.blog.index}?category=${encodeURIComponent(category.url)}`}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        '-mx-2 flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 text-sm transition-colors hover:bg-[#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-[#1e1e1e]',
                        active
                          ? 'font-semibold text-orange-500 dark:text-orange-400'
                          : 'text-[#424242] hover:text-orange-500 dark:text-[#e0e0e0] dark:hover:text-orange-400',
                      )}
                    >
                      <span className="min-w-0 truncate">{getCategoryLabel(category.name)}</span>
                      <span className="shrink-0 rounded-full border border-[#e0e0e0] px-2 py-0.5 text-xs tabular-nums text-[#616161] dark:border-[#3a3a3a] dark:text-[#b0b0b0]">
                        {category.postsCount}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </aside>
  );
}
