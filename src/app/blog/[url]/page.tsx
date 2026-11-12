import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from 'kadesh/components/blog/JsonLd';
import {
  buildBlogPostingJsonLd,
  buildMissingPostMetadata,
  buildPostMetadata,
} from 'kadesh/components/blog/blog-seo';
import {
  fetchBlogCategories,
  fetchPublishedPostByUrl,
  fetchRelatedPosts,
} from 'kadesh/components/blog/server';
import BlogPostPageClient from 'kadesh/components/blog/post/BlogPostPageClient';

// Misma ventana que el caché de datos del blog (`CACHE_WINDOW_SECONDS` en blog/server.ts).
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url: string }>;
}): Promise<Metadata> {
  const { url } = await params;
  const post = await fetchPublishedPostByUrl(url);

  if (!post) {
    return buildMissingPostMetadata();
  }

  return buildPostMetadata(post);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const post = await fetchPublishedPostByUrl(url);

  if (!post) {
    notFound();
  }

  const [related, categories] = await Promise.all([
    fetchRelatedPosts(post),
    fetchBlogCategories(),
  ]);

  return (
    <>
      <JsonLd data={buildBlogPostingJsonLd(post)} />
      <BlogPostPageClient post={post} related={related} categories={categories} />
    </>
  );
}
