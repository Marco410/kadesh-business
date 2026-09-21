import type { MetadataRoute } from "next";
import { NICHE_TARGET_MAPPING } from "kadesh/constants/constans";
import { NOVEDADES_CANONICAL } from "kadesh/components/changelog/novedades-seo";
import { fetchPublishedPostsForSitemap } from "kadesh/components/blog/server";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";

function toLastModified(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/conocenos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/precios`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    /** Changelog / release notes — contenido que cambia con cada versión SaaS (SEO + AEO) */
    {
      url: NOVEDADES_CANONICAL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const nicheRoutes: MetadataRoute.Sitemap = Object.keys(NICHE_TARGET_MAPPING).map((key) => ({
    url: `${baseUrl}/clientes-para-${key}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  /** Blog: solo posts publicados del SaaS (o de ambos productos). Sin borradores. */
  const posts = await fetchPublishedPostsForSitemap();
  const latestPostDate = posts
    .map((post) => toLastModified(post.updatedAt || post.publishedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}${Routes.blog.index}`,
      lastModified: latestPostDate ?? new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}${Routes.blog.post(post.url)}`,
      lastModified: toLastModified(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...nicheRoutes, ...blogRoutes];
}
