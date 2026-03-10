import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.negocios.kadesh.com.mx'),
  title: {
    default: 'KADESH - Tu próxima lista de clientes está a un clic de distancia.',
    template: '%s | KADESH',
  },
  description: 'Extrae leads B2B directamente de Google Maps. Filtra por categoría y radio de acción. Deja de buscar prospectos y empieza a cerrar ventas hoy mismo.',
  keywords: [
    'KADESH',
    'KADESH Negocios',
    'leads B2B',
    'Google Maps',
    'CRM',
    'ventas',
    'prospección',
    'negocios',
    'leads B2B México',
    'leads B2B gratis',
    'leads B2B gratis México',
    'leads B2B gratis Google Maps',
    'leads B2B gratis CRM',
    'leads B2B gratis ventas',
    'leads B2B gratis prospección',
    'leads B2B gratis negocios',
    'leads B2B gratis México',
  ],
  authors: [{ name: 'KADESH Negocios' }],
  creator: 'KADESH Negocios',
  publisher: 'KADESH Negocios',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'KADESH - Tu próxima lista de clientes está a un clic de distancia.',
    description: 'KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México.',
    url: 'https://www.negocios.kadesh.com.mx/',
    siteName: 'KADESH Negocios',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KADESH - Tu próxima lista de clientes está a un clic de distancia.',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KADESH - Tu próxima lista de clientes está a un clic de distancia.',
    description: 'KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.negocios.kadesh.com.mx/',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};
