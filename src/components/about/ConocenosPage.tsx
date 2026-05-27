"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlashIcon,
  ShieldIcon,
  FireIcon,
} from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";

const VALUES = [
  {
    icon: FlashIcon,
    title: "Velocidad",
    description:
      "Lo que antes te tomaba dos semanas, hoy te toma 10 segundos. Automatizamos el trabajo pesado de prospección B2B para que tu equipo venda más.",
  },
  {
    icon: ShieldIcon,
    title: "Orden",
    description:
      "Cero prospectos olvidados. Si el lead entra a Kadesh, se gestiona con seguimiento claro hasta el cierre en tu pipeline comercial.",
  },
  {
    icon: FireIcon,
    title: "Resultados",
    description:
      "No vendemos bases de datos estáticas: te damos línea directa con tomadores de decisiones y datos verificables desde Google Maps.",
  },
] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const ABOUT_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Conócenos | KADESH Negocios",
  description:
    "Conoce la historia de KADESH: plataforma SaaS B2B de prospección, CRM y cotizador para empresas en México que buscan llenar su embudo de ventas con leads reales.",
  url: "https://kadesh.com.mx/conocenos",
  inLanguage: "es-MX",
  isPartOf: {
    "@type": "WebSite",
    name: "KADESH Negocios",
    url: "https://kadesh.com.mx",
  },
  about: {
    "@type": "Organization",
    name: "KADESH Negocios",
    url: "https://kadesh.com.mx",
    description:
      "Software de prospección B2B para extraer leads de Google Maps, gestionar ventas en CRM integrado y cotizar profesionalmente.",
    areaServed: {
      "@type": "Country",
      name: "México",
    },
    knowsAbout: [
      "Prospección B2B",
      "CRM de ventas",
      "Leads desde Google Maps",
      "Automatización comercial",
    ],
  },
};

function StoryProductImage() {
  return (
    <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#e0e0e0] bg-[#1a1a1a] shadow-xl dark:border-[#2a2a2a] dark:shadow-orange-500/10">
      <Image
        src="/images/sections/product.png"
        alt="Captura del panel de KADESH para obtener clientes: búsqueda en mapa, filtros por categoría y radio, y prospección B2B en México"
        fill
        sizes="(max-width: 1024px) 100vw, 560px"
        className="object-cover object-top"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212]/30 via-transparent to-transparent"
        aria-hidden
      />
    </figure>
  );
}

/**
 * Página "Conócenos" — historia, valores y CTA de KADESH Negocios.
 */
export default function ConocenosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ABOUT_STRUCTURED_DATA),
        }}
      />

      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />

        {/* 1. Hero */}
        <header className="relative w-full overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
                Sobre KADESH Negocios
              </p>
              <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                Dejamos de buscar clientes. Empezamos a encontrarlos.
              </h1>
              <p className="text-lg leading-relaxed text-orange-50 sm:text-xl dark:text-gray-300">
                Kadesh nació de una frustración real: ver a empresas increíbles
                quebrar simplemente porque no tenían un sistema predecible para
                llenar su embudo de ventas B2B en México.
              </p>
            </motion.div>
          </div>
        </header>

        {/* 2. Nuestra historia */}
        <section
          id="nuestra-historia"
          aria-labelledby="historia-heading"
          className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div {...fadeInUp}>
                <h2
                  id="historia-heading"
                  className="mb-6 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
                >
                  Nuestra historia: el problema que resolvemos
                </h2>
                <p className="mb-4 text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  Como dueños de agencia, perdíamos horas scrolleando en Google
                  Maps, armando excels interminables y olvidando dar seguimiento a
                  prospectos clave. Sabíamos que la prospección B2B estaba rota.
                </p>
                <p className="text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  Por eso construimos{" "}
                  <strong className="font-semibold text-[#212121] dark:text-white">
                    Kadesh
                  </strong>
                  : no solo un extractor de datos, sino un ecosistema comercial
                  completo que une la prospección directa con un CRM y un
                  cotizador profesional para equipos de ventas en México.
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StoryProductImage />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Valores */}
        <section
          id="nuestros-valores"
          aria-labelledby="valores-heading"
          className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.header
              {...fadeInUp}
              className="mb-12 text-center"
            >
              <h2
                id="valores-heading"
                className="mb-4 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
              >
                Nuestros valores
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#616161] dark:text-gray-300">
                Tres principios que guían cada función de nuestra plataforma de
                prospección y ventas B2B.
              </p>
            </motion.header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((value, index) => (
                <motion.article
                  key={value.title}
                  {...fadeInUp}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-[#e0e0e0] bg-white p-6 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-8"
                >
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
                    <HugeiconsIcon
                      icon={value.icon}
                      size={24}
                      className="text-orange-500 dark:text-orange-400"
                      aria-hidden
                    />
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-[#212121] dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#616161] dark:text-gray-300 sm:text-base">
                    {value.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CTA */}
        <section
          id="cta-conocenos"
          aria-labelledby="cta-conocenos-heading"
          className="py-16 sm:py-24 bg-[#f5f5f5] dark:bg-[#0a0a0a]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="relative overflow-hidden rounded-3xl border border-[#2a2a2a]/50 bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0d0d0d] px-6 py-12 text-center sm:px-12 sm:py-16"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-orange-600/5"
                aria-hidden
              />
              <div className="relative z-10">
                <h2
                  id="cta-conocenos-heading"
                  className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
                >
                  ¿Listo para ser el depredador de tu mercado?
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-base text-gray-300 sm:text-lg">
                  Únete a equipos comerciales que ya prospectan con datos
                  reales, CRM integrado y cotizaciones profesionales en un solo
                  lugar.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href={Routes.auth.register}
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                  >
                    Prueba Kadesh Hoy
                  </Link>
                  <Link
                    href={Routes.precios}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-orange-500/50 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                  >
                    Ver planes y precios
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
