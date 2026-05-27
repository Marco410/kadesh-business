import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y precios",
  description:
    "Precios en MXN de KADESH Negocios: planes Free, Starter, Pro y Agencia para prospección B2B, leads desde Google Maps y CRM integrado en México.",
  keywords: [
    "precios KADESH",
    "planes KADESH Negocios",
    "software prospección B2B precio",
    "CRM ventas México precio",
    "leads Google Maps costo",
    "SaaS B2B México",
    "prueba gratuita leads",
  ],
  openGraph: {
    title: "Planes y precios | KADESH Negocios",
    description:
      "Compara planes Free, Starter, Pro y Agencia. Prospección B2B, leads de Google Maps y CRM en pesos mexicanos.",
    url: "https://kadesh.com.mx/precios",
    siteName: "KADESH Negocios",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planes y precios | KADESH Negocios",
    description:
      "Planes en MXN para extraer leads de Google Maps y gestionar ventas con CRM integrado.",
  },
  alternates: {
    canonical: "https://kadesh.com.mx/precios",
  },
};

export default function PreciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
