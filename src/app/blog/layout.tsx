import { Metadata } from 'next';
import {
  BLOG_INDEX_DESCRIPTION,
  BLOG_INDEX_OG_DESCRIPTION,
  BLOG_INDEX_TITLE,
  BLOG_OG_IMAGE,
} from 'kadesh/components/blog/blog-seo';

export const metadata: Metadata = {
  title: BLOG_INDEX_TITLE,
  description: BLOG_INDEX_DESCRIPTION,
  keywords: [
    'blog prospección B2B',
    'leads B2B México',
    'generar leads Google Maps',
    'CRM para ventas',
    'conseguir clientes B2B',
    'consejos de ventas',
    'casos de éxito B2B',
    'KADESH Negocios',
  ],
  openGraph: {
    title: `${BLOG_INDEX_TITLE} | KADESH`,
    description: BLOG_INDEX_OG_DESCRIPTION,
    siteName: 'KADESH',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: BLOG_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Blog KADESH Negocios — guías de prospección B2B, leads y CRM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BLOG_INDEX_TITLE} | KADESH`,
    description: BLOG_INDEX_OG_DESCRIPTION,
    images: [BLOG_OG_IMAGE],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
