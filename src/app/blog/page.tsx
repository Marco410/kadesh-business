import JsonLd from 'kadesh/components/blog/JsonLd';
import BlogIndexClient from 'kadesh/components/blog/BlogIndexClient';
import {
  buildBlogIndexJsonLd,
  buildBlogIndexMetadata,
} from 'kadesh/components/blog/blog-seo';
import { fetchPublishedPosts } from 'kadesh/components/blog/server';

export const revalidate = 60;

export const metadata = buildBlogIndexMetadata();

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { posts, postsCount } = await fetchPublishedPosts({
    take: 12,
    skip: 0,
    categoryUrl: category || null,
  });

  return (
    <>
      <JsonLd data={buildBlogIndexJsonLd(posts)} />
      <BlogIndexClient
        initialPosts={posts}
        initialCount={postsCount}
        initialCategory={category || null}
      />
    </>
  );
}
