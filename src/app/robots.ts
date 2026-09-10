import type { MetadataRoute } from "next";

const PANEL_DISALLOW = ["/panel-de-control/", "/api/", "/panel/"];

const CITATION_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-CloudVertexBot",
  "Applebot",
  "Amazonbot",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PANEL_DISALLOW,
      },
      ...CITATION_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PANEL_DISALLOW,
      })),
    ],
    sitemap: "https://kadesh.com.mx/sitemap.xml",
  };
}
