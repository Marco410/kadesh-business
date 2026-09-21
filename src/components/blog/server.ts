import type { BlogPost, BlogPostDetail } from './types';
import { BLOG_PRODUCT_FILTER } from './constants';

const REVALIDATE_SECONDS = 60;
const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_MAX_POSTS = 2000;

const PUBLISHED_EQUALS = { equals: true };

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
  author {
    id
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
  query GetPublishedPostByUrl($url: String!) {
    posts(
      where: {
        url: { equals: $url }
        published: { equals: true }
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

  const data = await queryGraphql<PostByUrlData>(POST_BY_URL_QUERY, { url });
  const post = data?.posts?.[0];
  if (!post?.url || post.published === false) {
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

export async function fetchPublishedPostsForSitemap(): Promise<SitemapPost[]> {
  const where = { published: PUBLISHED_EQUALS, product: BLOG_PRODUCT_FILTER };
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
