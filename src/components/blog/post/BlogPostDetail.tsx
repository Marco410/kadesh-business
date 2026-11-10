"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Image01Icon,
} from '@hugeicons/core-free-icons';
import type { BlogPostDetail, BlogSidebarCategory, RelatedPostsResult } from '../types';
import { getCategoryLabel, getCategoryColors } from '../constants';
import { Routes } from 'kadesh/core/routes';
import renderers from 'kadesh/utils/renderes';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import PostActions from './PostActions';
import AuthorCard from './AuthorCard';
import CommentsSection from './CommentsSection';
import BlogSidebar from '../BlogSidebar';
import { dayKeyMx, formatLongDateMx } from 'kadesh/utils/format-date';

interface BlogPostDetailProps {
  post: BlogPostDetail;
  /** Para la columna derecha (relacionados o, si no hay, los más recientes). */
  related?: RelatedPostsResult;
  /** Categorías del blog, debajo de la publicidad. */
  categories?: BlogSidebarCategory[];
}

export default function BlogPostDetailComponent({ post, related, categories }: BlogPostDetailProps) {
  const categoryValue = post.category?.name || '';
  const categoryLabel = getCategoryLabel(categoryValue);
  const categoryColors = getCategoryColors(categoryValue);
  const publishedAt = post.publishedAt || post.createdAt;
  // "Actualizado" solo si cae otro día que la publicación, contando días de México.
  const showUpdated = Boolean(post.updatedAt) && dayKeyMx(post.updatedAt) !== dayKeyMx(publishedAt);

  return (
    <article className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <nav
        aria-label="Miga de pan"
        className="border-b border-[#e0e0e0] px-4 pt-24 pb-3 sm:px-6 lg:px-8 dark:border-[#3a3a3a]"
      >
        <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          <li>
            <Link href={Routes.home} className="min-h-11 inline-flex items-center hover:text-orange-500">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={Routes.blog.index} className="min-h-11 inline-flex items-center hover:text-orange-500">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="break-words font-medium text-[#212121] dark:text-[#ffffff]" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Header con imagen */}
      <header className="relative w-full h-150 overflow-hidden">
        {post.image?.url ? (
          <Image
            src={post.image.url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center">
            <HugeiconsIcon
              icon={Image01Icon}
              size={128}
              className="text-[#616161] dark:text-[#b0b0b0]"
              strokeWidth={1.5}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4">
              <Link
                href={`${Routes.blog.index}?category=${post.category?.url}`}
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColors.border} ${categoryColors.bg} ${categoryColors.text} dark:border-opacity-70`}
              >
                {categoryLabel}
              </Link>
            </div>
            <h1 className="mb-4 max-w-4xl text-balance break-words text-4xl font-bold sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="text-sm">
              <span className="font-medium">Publicado el: </span>
              {/* Hora de México fija: igual en el servidor (UTC) y en el navegador. */}
              <time className="font-bold" dateTime={publishedAt}>
                {formatLongDateMx(publishedAt)}
              </time>
              {showUpdated && (
                <>
                  <span className="font-medium"> · Actualizado el: </span>
                  <time className="font-bold" dateTime={post.updatedAt}>
                    {formatLongDateMx(post.updatedAt)}
                  </time>
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Columna de lectura (~68ch) y, a la derecha, relacionados + publicidad + categorías. */}
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <main className="min-w-0 max-w-[42rem]">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <PostActions 
              postId={post.id}
              viewsCount={post.post_viewsCount}
              postUrl={Routes.blog.post(post.url)}
              postTitle={post.title}
            /> 
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-lg"
        >
          <DocumentRenderer document={post.content?.document ?? []} renderers={renderers} />
        </motion.div>

        <div className="mb-8 flex flex-col gap-4 border-b border-[#e0e0e0] pb-8 lg:flex-row lg:items-center dark:border-[#3a3a3a]">
          <AuthorCard author={post.author} />
          <PostActions 
            postId={post.id}
            viewsCount={post.post_viewsCount}
            postUrl={Routes.blog.post(post.url)}
            postTitle={post.title}
          />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="px-3 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#616161] dark:text-[#b0b0b0] text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <CommentsSection postId={post.id} />
      </main>

      <BlogSidebar
        title={related?.related ? 'Artículos relacionados' : 'Lo más reciente'}
        posts={related?.posts ?? []}
        categories={categories}
        activeCategory={post.category?.url}
      />
      </div>
    </article>
  );
}

