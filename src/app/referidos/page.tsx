import type { Metadata } from "next";
import { ReferralSection } from "kadesh/components/home";
import { Footer, Navigation } from "kadesh/components/layout";

export const metadata: Metadata = {
  title: "Programa de referidos",
  description:
    "Gana con Kadesh: 20% del primer pago y 10% mensual mientras tu referido siga activo (hasta 12 meses). Para agencias, freelancers y partners que recomiendan herramientas.",
  openGraph: {
    title: "Programa de referidos | KADESH Negocios",
    description:
      "20% del primer pago y 10% mensual mientras tu referido siga activo, hasta 12 meses.",
    url: "https://kadesh.com.mx/referidos",
    siteName: "KADESH Negocios",
    locale: "es_MX",
    type: "website",
  },
  alternates: {
    canonical: "https://kadesh.com.mx/referidos",
  },
};

export default function ReferidosPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <ReferralSection />
      <Footer />
    </main>
  );
}
