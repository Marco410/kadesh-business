import type { MetadataRoute } from "next";
import { NICHE_TARGET_MAPPING } from "kadesh/constants/constans";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kadesh.com.mx";

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
  ];

  const nicheRoutes: MetadataRoute.Sitemap = Object.keys(NICHE_TARGET_MAPPING).map((key) => ({
    url: `${baseUrl}/clientes-para-${key}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...nicheRoutes];
}
