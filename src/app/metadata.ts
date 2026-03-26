import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kadesh.com.mx'),
  title: {
    default: 'KADESH - Tu próxima lista de clientes está a un clic de distancia.',
    template: '%s | KADESH',
  },
  description: 'Plataforma SaaS B2B para extraer clientes potenciales reales de Google Maps con teléfono y CRM integrado. Kadesh ofrece prueba gratuita de 7 días con 50 leads gratis.',
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
    description: 'Plataforma SaaS B2B para extraer clientes potenciales de Google Maps con teléfono y CRM integrado. Prueba gratuita de 7 días con 50 leads gratis.',
    url: 'https://kadesh.com.mx/',
    siteName: 'Kadesh',
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
    description: 'Extrae clientes potenciales de Google Maps con teléfono y CRM integrado. Prueba gratuita de 7 días con 50 leads gratis.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://kadesh.com.mx/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
