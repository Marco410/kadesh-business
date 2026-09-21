import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import ClientProviders from "./ClientProviders";
import { Analytics } from "@vercel/analytics/next";
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STORAGE_KEY,
} from "kadesh/components/layout/font-scale";

export { metadata, viewport } from "./metadata";

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
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kadesh.com.mx/#organization",
      name: "Kadesh",
      legalName: "Kadesh",
      url: "https://kadesh.com.mx",
      logo: "https://kadesh.com.mx/logo.png",
      email: "contacto@kadesh.com.mx",
      sameAs: ["https://www.facebook.com/profile.php?id=61576878181992"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Morelia",
        addressRegion: "Michoacán",
        addressCountry: "MX",
      },
      areaServed: {
        "@type": "Country",
        name: "México",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "contacto@kadesh.com.mx",
        contactType: "customer support",
        availableLanguage: ["Spanish"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://kadesh.com.mx/#website",
      url: "https://kadesh.com.mx",
      name: "Kadesh",
      inLanguage: "es-MX",
      publisher: { "@id": "https://kadesh.com.mx/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://kadesh.com.mx/#software",
      name: "Kadesh",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://kadesh.com.mx",
      publisher: { "@id": "https://kadesh.com.mx/#organization" },
      provider: { "@id": "https://kadesh.com.mx/#organization" },
      areaServed: "MX",
      offers: [
        {
          "@type": "Offer",
          name: "Plan Starter",
          price: 399,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
        {
          "@type": "Offer",
          name: "Plan Pro",
          price: 799,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
        {
          "@type": "Offer",
          name: "Plan Agencia",
          price: 1999,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
        {
          "@type": "Offer",
          name: "250 Créditos Extra",
          price: 349,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
        {
          "@type": "Offer",
          name: "1,000 Créditos Extra",
          price: 999,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
        {
          "@type": "Offer",
          name: "3,000 Créditos Extra",
          price: 2499,
          priceCurrency: "MXN",
          category: "SaaS B2B",
          url: "https://kadesh.com.mx/precios",
        },
      ],
      description:
        "Plataforma SaaS B2B para extraer clientes potenciales de Google Maps e INEGI con teléfono y CRM integrado. Kadesh ofrece prueba gratuita de 7 días con 50 leads gratis.",
      featureList: [
        "Extracción de leads reales desde Google Maps e INEGI",
        "Teléfonos y datos de contacto",
        "CRM integrado para seguimiento comercial",
        "Prueba gratuita de 7 días con 50 leads gratis",
      ],
      trialAvailability: "Prueba gratuita de 7 días con 50 leads gratis",
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
        <script
          id="kadesh-geo-core-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalGeoJsonLd) }}
        />
        <script
          id="kadesh-font-scale"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=parseFloat(localStorage.getItem("${FONT_SCALE_STORAGE_KEY}")||"");if(isNaN(n))n=${FONT_SCALE_DEFAULT};if(n<${FONT_SCALE_MIN})n=${FONT_SCALE_MIN};if(n>${FONT_SCALE_MAX})n=${FONT_SCALE_MAX};document.documentElement.style.setProperty("--kadesh-font-scale",String(n));}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} font-sans bg-[#ffffff] dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] transition-colors duration-200`}
      >
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
