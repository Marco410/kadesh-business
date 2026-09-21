import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from 'kadesh/components/blog/JsonLd';
import {
  buildBlogPostingJsonLd,
  buildMissingPostMetadata,
  buildPostMetadata,
} from 'kadesh/components/blog/blog-seo';
import { fetchPublishedPostByUrl } from 'kadesh/components/blog/server';
import BlogPostPageClient from 'kadesh/components/blog/post/BlogPostPageClient';

export const revalidate = 60;

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

  return (
    <>
      <JsonLd data={buildBlogPostingJsonLd(post)} />
      <BlogPostPageClient post={post} />
    </>
  );
}
