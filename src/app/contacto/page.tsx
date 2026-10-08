"use client";

import { motion } from 'framer-motion';
import { Navigation, Footer } from 'kadesh/components/layout';
import { ContactForm } from 'kadesh/components/contact';
import {
  KADESH_LEGAL,
  formatKadeshLegalAddress,
} from 'kadesh/constants/legal';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

export default function ContactPage() {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto KADESH Negocios',
    description:
      'Página de contacto de KADESH Negocios — prospección B2B y CRM con leads desde Google Maps en México',
    url: `${SITE_URL}${Routes.contact}`,
    mainEntity: {
      '@type': 'Organization',
      name: KADESH_LEGAL.brandName,
      legalName: KADESH_LEGAL.legalName,
      url: SITE_URL,
      email: KADESH_LEGAL.email,
      telephone: KADESH_LEGAL.phoneE164,
      description:
        'Plataforma SaaS B2B que extrae leads de Google Maps y los guarda en un CRM integrado',
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${KADESH_LEGAL.streetAddress}, ${KADESH_LEGAL.neighborhood}`,
        addressLocality: KADESH_LEGAL.addressLocality,
        addressRegion: KADESH_LEGAL.addressRegion,
        postalCode: KADESH_LEGAL.postalCode,
        addressCountry: KADESH_LEGAL.addressCountry,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Soporte al cliente',
        email: KADESH_LEGAL.email,
        telephone: KADESH_LEGAL.phoneE164,
        areaServed: 'MX',
        availableLanguage: 'Spanish',
      },
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        
        {/* Hero Section */}
        <header className="w-full py-16 sm:py-24 bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
                Contáctanos
              </h1>
              <p className="text-xl sm:text-2xl text-orange-50 leading-relaxed">
                Estamos aquí para ayudarte. Envíanos tu mensaje y te responderemos lo antes posible.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Contact Form Section */}
        <section 
          aria-labelledby="contact-form-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
            <address className="not-italic rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#1a1a1a] px-5 py-5 sm:px-6 sm:py-6 text-[#424242] dark:text-[#e0e0e0]">
              <h2 className="text-lg font-semibold text-[#212121] dark:text-white mb-3">
                Datos de contacto
              </h2>
              <p className="font-medium text-[#212121] dark:text-white">
                {KADESH_LEGAL.legalName}
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {formatKadeshLegalAddress()}
              </p>
              <p className="mt-3 text-sm">
                Teléfono:{" "}
                <a
                  href={KADESH_LEGAL.tel}
                  className="text-orange-600 dark:text-orange-400 underline underline-offset-2"
                >
                  {KADESH_LEGAL.phoneDisplay}
                </a>
              </p>
              <p className="mt-1 text-sm">
                Correo:{" "}
                <a
                  href={`mailto:${KADESH_LEGAL.email}`}
                  className="text-orange-600 dark:text-orange-400 underline underline-offset-2"
                >
                  {KADESH_LEGAL.email}
                </a>
              </p>
            </address>

            <div>
              <h2 id="contact-form-heading" className="sr-only">
                Formulario de contacto
              </h2>
              <ContactForm />
            </div>
          </div>
        </section>


        <Footer />
      </main>
    </>
  );
}
