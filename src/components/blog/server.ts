import type {
  BlogPost,
  BlogPostDetail,
  BlogSidebarCategory,
  BlogSidebarPost,
  RelatedPostsResult,
} from './types';
import { BLOG_PRODUCT_FILTER } from './constants';

const REVALIDATE_SECONDS = 60;
const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_MAX_POSTS = 2000;

const PUBLISHED_EQUALS = { equals: true };

/** Un post programado (`publishedAt` a futuro) no debe aparecer en el sitio hasta esa fecha. */
function duePublishedAtFilter(): { lte: string } {
  return { lte: new Date().toISOString() };
}

const POST_CARD_FIELDS = `
  id
  title
  url
  excerpt
  publishedAt
  createdAt
  updatedAt
  image {
    url
  }
  author: authorProfile {
    name
    lastName
    username
    verified
    profileImage {
      url
    }
    createdAt
  }
  category {
    name
    url
  }
  tags {
    name
  }
  commentsCount
  post_favoritesCount
  post_likesCount
  post_viewsCount
`;

const POST_BY_URL_QUERY = `
  query GetPublishedPostByUrl($url: String!, $now: DateTime!) {
    posts(
      where: {
        url: { equals: $url }
        published: { equals: true }
        publishedAt: { lte: $now }
        product: { in: ["saas", "all"] }
      }
      take: 1
    ) {
      ${POST_CARD_FIELDS}
      published
      content {
        document
      }
    }
  }
`;

const PUBLISHED_POSTS_QUERY = `
  query GetPublishedPosts(
    $take: Int
    $skip: Int!
    $where: PostWhereInput!
    $orderBy: [PostOrderByInput!]!
  ) {
    posts(take: $take, skip: $skip, where: $where, orderBy: $orderBy) {
      ${POST_CARD_FIELDS}
    }
    postsCount(where: $where)
  }
`;

/** Lo que necesita la columna del blog: sin contenido, autor ni etiquetas. */
const SIDEBAR_POSTS_QUERY = `
  query GetSidebarPosts(
    $take: Int
    $where: PostWhereInput!
    $orderBy: [PostOrderByInput!]!
  ) {
    posts(take: $take, where: $where, orderBy: $orderBy) {
      id
      title
      url
      publishedAt
      createdAt
      image {
        url
      }
      category {
        name
        url
      }
      post_viewsCount
    }
  }
`;

/** Productos de este blog, como lista literal de GraphQL (`["pet", "all"]`). */
const PRODUCT_LIST = JSON.stringify(BLOG_PRODUCT_FILTER.in);

/** Categorías de este blog con cuántos artículos publicados (y ya en fecha) tiene cada una. */
const SIDEBAR_CATEGORIES_QUERY = `
  query GetBlogCategories($now: DateTime!) {
    categories(where: { product: { in: ${PRODUCT_LIST} } }) {
      id
      name
      url
      postsCount(
        where: {
          published: { equals: true }
          publishedAt: { lte: $now }
          product: { in: ${PRODUCT_LIST} }
        }
      )
    }
  }
`;

const SITEMAP_POSTS_QUERY = `
  query GetSitemapPosts(
    $take: Int
    $skip: Int!
    $where: PostWhereInput!
    $orderBy: [PostOrderByInput!]!
  ) {
    posts(take: $take, skip: $skip, where: $where, orderBy: $orderBy) {
      url
      updatedAt
      publishedAt
    }
    postsCount
  }
`;

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export type SitemapPost = {
  url: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
};

type PostByUrlData = {
  posts: BlogPostDetail[] | null;
};

type PublishedPostsData = {
  posts: Array<Omit<BlogPost, 'content'> & { updatedAt?: string | null }>;
  postsCount: number;
};

type SidebarPostsData = {
  posts: BlogSidebarPost[] | null;
};

type SidebarCategoriesData = {
  categories: BlogSidebarCategory[] | null;
};

type SitemapPostsData = {
  posts: SitemapPost[] | null;
  postsCount: number;
};

async function queryGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GraphqlResponse<T>;
    if (payload.errors?.length) {
      console.error('Blog GraphQL errors:', payload.errors);
      return null;
    }

    return payload.data ?? null;
  } catch (error) {
    console.error('Blog GraphQL fetch failed:', error);
    return null;
  }
}

function toBlogPost(
  post: Omit<BlogPost, 'content'> & { updatedAt?: string | null },
): BlogPost {
  return {
    ...post,
    content: { document: [] },
  };
}

export async function fetchPublishedPostByUrl(
  url: string,
): Promise<BlogPostDetail | null> {
  if (!url) {
    return null;
  }

  const data = await queryGraphql<PostByUrlData>(POST_BY_URL_QUERY, {
    url,
    now: new Date().toISOString(),
  });
  const post = data?.posts?.[0];
  const isScheduledForLater = post?.publishedAt ? new Date(post.publishedAt) > new Date() : false;
  if (!post?.url || post.published === false || isScheduledForLater) {
    return null;
  }

  return post;
}

export async function fetchPublishedPosts(options?: {
  take?: number;
  skip?: number;
  categoryUrl?: string | null;
}): Promise<{ posts: BlogPost[]; postsCount: number }> {
  const where: Record<string, unknown> = {
    published: PUBLISHED_EQUALS,
    publishedAt: duePublishedAtFilter(),
    product: BLOG_PRODUCT_FILTER,
  };

  if (options?.categoryUrl) {
    where.category = {
      url: { equals: options.categoryUrl },
    };
  }

  const data = await queryGraphql<PublishedPostsData>(PUBLISHED_POSTS_QUERY, {
    take: options?.take ?? 12,
    skip: options?.skip ?? 0,
    where,
    orderBy: [{ publishedAt: 'desc' }],
  });

  return {
    posts: (data?.posts ?? []).filter((post) => Boolean(post.url)).map(toBlogPost),
    postsCount: data?.postsCount ?? 0,
  };
}

/** Publicados de este blog que ya pasaron su fecha de publicación. */
function publishedWhere(): Record<string, unknown> {
  return {
    published: PUBLISHED_EQUALS,
    publishedAt: duePublishedAtFilter(),
    product: BLOG_PRODUCT_FILTER,
  };
}

async function fetchSidebarPosts(
  where: Record<string, unknown>,
  take: number,
): Promise<BlogSidebarPost[]> {
  const data = await queryGraphql<SidebarPostsData>(SIDEBAR_POSTS_QUERY, {
    take,
    where,
    orderBy: [{ publishedAt: 'desc' }],
  });
  return (data?.posts ?? []).filter((post) => Boolean(post.url));
}

/** Cuántos artículos recientes se revisan para elegir los más leídos. */
const MOST_VIEWED_POOL = 200;

/**
 * Los más leídos. Keystone no ordena por un conteo (`post_viewsCount`), así que se piden los
 * publicados más recientes y se ordenan aquí (empates: el más reciente primero). Queda en el caché
 * de 60 s de la página, como el resto del blog.
 */
export async function fetchMostViewedPosts(limit = 5): Promise<BlogSidebarPost[]> {
  const posts = await fetchSidebarPosts(publishedWhere(), MOST_VIEWED_POOL);
  return [...posts]
    .sort((a, b) => (b.post_viewsCount ?? 0) - (a.post_viewsCount ?? 0))
    .slice(0, limit);
}

/**
 * Relacionados: comparten alguna etiqueta o la categoría, los más recientes primero. Si no hay
 * ninguno, los más recientes del blog (`related: false`), para no dejar la columna vacía.
 */
export async function fetchRelatedPosts(
  post: Pick<BlogPostDetail, 'id' | 'tags' | 'category'>,
  limit = 5,
): Promise<RelatedPostsResult> {
  const where = { ...publishedWhere(), id: { not: { equals: post.id } } };
  const conditions = [
    ...(post.tags?.length
      ? [{ tags: { some: { name: { in: post.tags.map((tag) => tag.name) } } } }]
      : []),
    ...(post.category?.url ? [{ category: { url: { equals: post.category.url } } }] : []),
  ];

  if (conditions.length > 0) {
    const related = await fetchSidebarPosts({ ...where, OR: conditions }, limit);
    if (related.length > 0) return { posts: related, related: true };
  }

  return { posts: await fetchSidebarPosts(where, limit), related: false };
}

/** Categorías con artículos publicados, de la que más tiene a la que menos. */
export async function fetchBlogCategories(): Promise<BlogSidebarCategory[]> {
  const data = await queryGraphql<SidebarCategoriesData>(SIDEBAR_CATEGORIES_QUERY, {
    now: new Date().toISOString(),
  });
  return (data?.categories ?? [])
    .filter((category) => Boolean(category.url) && category.postsCount > 0)
    .sort((a, b) => b.postsCount - a.postsCount || a.name.localeCompare(b.name, 'es'));
}

export async function fetchPublishedPostsForSitemap(): Promise<SitemapPost[]> {
  const where = {
    published: PUBLISHED_EQUALS,
    publishedAt: duePublishedAtFilter(),
    product: BLOG_PRODUCT_FILTER,
  };
  const orderBy = [{ publishedAt: 'desc' as const }];
  const posts: SitemapPost[] = [];
  let skip = 0;

  while (posts.length < SITEMAP_MAX_POSTS) {
    const data = await queryGraphql<SitemapPostsData>(SITEMAP_POSTS_QUERY, {
      take: SITEMAP_PAGE_SIZE,
      skip,
      where,
      orderBy,
    });

    const page = (data?.posts ?? []).filter((post) => Boolean(post.url));
    posts.push(...page);

    const total = data?.postsCount ?? posts.length;
    skip += SITEMAP_PAGE_SIZE;

    if (page.length === 0 || skip >= total || posts.length >= SITEMAP_MAX_POSTS) {
      break;
    }
  }

  return posts.slice(0, SITEMAP_MAX_POSTS);
}
