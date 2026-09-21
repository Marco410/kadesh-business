import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import type { BlogPost, BlogPostDetail } from './types';

export const BLOG_INDEX_TITLE = 'Blog';
export const BLOG_INDEX_DESCRIPTION =
  'Guías y consejos de prospección B2B en México: cómo conseguir leads desde Google Maps, organizarlos en un CRM y cerrar más ventas.';
export const BLOG_INDEX_OG_DESCRIPTION =
  'Artículos de KADESH Negocios sobre prospección B2B, generación de leads, CRM y ventas para empresas en México.';
export const BLOG_INDEX_PATH = Routes.blog.index;
export const BLOG_INDEX_CANONICAL = `${SITE_URL}${BLOG_INDEX_PATH}`;
export const BLOG_OG_IMAGE = '/og-image.png';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const BLOG_ID = `${BLOG_INDEX_CANONICAL}#blog`;
const DESCRIPTION_MAX = 160;

type JsonLd = Record<string, unknown>;

export function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/**
 * Resuelve la URL real (posiblemente firmada y con caducidad) de la portada del
 * CMS. Solo debe usarse en servidor para descargar la imagen; nunca se expone
 * en las etiquetas de compartir.
 */
export function resolvePostImageSource(imageUrl?: string | null): string | null {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${SITE_URL}${imageUrl}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const apiBase = apiUrl.replace(/\/api\/graphql\/?$/, '');
    return `${apiBase}/${imageUrl}`;
  }

  return null;
}

/**
 * URL de compartir de un post. La portada del CMS es una URL firmada que
 * caduca, así que se sirve mediante `/blog/<url>/og`, una URL estable de este
 * sitio que siempre entrega la portada vigente. Sin portada, imagen genérica.
 */
export function getShareImageUrl(post: {
  url: string;
  image?: { url?: string | null } | null;
}): string {
  if (!post.image?.url) {
    return absoluteUrl(BLOG_OG_IMAGE);
  }
  return `${SITE_URL}${Routes.blog.postImage(post.url)}`;
}

export function documentToPlainText(
  document: unknown,
  maxLength = DESCRIPTION_MAX,
): string {
  const parts: string[] = [];

  const walk = (node: unknown) => {
    if (!node || parts.join(' ').length >= maxLength + 40) {
      return;
    }
    if (typeof node === 'string') {
      parts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object') {
      const value = node as { text?: unknown; children?: unknown };
      if (typeof value.text === 'string') {
        parts.push(value.text);
      }
      if (value.children) {
        walk(value.children);
      }
    }
  };

  walk(document);
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function postDescription(post: {
  title: string;
  excerpt?: string | null;
  content?: { document?: unknown } | null;
}): string {
  const excerpt = post.excerpt?.trim();
  if (excerpt) {
    return excerpt.length > DESCRIPTION_MAX
      ? `${excerpt.slice(0, DESCRIPTION_MAX - 1).trim()}…`
      : excerpt;
  }

  const fromDocument = documentToPlainText(post.content?.document);
  if (fromDocument) {
    return fromDocument;
  }

  return `Artículo del blog de KADESH Negocios: ${post.title}`;
}

export function authorDisplayName(author?: {
  name?: string | null;
  lastName?: string | null;
} | null): string {
  return [author?.name, author?.lastName].filter(Boolean).join(' ').trim();
}

export function postCanonicalUrl(url: string): string {
  return `${SITE_URL}${Routes.blog.post(url)}`;
}

export function postDates(post: {
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}): { published: string; modified: string } {
  const published = post.publishedAt || post.createdAt || '';
  const modified = post.updatedAt || published;
  return { published, modified };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildBlogIndexJsonLd(posts: BlogPost[]): JsonLd {
  const itemList = posts
    .filter((post) => Boolean(post.url))
    .map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: postCanonicalUrl(post.url),
      name: post.title,
    }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': BLOG_ID,
        name: 'Blog KADESH',
        description: BLOG_INDEX_DESCRIPTION,
        url: BLOG_INDEX_CANONICAL,
        inLanguage: 'es-MX',
        publisher: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: 'KADESH',
          url: SITE_URL,
        },
        about: {
          '@type': 'Thing',
          name: 'Prospección B2B y ventas',
        },
        blogPost: itemList.map((item) => ({
          '@type': 'BlogPosting',
          url: item.url,
          headline: item.name,
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${BLOG_INDEX_CANONICAL}#itemlist`,
        name: 'Artículos recientes de KADESH',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: itemList.length,
        itemListElement: itemList,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BLOG_INDEX_CANONICAL}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: BLOG_INDEX_CANONICAL,
          },
        ],
      },
    ],
  };
}

export function buildBlogPostingJsonLd(post: BlogPostDetail): JsonLd {
  const url = postCanonicalUrl(post.url);
  const description = postDescription(post);
  const { published, modified } = postDates(post);
  const image = getShareImageUrl(post);
  const authorName = authorDisplayName(post.author);
  const keywords = (post.tags ?? [])
    .map((tag) => tag.name)
    .filter(Boolean)
    .join(', ');

  const authorNode = authorName
    ? {
        '@type': 'Person',
        name: authorName,
      }
    : {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'KADESH',
      };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description,
        image,
        datePublished: published || undefined,
        dateModified: modified || published || undefined,
        author: authorNode,
        publisher: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: 'KADESH',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        url,
        isPartOf: {
          '@id': BLOG_ID,
        },
        inLanguage: 'es-MX',
        articleSection: post.category?.name || undefined,
        keywords: keywords || undefined,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'article .prose'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: BLOG_INDEX_CANONICAL,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: url,
          },
        ],
      },
    ],
  };
}

export function buildBlogIndexMetadata(): Metadata {
  return {
    title: BLOG_INDEX_TITLE,
    description: BLOG_INDEX_DESCRIPTION,
    openGraph: {
      title: `${BLOG_INDEX_TITLE} | KADESH`,
      description: BLOG_INDEX_OG_DESCRIPTION,
      url: BLOG_INDEX_PATH,
      siteName: 'KADESH',
      locale: 'es_MX',
      type: 'website',
      images: [
        {
          url: BLOG_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Blog KADESH Negocios — guías de prospección B2B, leads y CRM',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${BLOG_INDEX_TITLE} | KADESH`,
      description: BLOG_INDEX_OG_DESCRIPTION,
      images: [BLOG_OG_IMAGE],
    },
    alternates: {
      canonical: BLOG_INDEX_PATH,
    },
  };
}

export function buildMissingPostMetadata(): Metadata {
  return {
    title: 'Artículo no encontrado',
    description: 'Este artículo no existe o ya no está publicado.',
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export function buildPostMetadata(post: BlogPostDetail): Metadata {
  const url = postCanonicalUrl(post.url);
  const description = postDescription(post);
  const imageUrl = getShareImageUrl(post);
  const { published, modified } = postDates(post);
  const authorName = authorDisplayName(post.author);
  const tags = (post.tags ?? []).map((tag) => tag.name).filter(Boolean);

  const openGraph: Metadata['openGraph'] = {
    title: post.title,
    description,
    url,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'article',
    images: [
      {
        url: imageUrl,
        alt: post.title,
      },
    ],
    ...(published ? { publishedTime: published } : {}),
    ...(modified ? { modifiedTime: modified } : {}),
    ...(authorName ? { authors: [authorName] } : {}),
    ...(post.category?.name ? { section: post.category.name } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };

  const metadata: Metadata = {
    title: post.title,
    description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };

  if (authorName) {
    metadata.authors = [{ name: authorName }];
  }

  if (post.category?.name) {
    metadata.category = post.category.name;
  }

  if (tags.length > 0) {
    metadata.keywords = tags;
  }

  return metadata;
}
