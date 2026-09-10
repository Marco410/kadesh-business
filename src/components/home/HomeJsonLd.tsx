import { FAQ_ITEMS } from "kadesh/components/home/faq-items";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://kadesh.com.mx/#webpage",
      url: "https://kadesh.com.mx/",
      name: "Leads B2B de Google Maps con teléfono y CRM | KADESH",
      description:
        "Kadesh extrae leads B2B de Google Maps con teléfono, rating y dirección, y los gestiona en un CRM integrado. Prueba 7 días con 50 leads gratis, sin tarjeta.",
      dateModified: "2026-09-10",
      inLanguage: "es-MX",
      isPartOf: { "@id": "https://kadesh.com.mx/#website" },
      about: { "@id": "https://kadesh.com.mx/#software" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://kadesh.com.mx/og-image.png",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://kadesh.com.mx/#faq",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "HowTo",
      "@id": "https://kadesh.com.mx/#howto",
      name: "Cómo extraer leads de Google Maps con Kadesh",
      description:
        "Creas tu cuenta, eliges un punto en el mapa, seleccionas la categoría del negocio y defines el radio. Kadesh extrae teléfono, dirección y rating y deja los prospectos en el CRM.",
      totalTime: "PT1M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Elige un punto en el mapa",
          text: "Marca la ciudad o zona donde quieres prospectar negocios.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Selecciona la categoría",
          text: "Elige el giro listado en Google Maps, por ejemplo dentistas o abogados.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Define el radio",
          text: "Acota la búsqueda al área que tu equipo puede contactar.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Guarda los leads en el CRM",
          text: "Teléfono, dirección, categoría y rating quedan listos para seguimiento.",
        },
      ],
    },
  ],
};

export default function HomeJsonLd() {
  return (
    <script
      id="kadesh-home-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
    />
  );
}
