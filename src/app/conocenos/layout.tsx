import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conócenos",
  description:
    "Conoce KADESH Negocios: plataforma SaaS B2B de prospección, CRM y cotizador nacida en México para ayudar a empresas a llenar su embudo de ventas con leads reales de Google Maps.",
  keywords: [
    "KADESH Negocios",
    "sobre KADESH",
    "prospección B2B México",
    "software CRM ventas",
    "historia KADESH",
    "leads Google Maps",
  ],
  openGraph: {
    title: "Conócenos | KADESH Negocios",
    description:
      "Dejamos de buscar clientes y empezamos a encontrarlos. Conoce la historia detrás de KADESH: prospección B2B, CRM y cotizador en una sola plataforma.",
    url: "https://kadesh.com.mx/conocenos",
    siteName: "KADESH Negocios",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conócenos | KADESH Negocios",
    description:
      "KADESH une prospección en Google Maps, CRM y cotizador para equipos de ventas B2B en México.",
  },
  alternates: {
    canonical: "https://kadesh.com.mx/conocenos",
  },
};

export default function ConocenosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
