import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kadesh.com.mx'),
  title: {
    default: 'Leads B2B de Google Maps e INEGI con teléfono y CRM | KADESH',
    template: '%s | KADESH',
  },
  description:
    'Kadesh extrae leads B2B de Google Maps e INEGI con teléfono y dirección, y los gestiona en un CRM integrado. Prueba 7 días con 50 leads gratis, sin tarjeta.',
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
    'extraer leads INEGI',
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
    title: 'Leads B2B de Google Maps e INEGI con teléfono y CRM | KADESH',
    description:
      'Kadesh extrae leads B2B de Google Maps e INEGI con teléfono y dirección, y los gestiona en un CRM. Prueba 7 días con 50 leads gratis, sin tarjeta.',
    url: 'https://kadesh.com.mx/',
    siteName: 'Kadesh',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kadesh extrae leads B2B de Google Maps e INEGI con teléfono y CRM integrado',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leads B2B de Google Maps e INEGI con teléfono y CRM | KADESH',
    description:
      'Extrae leads B2B de Google Maps e INEGI con teléfono y CRM integrado. Prueba 7 días con 50 leads gratis, sin tarjeta.',
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
