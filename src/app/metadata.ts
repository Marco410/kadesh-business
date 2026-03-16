import { Metadata, Viewport } from 'next';

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
    'leads B2B México',
    'leads B2B gratis',
    'Google Maps leads',
    'CRM ventas',
    'prospección B2B',
    'extraer leads Google Maps',
    'software prospección México',
    'conseguir clientes B2B',
    'lista de prospectos',
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
    description: 'Extrae leads B2B desde Google Maps. Filtra por categoría y radio, obtén nombre, teléfono y rating de cada prospecto. CRM integrado para cerrar más ventas.',
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
    description: 'Extrae leads B2B desde Google Maps. Filtra por categoría y radio. Gestiona prospectos con el CRM integrado de KADESH Negocios.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.negocios.kadesh.com.mx/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
