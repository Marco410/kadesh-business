"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  HeartAddIcon,
  KanbanIcon,
  Location01Icon,
  MoneyBag02Icon,
  Shield01Icon,
  Target02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";

const PROBLEM_POINTS = [
  {
    icon: CancelCircleIcon,
    title: "Herramientas desconectadas",
    description:
      "Un CRM por un lado, Excel por otro, WhatsApp para cotizar y Trello para operar. Cada día se pierde contexto entre plataformas.",
  },
  {
    icon: MoneyBag02Icon,
    title: "Penalización por crecer",
    description:
      "Contratas más vendedores y la factura se dispara: la competencia cobra por asiento y castiga exactamente lo que quieres lograr.",
  },
  {
    icon: Target02Icon,
    title: "Prospección sin sistema",
    description:
      "Horas en Google Maps sin pipeline claro. Los leads se enfrían, el seguimiento se rompe y el cierre se vuelve impredecible.",
  },
] as const;

const ECOSYSTEM_FEATURES = [
  "Radar de Prospección: extrae clientes de Google Maps en tiempo real",
  "CRM integrado con pipeline y seguimiento comercial",
  "Cotizador financiero profesional listo para enviar",
  "Tableros Kanban para operar proyectos sin salir de la plataforma",
  "Tarifa plana con usuarios ilimitados: crece tu equipo sin sorpresas en la factura",
] as const;

const VALUES = [
  {
    icon: Shield01Icon,
    title: "Transparencia total",
    description:
      "Sin letra chica ni costos ocultos. Sabes exactamente qué pagas y qué obtienes desde el primer día.",
  },
  {
    icon: UserMultiple02Icon,
    title: "Tarifa justa",
    description:
      "Usuarios ilimitados en un modelo de tarifa plana. No castigamos tu crecimiento cobrando por cada persona que sumes al equipo.",
  },
  {
    icon: HeartAddIcon,
    title: "Compromiso dual",
    description:
      "El éxito comercial de hoy financia la misión social de mañana. Cada empresa que crece con Kadesh nos acerca a reactivar Kadesh Pet.",
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
    "Conoce la historia de KADESH: ecosistema operativo todo-en-uno para equipos de ventas B2B y agencias. Prospección, CRM, cotizador y Kanban con usuarios ilimitados.",
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
      "Ecosistema operativo todo-en-uno para ventas B2B: prospección en Google Maps, CRM, cotizador y tableros Kanban con tarifa plana y usuarios ilimitados.",
    areaServed: {
      "@type": "Country",
      name: "México",
    },
    knowsAbout: [
      "Prospección B2B",
      "CRM de ventas",
      "Leads desde Google Maps",
      "Automatización comercial",
      "Software todo-en-uno para agencias",
    ],
  },
};

function StoryProductImage() {
  return (
    <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#e0e0e0] bg-[#1a1a1a] shadow-xl dark:border-[#2a2a2a] dark:shadow-orange-500/10">
      <Image
        src="/images/sections/product.png"
        alt="Panel de KADESH: radar de prospección B2B en Google Maps, CRM y gestión comercial integrada"
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

function OriginStoryImage() {
  return (
    <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#e0e0e0] bg-[#1a1a1a] shadow-xl dark:border-[#2a2a2a] dark:shadow-orange-500/10">
      <Image
        src="/images/sections/geo-search.png"
        alt="Motor de geolocalización de KADESH: tecnología de mapas que conecta ubicaciones en tiempo real"
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
 * Página "Conócenos" — manifiesto, historia, visión y CTA de KADESH Negocios.
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

        {/* Sección 1: El Manifiesto */}
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
                El manifiesto KADESH
              </p>
              <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                Transformamos la forma en que las empresas crecen
              </h1>
              <p className="text-lg leading-relaxed text-orange-50 sm:text-xl dark:text-gray-300">
                Kadesh es un ecosistema operativo todo-en-uno para equipos de
                ventas B2B y agencias. Unimos prospección, CRM, cotizaciones y
                operación en una sola plataforma — con tarifa plana y usuarios
                ilimitados — para que dejes de pelear con el software y te
                enfoques en cerrar negocios.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Sección 2: El problema que venimos a destruir */}
        <section
          id="el-problema"
          aria-labelledby="problema-heading"
          className="bg-white py-16 dark:bg-[#121212] sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.header
              {...fadeInUp}
              className="mx-auto mb-12 max-w-3xl text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                El caos que terminamos
              </p>
              <h2
                id="problema-heading"
                className="mb-4 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
              >
                Odiamos que crezcas pagando de más por herramientas rotas
              </h2>
              <p className="text-lg leading-relaxed text-[#616161] dark:text-gray-300">
                Las agencias y equipos comerciales B2B no fallan por falta de
                talento. Fallan porque operan con software fragmentado, procesos
                manuales y un modelo de precios que les cobra más cada vez que
                contratan a alguien nuevo.
              </p>
            </motion.header>

            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEM_POINTS.map((point, index) => (
                <motion.article
                  key={point.title}
                  {...fadeInUp}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-[#e0e0e0] bg-[#f8f8f8] p-6 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-8"
                >
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
                    <HugeiconsIcon
                      icon={point.icon}
                      size={24}
                      className="text-orange-500 dark:text-orange-400"
                      aria-hidden
                    />
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-[#212121] dark:text-white">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#616161] dark:text-gray-300 sm:text-base">
                    {point.description}
                  </p>
                </motion.article>
              ))}
            </div>

            <motion.div
              {...fadeInUp}
              className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
            >
              <div>
                <h3 className="mb-4 text-2xl font-bold text-[#212121] dark:text-white sm:text-3xl">
                  Un ecosistema, no un parche más
                </h3>
                <p className="mb-6 text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  Kadesh resuelve la fragmentación de punta a punta. Todo lo que
                  tu equipo necesita para prospectar, vender y operar vive en un
                  solo lugar — sin integraciones frágiles ni licencias que se
                  multiplican con cada contratación.
                </p>
                <ul className="space-y-3">
                  {ECOSYSTEM_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-[#616161] dark:text-gray-300"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                        aria-hidden
                      />
                      <span className="text-sm leading-relaxed sm:text-base">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <StoryProductImage />
            </motion.div>
          </div>
        </section>

        {/* Sección 3: Detrás del código — nuestra historia */}
        <section
          id="nuestra-historia"
          aria-labelledby="historia-heading"
          className="bg-[#f8f8f8] py-16 dark:bg-[#0d0d0d] sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="order-2 lg:order-1"
              >
                <OriginStoryImage />
              </motion.div>

              <motion.div {...fadeInUp} className="order-1 lg:order-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                  Detrás del código
                </p>
                <h2
                  id="historia-heading"
                  className="mb-6 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
                >
                  De refugio para animales a radar de ventas
                </h2>
                <p className="mb-4 text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  El motor de geolocalización de Kadesh no nació en una sala de
                  juntas. Durante tres años lo desarrollamos para{" "}
                  <a
                    href="https://pet.kadesh.com.mx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#212121] underline decoration-orange-500/40 underline-offset-2 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                  >
                    Kadesh Pet
                  </a>
                  : una plataforma de mapas diseñada para reportar, buscar y
                  rescatar animales perdidos, conectándolos con veterinarias
                  cercanas.
                </p>
                <p className="mb-4 text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  <strong className="font-semibold text-[#212121] dark:text-white">
                    Kadesh
                  </strong>{" "}
                  significa &ldquo;lugar sagrado&rdquo; o &ldquo;refugio&rdquo;.
                  Esa es la esencia que llevamos en el nombre: tecnología con
                  propósito, creada para conectar lo que importa en el mapa
                  correcto.
                </p>
                <p className="mb-6 text-base leading-relaxed text-[#616161] dark:text-gray-300 sm:text-lg">
                  Cuando el proyecto de mascotas se pausó por falta de capital y
                  fuerza de marketing, descubrimos algo poderoso: la misma
                  tecnología que localizaba animales en tiempo real podía
                  transformar la prospección comercial B2B. Así nació nuestro{" "}
                  <strong className="font-semibold text-[#212121] dark:text-white">
                    Radar de Prospección
                  </strong>
                  : de salvar vidas en el mapa a impulsar el crecimiento de
                  empresas que lo necesitan.
                </p>
                <div className="flex items-start gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 dark:border-orange-500/30 dark:bg-orange-500/10">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={22}
                    className="mt-0.5 shrink-0 text-orange-500 dark:text-orange-400"
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-[#616161] dark:text-gray-300 sm:text-base">
                    Hoy esa misma precisión geográfica ayuda a dueños de
                    agencias y directores de ventas a encontrar clientes reales
                    en Google Maps — con datos verificables y un pipeline listo
                    para actuar.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sección 4: Visión y valores */}
        <section
          id="vision-valores"
          aria-labelledby="vision-heading"
          className="bg-white py-16 dark:bg-[#121212] sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.header
              {...fadeInUp}
              className="mx-auto mb-12 max-w-3xl text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                Visión y valores
              </p>
              <h2
                id="vision-heading"
                className="mb-4 text-3xl font-bold text-[#212121] dark:text-white sm:text-4xl"
              >
                Crecemos contigo — hoy en negocios, mañana en impacto social
              </h2>
              <p className="text-lg leading-relaxed text-[#616161] dark:text-gray-300">
                Nuestro objetivo es empoderar a las empresas para que aumenten
                sus ventas y optimicen su operación. A largo plazo, el éxito
                comercial de Kadesh SaaS nos permitirá financiar y reactivar la
                misión original con los animales.
              </p>
            </motion.header>

            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((value, index) => (
                <motion.article
                  key={value.title}
                  {...fadeInUp}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-[#e0e0e0] bg-[#f8f8f8] p-6 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-8"
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

            <motion.div
              {...fadeInUp}
              className="rounded-2xl border border-[#e0e0e0] bg-[#f8f8f8] p-6 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
                  <HugeiconsIcon
                    icon={KanbanIcon}
                    size={24}
                    className="text-orange-500 dark:text-orange-400"
                    aria-hidden
                  />
                </span>
                <h3 className="text-xl font-bold text-[#212121] dark:text-white sm:text-2xl">
                  Lo que creemos
                </h3>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                <li className="flex items-start gap-3 text-[#616161] dark:text-gray-300">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed sm:text-base">
                    El software comercial debe simplificar, no complicar.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-[#616161] dark:text-gray-300">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed sm:text-base">
                    Crecer no debería costarte más por cada persona en tu
                    equipo.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-[#616161] dark:text-gray-300">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed sm:text-base">
                    La tecnología con propósito puede transformar industrias
                    enteras.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-[#616161] dark:text-gray-300">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed sm:text-base">
                    El impacto social y el éxito comercial pueden ir de la mano.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Sección 5: Llamado a la acción */}
        <section
          id="cta-conocenos"
          aria-labelledby="cta-conocenos-heading"
          className="bg-[#f5f5f5] py-16 dark:bg-[#0a0a0a] sm:py-24"
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
                  Forma parte de esta historia de crecimiento
                </h2>
                <p className="mx-auto mb-2 max-w-2xl text-base text-gray-300 sm:text-lg">
                  Prueba Kadesh durante 7 días con acceso al ecosistema
                  completo: prospección en Google Maps, CRM, cotizador y
                  tableros Kanban — con usuarios ilimitados y sin sorpresas en
                  tu factura.
                </p>
                <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400 sm:text-base">
                  7 días de prueba · Cancela cuando quieras
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href={Routes.auth.register}
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                  >
                    Inicia tu prueba de 7 días
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
