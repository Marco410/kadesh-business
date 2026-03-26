import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  GOOGLE_PLACE_CATEGORIES,
  NICHE_TARGET_MAPPING,
} from "kadesh/constants/constans";
import { Footer, Navigation } from "kadesh/components/layout";

const WHATSAPP_E164 = "5214439382330";

type NichePageProps = {
  params: Promise<{ nicho: string }>;
};

const categoryLabelByValue = new Map(
  GOOGLE_PLACE_CATEGORIES.map((item) => [item.value, item.label] as const)
);

function getNicheData(slug: string) {
  return NICHE_TARGET_MAPPING[slug];
}

function getIdealClientLabel(value: string): string {
  return categoryLabelByValue.get(value as (typeof GOOGLE_PLACE_CATEGORIES)[number]["value"]) ?? value;
}

export function generateStaticParams() {
  return Object.keys(NICHE_TARGET_MAPPING).map((nicho) => ({ nicho }));
}

export async function generateMetadata({
  params,
}: NichePageProps): Promise<Metadata> {
  const { nicho } = await params;
  const nicheData = getNicheData(nicho);

  if (!nicheData) {
    return {
      title: "Página no encontrada | Kadesh",
      robots: { index: false, follow: false },
    };
  }

  const top3 = nicheData.idealClients
    .slice(0, 3)
    .map(getIdealClientLabel)
    .join(", ");

  const title = `Cómo conseguir clientes potenciales para ${nicheData.title} en 2026 | Kadesh`;
  const description = `Descubre cómo extraer de Google Maps a tus mejores clientes: ${top3} y más. Prueba Kadesh por 7 días.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://kadesh.com.mx/clientes-para-${nicho}`,
    },
    openGraph: {
      title,
      description,
      url: `https://kadesh.com.mx/clientes-para-${nicho}`,
      siteName: "Kadesh",
      locale: "es_MX",
      type: "article",
    },
  };
}

export default async function NicheLandingPage({ params }: NichePageProps) {
  const { nicho } = await params;
  const nicheData = getNicheData(nicho);

  if (!nicheData) {
    notFound();
  }

  const mailSubject = `Ayuda para conseguir clientes para mi negocio de ${nicheData.title}`;
  const mailHref = `mailto:contacto@kadesh.com.mx?subject=${encodeURIComponent(mailSubject)}`;
  const waText = `Hola Kadesh, necesito ayuda para conseguir clientes para mi negocio de ${nicheData.title}.`;
  const waHref = `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fff7ed] dark:from-[#121212] dark:to-[#0b0b0b] text-[#212121] dark:text-white">
      <Navigation />
      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Consigue clientes reales y verificados para {nicheData.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#616161] dark:text-[#b0b0b0] max-w-4xl leading-relaxed">
            Como profesional en {nicheData.title}, tu tiempo es valioso. No dependas de recomendaciones; tus
            mejores clientes ya están en Google Maps esperando que los contactes.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#2f2f2f] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold">Tus clientes ideales</h2>
            <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Aquí tienes segmentos recomendados para arrancar tu prospección en Kadesh.
            </p>

            <h3 className="mt-6 text-lg font-semibold">Negocios recomendados en Google Maps</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nicheData.idealClients.map((target) => {
                const label = getIdealClientLabel(target);
                return (
                  <article
                    key={target}
                    className="rounded-xl border border-[#e7e7e7] dark:border-[#313131] bg-[#fafafa] dark:bg-[#1b1b1b] p-4"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 text-[#f97316] mb-3">
                      <span aria-hidden>📍</span>
                    </div>
                    <h4 className="font-semibold text-[#212121] dark:text-white">{label}</h4>
                    <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Búscalos en Kadesh y obtén su información en segundos.
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-2xl border border-[#f97316]/40 bg-[#121212] text-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold">
              ¿No sabes por dónde empezar tu prospección?
            </h2>
            <p className="mt-3 text-white/85 leading-relaxed max-w-3xl">
              Cuéntanos un poco sobre tu negocio y te ayudamos a obtener los clientes que necesitas.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={mailHref}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors"
              >
                Enviar correo a Kadesh
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold border border-[#f97316] text-[#f97316] bg-white hover:bg-orange-50 transition-colors"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
