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

        {/* Additional Info Section */}
        <section 
          aria-labelledby="additional-contact-heading"
          className="py-16 sm:py-24 bg-[#f5f5f5] dark:bg-[#0a0a0a]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 
                id="additional-contact-heading"
                className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6"
              >
                Otras formas de contactarnos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                También puedes encontrarnos en nuestras redes sociales o visitar nuestra página de información para conocer más sobre KADESH y cómo trabajamos por el bienestar animal en México.
              </p>
              <nav aria-label="Enlaces de contacto adicionales">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/conocenos"
                    className="px-6 py-3 bg-white dark:bg-[#1e1e1e] text-orange-500 dark:text-orange-400 font-semibold rounded-xl hover:bg-orange-50 dark:hover:bg-[#2a2a2a] transition-colors border border-orange-500/20"
                    aria-label="Conoce más sobre KADESH y nuestra misión"
                  >
                    Conoce más sobre KADESH
                  </a>
                </div>
              </nav>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
