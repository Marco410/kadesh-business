import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel-de-control/", "/api/"],
    },
    sitemap: "https://kadesh.com.mx/sitemap.xml",
  };
}
