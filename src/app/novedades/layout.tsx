import type { Metadata } from "next";
import {
  NOVEDADES_CANONICAL,
  NOVEDADES_KEYWORDS,
  NOVEDADES_META_DESCRIPTION,
  NOVEDADES_OG_DESCRIPTION,
  NOVEDADES_PAGE_TITLE,
  buildNovedadesJsonLd,
} from "kadesh/components/changelog/novedades-seo";

export const metadata: Metadata = {
  title: NOVEDADES_PAGE_TITLE,
  description: NOVEDADES_META_DESCRIPTION,
  keywords: [...NOVEDADES_KEYWORDS],
  authors: [{ name: "KADESH Negocios", url: "https://kadesh.com.mx" }],
  creator: "KADESH Negocios",
  publisher: "KADESH Negocios",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `${NOVEDADES_PAGE_TITLE} | KADESH Negocios`,
    description: NOVEDADES_OG_DESCRIPTION,
    url: NOVEDADES_CANONICAL,
    siteName: "KADESH Negocios",
    locale: "es_MX",
    alternateLocale: ["es"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KADESH Negocios — Novedades y changelog del software B2B en México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NOVEDADES_PAGE_TITLE} | KADESH Negocios`,
    description: NOVEDADES_OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: NOVEDADES_CANONICAL,
    languages: {
      "es-MX": NOVEDADES_CANONICAL,
      es: NOVEDADES_CANONICAL,
    },
  },
  other: {
    "geo.region": "MX",
    "geo.placename": "México",
    "content-language": "es-MX",
  },
};

export default function NovedadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildNovedadesJsonLd()),
        }}
      />
      {children}
    </>
  );
}
