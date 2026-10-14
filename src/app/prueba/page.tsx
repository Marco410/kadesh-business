import type { Metadata } from "next";
import { TrialLandingPage, resolveTrialAngle } from "kadesh/components/trial-landing";

/** Solo para tráfico de anuncios: no se indexa (repite la home) y no va en el sitemap. */
export const metadata: Metadata = {
  title: "Prueba Kadesh gratis 7 días",
  description:
    "Encuentra negocios reales de tu giro en tu ciudad, con teléfono, en menos de un minuto. 7 días gratis, 70 créditos incluidos y sin tarjeta.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://kadesh.com.mx/prueba",
  },
};

type PruebaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PruebaPage({ searchParams }: PruebaPageProps) {
  const { angulo } = await searchParams;
  return <TrialLandingPage angle={resolveTrialAngle(angulo)} />;
}
