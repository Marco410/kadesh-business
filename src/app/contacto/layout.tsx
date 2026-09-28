import { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

const CONTACT_URL = `${SITE_URL}${Routes.contact}`;

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos en KADESH Negocios. Estamos aquí para ayudarte con tu prospección B2B, acceso a leads desde Google Maps o cualquier consulta sobre la plataforma.',
  openGraph: {
    title: 'Contacto | KADESH Negocios',
    description: 'Contáctanos en KADESH Negocios. Estamos aquí para ayudarte con tu prospección B2B, acceso a leads o cualquier consulta sobre la plataforma.',
    url: CONTACT_URL,
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
    canonical: CONTACT_URL,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
