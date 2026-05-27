/** Static plan tiers for JSON-LD (aligned with global layout offers). */
export const PRICING_PLAN_OFFERS = [
  {
    name: "Plan Free",
    price: 0,
    description:
      "Prueba gratuita con leads limitados para evaluar la prospección B2B desde Google Maps.",
  },
  {
    name: "Plan Starter",
    price: 799,
    description:
      "Ideal para freelancers y vendedores independientes que buscan clientes B2B en México.",
  },
  {
    name: "Plan Pro",
    price: 1699,
    description:
      "Para equipos pequeños con más cuota de leads, exportación a Excel y CRM completo.",
  },
  {
    name: "Plan Agencia",
    price: 3499,
    description:
      "Para agencias y equipos comerciales con usuarios múltiples y asignación de leads.",
  },
] as const;

export const PRICING_FAQ_ITEMS = [
  {
    question: "¿Cuánto cuesta KADESH Negocios?",
    answer:
      "KADESH ofrece un plan Free para empezar, además de planes de pago Starter, Pro y Agencia con precios en pesos mexicanos (MXN). Los montos exactos se muestran en esta página y puedes elegir facturación mensual o anual con descuento.",
  },
  {
    question: "¿Hay prueba gratuita o plan gratis?",
    answer:
      "Sí. Puedes registrarte y usar el plan Free o la prueba promocional (7 días con 50 leads, según la oferta vigente) para validar la extracción de leads desde Google Maps y el CRM antes de contratar un plan de pago.",
  },
  {
    question: "¿Los precios están en pesos mexicanos?",
    answer:
      "Sí. Todos los planes se facturan en MXN. Si tu equipo opera en México, ves el costo real sin conversión de divisas.",
  },
  {
    question: "¿Puedo cambiar de plan después?",
    answer:
      "Sí. Puedes subir o bajar de plan según tu volumen de prospección. Al actualizar, obtienes la nueva cuota de leads y funciones del plan superior de forma inmediata en el siguiente ciclo o al momento del cambio, según la política de facturación activa.",
  },
  {
    question: "¿Qué incluye el plan Pro frente al Starter?",
    answer:
      "El plan Pro suele incluir mayor cuota mensual de leads, exportación a Excel y capacidades avanzadas del CRM. El Starter está pensado para quien empieza con prospección B2B; revisa la tabla de características en cada tarjeta de plan.",
  },
  {
    question: "¿Hay descuento por pago anual?",
    answer:
      "Sí. Al elegir facturación anual en la comparativa de planes, aplicas un precio reducido frente a pagar doce meses por separado. El ahorro exacto se calcula con los precios publicados en cada tarjeta.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer:
      "Sí. No hay contratos forzosos a largo plazo. Puedes cancelar contactando a soporte; tu acceso continúa hasta el final del periodo ya pagado.",
  },
  {
    question: "¿Qué pasa si supero el límite de leads de mi plan?",
    answer:
      "Al alcanzar la cuota mensual puedes esperar al siguiente ciclo o actualizar a un plan con más leads. Los leads ya guardados en tu CRM permanecen disponibles.",
  },
] as const;

const BASE_URL = "https://kadesh.com.mx";

export function buildPreciosStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/precios#webpage`,
        url: `${BASE_URL}/precios`,
        name: "Planes y precios | KADESH Negocios",
        description:
          "Precios en MXN de KADESH: software de prospección B2B, leads desde Google Maps y CRM integrado para equipos de ventas en México.",
        inLanguage: "es-MX",
        isPartOf: {
          "@type": "WebSite",
          name: "KADESH Negocios",
          url: BASE_URL,
        },
        breadcrumb: {
          "@id": `${BASE_URL}/precios#breadcrumb`,
        },
        mainEntity: {
          "@id": `${BASE_URL}/precios#offers`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE_URL}/precios#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Planes y precios",
            item: `${BASE_URL}/precios`,
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        "@id": `${BASE_URL}/precios#offers`,
        name: "Planes KADESH Negocios",
        url: `${BASE_URL}/precios`,
        itemListElement: PRICING_PLAN_OFFERS.map((plan, index) => ({
          "@type": "Offer",
          position: index + 1,
          name: plan.name,
          price: plan.price,
          priceCurrency: "MXN",
          description: plan.description,
          url: `${BASE_URL}/precios`,
          availability: "https://schema.org/InStock",
          eligibleRegion: {
            "@type": "Country",
            name: "México",
          },
          offeredBy: {
            "@type": "Organization",
            name: "KADESH Negocios",
            url: BASE_URL,
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/precios#faq`,
        mainEntity: PRICING_FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: "KADESH Negocios",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: BASE_URL,
        offers: PRICING_PLAN_OFFERS.filter((p) => p.price > 0).map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.price,
          priceCurrency: "MXN",
          url: `${BASE_URL}/precios`,
        })),
        description:
          "Plataforma SaaS B2B para extraer leads de Google Maps con teléfono y gestionarlos en un CRM integrado.",
        areaServed: "MX",
      },
    ],
  };
}
