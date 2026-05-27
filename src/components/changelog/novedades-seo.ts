/**
 * SEO, GEO y AEO para /novedades — metadatos y JSON-LD compartidos (layout + página).
 */

export const NOVEDADES_BASE_URL = "https://kadesh.com.mx";
export const NOVEDADES_PATH = "/novedades";
export const NOVEDADES_CANONICAL = `${NOVEDADES_BASE_URL}${NOVEDADES_PATH}`;

export const NOVEDADES_PAGE_TITLE =
  "Novedades y actualizaciones de KADESH Negocios";

export const NOVEDADES_META_DESCRIPTION =
  "Historial oficial de versiones de KADESH Negocios en México: mejoras en prospección B2B desde Google Maps, CRM de ventas, cotizaciones y espacios de trabajo. Consulta el changelog y las notas de cada release.";

export const NOVEDADES_OG_DESCRIPTION =
  "Changelog de KADESH Negocios (México): versiones publicadas, nuevas funciones en prospección B2B, CRM integrado y cotizador para equipos de venta.";

export const NOVEDADES_KEYWORDS = [
  "novedades KADESH",
  "changelog KADESH Negocios",
  "actualizaciones CRM México",
  "notas de versión software B2B",
  "historial de releases SaaS",
  "prospección B2B actualizaciones",
  "KADESH Negocios México",
  "qué hay de nuevo en KADESH",
  "mejoras CRM ventas México",
  "software leads Google Maps novedades",
] as const;

/** Preguntas frecuentes orientadas a motores de respuesta (AEO) */
export const NOVEDADES_FAQ = [
  {
    question: "¿Dónde puedo ver las actualizaciones de KADESH Negocios?",
    answer:
      "En la página de Novedades (kadesh.com.mx/novedades) publicamos el historial de versiones del producto SaaS B2B: cada release incluye número de versión, fecha y notas de cambio en prospección, CRM y cotizaciones.",
  },
  {
    question: "¿Qué tipo de cambios se publican en el changelog de KADESH?",
    answer:
      "Notas de versión sobre extracción de leads desde Google Maps, gestión de pipeline en el CRM, cotizaciones PDF, espacios de trabajo, planes y mejoras de rendimiento o seguridad de la plataforma para empresas en México.",
  },
  {
    question: "¿Con qué frecuencia actualizan KADESH Negocios?",
    answer:
      "Publicamos releases cuando hay funcionalidades o correcciones relevantes para equipos de venta B2B. La página de Novedades se actualiza con cada versión publicada (isPublished) en orden cronológico, de la más reciente a la anterior.",
  },
  {
    question: "¿Las novedades de KADESH aplican solo a México?",
    answer:
      "KADESH Negocios está orientado a prospección B2B en México (datos en MXN, leads de Google Maps en territorio mexicano). El changelog documenta cambios del producto SaaS disponible en kadesh.com.mx para empresas y agencias que venden en México.",
  },
] as const;

export function buildNovedadesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${NOVEDADES_CANONICAL}#webpage`,
        url: NOVEDADES_CANONICAL,
        name: NOVEDADES_PAGE_TITLE,
        description: NOVEDADES_META_DESCRIPTION,
        inLanguage: "es-MX",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${NOVEDADES_BASE_URL}/#website`,
          name: "KADESH Negocios",
          url: NOVEDADES_BASE_URL,
          inLanguage: "es-MX",
        },
        about: {
          "@type": "SoftwareApplication",
          name: "KADESH Negocios",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: NOVEDADES_BASE_URL,
          releaseNotes: NOVEDADES_CANONICAL,
          description:
            "Software SaaS B2B de prospección en Google Maps, CRM y cotizador para equipos de venta en México.",
          areaServed: {
            "@type": "Country",
            name: "México",
          },
          offers: {
            "@type": "Offer",
            url: `${NOVEDADES_BASE_URL}/precios`,
            priceCurrency: "MXN",
            availability: "https://schema.org/InStock",
          },
        },
        breadcrumb: {
          "@id": `${NOVEDADES_CANONICAL}#breadcrumb`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${NOVEDADES_BASE_URL}/og-image.png`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${NOVEDADES_CANONICAL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: NOVEDADES_BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Novedades",
            item: NOVEDADES_CANONICAL,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${NOVEDADES_CANONICAL}#collection`,
        url: NOVEDADES_CANONICAL,
        name: "Changelog de KADESH Negocios",
        description: NOVEDADES_META_DESCRIPTION,
        inLanguage: "es-MX",
        isPartOf: { "@id": `${NOVEDADES_BASE_URL}/#website` },
        about: { "@id": `${NOVEDADES_CANONICAL}#webpage` },
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Equipos de ventas B2B y agencias en México",
          geographicArea: {
            "@type": "Country",
            name: "México",
          },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${NOVEDADES_CANONICAL}#faq`,
        url: NOVEDADES_CANONICAL,
        inLanguage: "es-MX",
        mainEntity: NOVEDADES_FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
