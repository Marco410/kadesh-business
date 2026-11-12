import JsonLd from 'kadesh/components/blog/JsonLd';
import BlogIndexClient from 'kadesh/components/blog/BlogIndexClient';
import {
  buildBlogIndexJsonLd,
  buildBlogIndexMetadata,
} from 'kadesh/components/blog/blog-seo';
import {
  fetchBlogCategories,
  fetchBlogCategoryCards,
  fetchMostViewedPosts,
  fetchPublishedPosts,
} from 'kadesh/components/blog/server';

export const revalidate = 60;

export const metadata = buildBlogIndexMetadata();

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [{ posts, postsCount }, mostViewed, categories, categoryCards] = await Promise.all([
    fetchPublishedPosts({
      take: 12,
      skip: 0,
      categoryUrl: category || null,
    }),
    fetchMostViewedPosts(5),
    fetchBlogCategories(),
    fetchBlogCategoryCards(),
  ]);

  return (
    <>
      <JsonLd data={buildBlogIndexJsonLd(posts)} />
      <BlogIndexClient
        initialPosts={posts}
        initialCount={postsCount}
        initialCategory={category || null}
        mostViewed={mostViewed}
        categories={categories}
        categoryCards={categoryCards}
      />
    </>
  );
}
