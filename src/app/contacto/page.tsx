"use client";

import { motion } from 'framer-motion';
import { Navigation, Footer } from 'kadesh/components/layout';
import { ContactForm } from 'kadesh/components/contact';

export default function ContactPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto KADESH',
    description: 'Página de contacto de KADESH - Plataforma para el bienestar animal en México',
    url: 'https://www.kadesh.com.mx/contacto',
    mainEntity: {
      '@type': 'Organization',
      name: 'KADESH',
      url: 'https://www.kadesh.com.mx',
      description: 'Plataforma digital para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal en México',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Soporte al cliente',
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="contact-form-heading" className="sr-only">
              Formulario de contacto
            </h2>
            <ContactForm />
          </div>
        </section>


        <Footer />
      </main>
    </>
  );
}
