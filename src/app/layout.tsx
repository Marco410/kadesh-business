import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import ClientProviders from './ClientProviders';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export { metadata, viewport } from './metadata';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const globalGeoJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Kadesh',
      legalName: 'Kadesh',
      url: 'https://kadesh.com.mx',
      logo: 'https://kadesh.com.mx/logo.png',
      email: 'contacto@kadesh.com.mx',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Morelia',
        addressRegion: 'Michoacán',
        addressCountry: 'MX',
      },
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Kadesh',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://kadesh.com.mx',
      areaServed: 'MX',
      offers: [
        {
          '@type': 'Offer',
          name: 'Plan Starter',
          price: 399,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
        {
          '@type': 'Offer',
          name: 'Plan Pro',
          price: 799,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
        {
          '@type': 'Offer',
          name: 'Plan Agencia',
          price: 1999,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
        {
          '@type': 'Offer',
          name: '250 Créditos Extra',
          price: 349,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
        {
          '@type': 'Offer',
          name: '1,000 Créditos Extra',
          price: 999,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
        {
          '@type': 'Offer',
          name: '3,000 Créditos Extra',
          price: 2499,
          priceCurrency: 'MXN',
          category: 'SaaS B2B',
          url: 'https://kadesh.com.mx/precios',
        },
      ],
      description:
        'Plataforma SaaS B2B para extraer clientes potenciales de Google Maps con teléfono y CRM integrado. Kadesh ofrece prueba gratuita de 7 días con 50 leads gratis.',
      featureList: [
        'Extracción de leads reales desde Google Maps',
        'Teléfonos y datos de contacto',
        'CRM integrado para seguimiento comercial',
        'Prueba gratuita de 7 días con 50 leads gratis',
      ],
      trialAvailability: 'Prueba gratuita de 7 días con 50 leads gratis',
      provider: {
        '@type': 'Organization',
        name: 'Kadesh',
        url: 'https://kadesh.com.mx',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <script
          id="kadesh-geo-core-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalGeoJsonLd) }}
        />
        {/* Meta Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1093441746302298');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1093441746302298&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} font-sans bg-[#ffffff] dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] transition-colors duration-200`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
