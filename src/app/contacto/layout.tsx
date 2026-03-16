import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos en KADESH Negocios. Estamos aquí para ayudarte con tu prospección B2B, acceso a leads desde Google Maps o cualquier consulta sobre la plataforma.',
  openGraph: {
    title: 'Contacto | KADESH Negocios',
    description: 'Contáctanos en KADESH Negocios. Estamos aquí para ayudarte con tu prospección B2B, acceso a leads o cualquier consulta sobre la plataforma.',
    url: 'https://www.negocios.kadesh.com.mx/contacto',
    siteName: 'KADESH Negocios',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto | KADESH Negocios',
    description: 'Contáctanos en KADESH Negocios. Estamos aquí para ayudarte con tu prospección B2B, acceso a leads o cualquier consulta sobre la plataforma.',
  },
  alternates: {
    canonical: 'https://www.negocios.kadesh.com.mx/contacto',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
