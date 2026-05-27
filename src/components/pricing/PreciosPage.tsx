"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Footer, Navigation } from "kadesh/components/layout";
import { LandingPricingSection } from "kadesh/components/home";
import { Routes } from "kadesh/core/routes";
import { buildPreciosStructuredData } from "./constants";
import PricingFaqSection from "./PricingFaqSection";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const VALUE_PROPS = [
  {
    title: "Leads reales desde Google Maps",
    description:
      "Cada plan incluye cuota mensual para descubrir negocios con teléfono, categoría y ubicación verificables en tiempo real.",
  },
  {
    title: "CRM integrado",
    description:
      "Gestiona pipeline, actividades y seguimiento sin exportar a otra herramienta. Escala de Free a Agencia según tu equipo.",
  },
  {
    title: "Precios en MXN, sin sorpresas",
    description:
      "Facturación mensual o anual en pesos mexicanos. Ideal para empresas y agencias que prospectan en México.",
  },
] as const;

export default function PreciosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildPreciosStructuredData()),
        }}
      />

      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />

        <header className="relative w-full overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <motion.div {...fadeInUp} className="max-w-3xl">
              <p className="text-orange-100 dark:text-orange-300/90 text-sm font-semibold uppercase tracking-wide mb-3">
                Planes SaaS B2B · México
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Planes y precios de KADESH Negocios
              </h1>
              <p className="text-lg sm:text-xl text-orange-50 leading-relaxed mb-4">
                Software de prospección B2B para extraer clientes potenciales
                desde Google Maps y gestionarlos en un CRM integrado. Compara
                Free, Starter, Pro y Agencia en pesos mexicanos.
              </p>
              <p className="text-base text-orange-100/90 leading-relaxed">
                Elige facturación mensual o anual, empieza con prueba gratuita
                y escala cuando tu embudo de ventas lo necesite.
              </p>
            </motion.div>
          </div>
        </header>

        <section
          aria-labelledby="pricing-value-heading"
          className="py-12 sm:py-16 bg-white dark:bg-[#121212] border-b border-[#e0e0e0] dark:border-[#2a2a2a]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="pricing-value-heading"
              className="sr-only"
            >
              Qué incluye cada plan de KADESH
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUE_PROPS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1a1a1a] p-6"
                >
                  <h3 className="text-lg font-bold text-[#212121] dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#616161] dark:text-[#b0b0b0] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <LandingPricingSection variant="page" />

        <PricingFaqSection />

        <section
          aria-labelledby="pricing-cta-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-[#2a2a2a]/50 bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0d0d0d] px-6 py-12 text-center sm:px-12 sm:py-16">
              <h2
                id="pricing-cta-heading"
                className="mb-4 text-2xl font-bold text-white sm:text-3xl"
              >
                ¿Listo para llenar tu embudo con leads reales?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-base text-gray-300">
                Crea tu cuenta gratis, prueba la extracción desde Google Maps y
                elige el plan que coincida con tu volumen de prospección.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={Routes.auth.register}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  Empezar gratis
                </Link>
                <Link
                  href={Routes.conocenos}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-orange-500/50 hover:bg-white/5"
                >
                  Conocer KADESH
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
