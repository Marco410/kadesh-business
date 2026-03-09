import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos en KADESH. Estamos aquí para ayudarte con adopciones, rescates, donaciones y cualquier consulta sobre bienestar animal. Envíanos tu mensaje y te responderemos lo antes posible.',
  openGraph: {
    title: 'Contacto | KADESH',
    description: 'Contáctanos en KADESH. Estamos aquí para ayudarte con adopciones, rescates, donaciones y cualquier consulta sobre bienestar animal.',
    url: 'https://www.kadesh.com.mx/contacto',
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto | KADESH',
    description: 'Contáctanos en KADESH. Estamos aquí para ayudarte con adopciones, rescates, donaciones y cualquier consulta sobre bienestar animal.',
  },
  alternates: {
    canonical: 'https://www.kadesh.com.mx/contacto',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
