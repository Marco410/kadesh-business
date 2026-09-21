import Link from 'next/link';
import type { Metadata } from 'next';
import { Footer, Navigation } from 'kadesh/components/layout';
import { buildMissingPostMetadata } from 'kadesh/components/blog/blog-seo';
import { Routes } from 'kadesh/core/routes';

export const metadata: Metadata = buildMissingPostMetadata();

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-4 break-words text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
          Artículo no encontrado
        </h1>
        <p className="mb-8 text-[#616161] dark:text-[#b0b0b0]">
          Este artículo no existe o ya no está publicado.
        </p>
        <Link
          href={Routes.blog.index}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Volver al blog
        </Link>
      </main>
      <Footer />
    </div>
  );
}
