import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/panel/', '/auth/'],
      },
    ],
    sitemap: 'https://www.kadesh.com.mx/sitemap.xml',
  };
}
