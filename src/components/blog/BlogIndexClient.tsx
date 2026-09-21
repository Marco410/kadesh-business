"use client";

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Footer, Navigation } from 'kadesh/components/layout';
import { BlogSection, CategorySection } from 'kadesh/components/blog';
import { NewsletterSubscription } from 'kadesh/components/newsletter';
import { useSearchParams } from 'next/navigation';
import { Routes } from 'kadesh/core/routes';
import type { BlogPost } from './types';

function BlogFilters() {
  const searchParams = useSearchParams();
  const categoryUrl = searchParams.get('category');

  return (
    categoryUrl && (
      <Link
        href={Routes.blog.index}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 dark:hover:bg-orange-600"
        aria-label="Limpiar filtros de categoría"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Limpiar filtros</span>
      </Link>
    )
  );
}

type BlogIndexClientProps = {
  initialPosts: BlogPost[];
  initialCount?: number;
  initialCategory?: string | null;
};

export default function BlogIndexClient({
  initialPosts,
  initialCount = 0,
  initialCategory = null,
}: BlogIndexClientProps) {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />

      <header className="relative overflow-hidden px-4 py-30 text-white sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]"
        />

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 break-words text-4xl font-bold sm:text-5xl lg:text-6xl"
          >
            Blog KADESH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg opacity-95 sm:text-xl"
          >
            Guías y consejos para prospectar, organizar y cerrar más ventas B2B
          </motion.p>
        </div>
      </header>

      <nav
        aria-label="Filtros del blog"
        className="mx-auto max-w-7xl border-b border-[#e0e0e0] px-4 py-6 sm:px-6 lg:px-8 dark:border-[#3a3a3a]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={null}>
            <BlogFilters />
          </Suspense>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
        <BlogSection
          initialPosts={initialPosts}
          initialCount={initialCount}
          initialCategory={initialCategory}
        />
      </main>

      <CategorySection />
      <NewsletterSubscription className="mt-16" />
      <Footer />
    </div>
  );
}
