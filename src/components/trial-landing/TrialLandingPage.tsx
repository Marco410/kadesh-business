import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  SparklesIcon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import Logo from "kadesh/components/shared/Logo";
import HeroVisual from "kadesh/components/home/HeroVisual";
import AiDigestCard from "kadesh/components/home/AiDigestCard";
import TestimonialsSection from "kadesh/components/home/TestimonialsSection";
import DemoPlayer from "kadesh/components/home/interactive-demo/DemoPlayer";
import {
  PRIMARY_CTA_CLASS,
  PRIMARY_CTA_ON_DARK_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
} from "kadesh/components/home/landing-cta";
import {
  MIN_COMPANIES_TO_SHOW,
  fetchLandingStats,
  roundDownForDisplay,
} from "kadesh/components/home/landing-stats";
import { HERO_TESTIMONIAL } from "kadesh/components/home/testimonials";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { KADESH_SUPPORT, buildSupportWhatsAppUrl } from "kadesh/constants/support";
import { Routes } from "kadesh/core/routes";
import {
  TRIAL_CLOSE_PERKS,
  TRIAL_DEMO_WHATSAPP_MESSAGE,
  TRIAL_FAQ,
  TRIAL_HEADLINES,
  TRIAL_HERO_PERKS,
  TRIAL_LEAD_FIELDS,
  TRIAL_PAINS,
  TRIAL_PRICE_COPY,
  TRIAL_STEPS,
  type TrialAngle,
} from "kadesh/components/trial-landing/constants";

const SECTION_TITLE_CLASS =
  "mb-6 text-3xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-4xl";

/**
 * Landing de anuncios: sin menú ni enlaces a otros productos, una sola acción (crear la cuenta).
 * La demo por WhatsApp queda como enlace secundario al final. Server Component; solo la demo
 * interactiva es cliente.
 */
export default async function TrialLandingPage({ angle }: { angle: TrialAngle }) {
  const stats = await fetchLandingStats();
  const companies =
    stats && stats.companies >= MIN_COMPANIES_TO_SHOW
      ? roundDownForDisplay(stats.companies)
      : null;

  return (
    <main className="min-h-screen bg-white pb-24 dark:bg-[#121212] sm:pb-0">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-800 to-orange-900 dark:from-orange-800 dark:via-orange-900 dark:to-[#5c2c0a]">
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2 text-lg font-bold text-white">
            <Logo size={36} className="brightness-0 invert" />
            KADESH
          </span>
          <p className="text-right text-xs text-white/85 sm:text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={Routes.auth.login}
              className="font-semibold text-white underline underline-offset-4 hover:text-white"
            >
              Inicia sesión
            </Link>
          </p>
        </header>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-10 lg:flex-row lg:gap-14 lg:px-8 lg:pb-20">
          <div className="max-w-xl flex-1 text-center lg:max-w-2xl lg:text-left">
            <h1 className="mb-5 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
              {TRIAL_HEADLINES[angle]}
            </h1>
            <p className="mx-auto mb-7 max-w-lg text-base leading-relaxed text-white sm:text-lg lg:mx-0">
              Eliges el giro y la zona en un mapa. Kadesh te entrega negocios
              reales de Google Maps con su teléfono, listos para llamar o
              mandar WhatsApp.
            </p>
            <Link href={TRIAL_CTA_HREF} className={`${PRIMARY_CTA_ON_DARK_CLASS} w-full sm:w-auto`}>
              {TRIAL_CTA_LABEL}
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
            <p className="mt-3 text-xs text-white/90 sm:text-sm">
              {TRIAL_HERO_PERKS.join(" · ")}
            </p>

            <div className="mt-7 flex flex-col items-center gap-1.5 border-t border-white/20 pt-5 text-sm text-white lg:items-start">
              {companies && (
                <p className="text-white/80">
                  <strong className="font-semibold text-white">
                    {companies.toLocaleString("es-MX")}+
                  </strong>{" "}
                  empresas ya prospectan con Kadesh
                </p>
              )}
              <p className="flex items-start gap-2 text-center lg:text-left">
                <HugeiconsIcon
                  icon={StarIcon}
                  size={16}
                  className="mt-0.5 shrink-0 fill-amber-300 text-amber-300"
                  aria-hidden
                />
                <span>
                  «{HERO_TESTIMONIAL.quote}»{" "}
                  <span className="text-white/80">— {HERO_TESTIMONIAL.name}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex w-full flex-1 justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* 2. Dolor */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className={SECTION_TITLE_CLASS}>Si vendes a negocios, esto te suena</h2>
          <ul className="space-y-3">
            {TRIAL_PAINS.map((pain) => (
              <li
                key={pain}
                className="flex gap-3 rounded-2xl border border-[#e8e8e8] bg-[#f8f8f8] p-4 text-[#424242] dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#d6d6d6]"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                  aria-hidden
                />
                {pain}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-lg font-semibold text-[#212121] dark:text-white">
            Cada día que tu equipo arma listas a mano es un día que no está
            vendiendo.
          </p>
        </div>
      </section>

      {/* 3. Cómo funciona */}
      <section className="bg-[#f8f8f8] py-16 dark:bg-[#0d0d0d] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className={`${SECTION_TITLE_CLASS} text-center`}>Tu primera lista en 3 pasos</h2>
          <ol className="mx-auto mb-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {TRIAL_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[#e0e0e0] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
              >
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-orange-800 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="font-semibold text-[#212121] dark:text-white">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
          <div className="mb-10">
            <DemoPlayer />
          </div>
          <div className="text-center">
            <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_CLASS}>
              Probarlo ahora gratis
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Qué recibes en cada prospecto */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className={SECTION_TITLE_CLASS}>
            Teléfono, dirección y reseñas, del día de hoy
          </h2>
          <ul className="space-y-3">
            {TRIAL_LEAD_FIELDS.map((field) => (
              <li key={field.label} className="flex gap-3 text-[#424242] dark:text-[#d6d6d6]">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={20}
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                  aria-hidden
                />
                <span>
                  <strong className="text-[#212121] dark:text-white">{field.label}:</strong>{" "}
                  {field.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Más que una lista */}
      <section className="bg-[#f3eefc] py-16 dark:bg-[#0c0a14] sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div>
            <h2 className={SECTION_TITLE_CLASS}>
              Del primer contacto al cierre, en un solo lugar
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-[#424242] dark:text-[#d6d6d6]">
              Los prospectos no se quedan en un Excel. Entran a un CRM donde
              registras llamadas, programas seguimientos, mandas cotizaciones
              y ves qué vendedor está cerrando.
            </p>
            <p className="flex gap-3 rounded-2xl bg-white p-5 leading-relaxed text-[#424242] shadow-sm dark:bg-[#141118] dark:text-[#d6d6d6]">
              <HugeiconsIcon
                icon={SparklesIcon}
                size={20}
                className="mt-0.5 shrink-0 text-[#6d28d9] dark:text-[#c4b5fd]"
                aria-hidden
              />
              <span>
                <strong className="text-[#212121] dark:text-white">
                  {KADESH_URIM_AI_NAME}
                </strong>{" "}
                revisa tu CRM cada mañana y te propone 3 pasos: a quién llamar,
                qué cotización empujar y qué seguimiento no puede esperar.
                Incluido en todos los planes.
              </span>
            </p>
          </div>
          <AiDigestCard />
        </div>
      </section>

      {/* 6. Testimonios */}
      <TestimonialsSection />

      {/* 7. Precio */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className={SECTION_TITLE_CLASS}>Empieza gratis. Paga solo si te sirve.</h2>
          <p className="mb-8 text-lg leading-relaxed text-[#424242] dark:text-[#d6d6d6]">
            {TRIAL_PRICE_COPY}
          </p>
          <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_CLASS}>
            {TRIAL_CTA_LABEL}
          </Link>
          <p className="mt-4">
            <Link
              href={Routes.precios}
              className="text-sm font-medium text-orange-800 underline underline-offset-4 hover:text-orange-900 dark:text-orange-400"
            >
              Ver todos los planes
            </Link>
          </p>
        </div>
      </section>

      {/* 8. Preguntas frecuentes */}
      <section className="bg-[#f8f8f8] py-16 dark:bg-[#0d0d0d] sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className={`${SECTION_TITLE_CLASS} text-center`}>Preguntas frecuentes</h2>
          <div className="space-y-3">
            {TRIAL_FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-[#e0e0e0] bg-white dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-[#212121] dark:text-white [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={18}
                    className="shrink-0 text-orange-800 transition-transform group-open:rotate-180 dark:text-orange-400"
                    aria-hidden
                  />
                </summary>
                <p className="border-t border-[#e0e0e0] px-5 pb-4 pt-3 leading-relaxed text-[#616161] dark:border-[#2a2a2a] dark:text-[#b0b0b0]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Cierre */}
      <section className="bg-orange-800 py-16 dark:bg-orange-900 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Tu próxima lista de clientes está a un minuto
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white">
            Elige tu ciudad y tu giro. Te regalamos 7 días y 70 créditos para
            que lo pruebes con prospectos reales antes de pagar un peso.
          </p>
          <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_ON_DARK_CLASS}>
            {TRIAL_CTA_LABEL}
          </Link>
          <p className="mt-4 text-sm text-white/90">{TRIAL_CLOSE_PERKS.join(" · ")}</p>
          <p className="mt-6 text-sm text-white">
            ¿Prefieres verlo con alguien?{" "}
            <a
              href={buildSupportWhatsAppUrl(TRIAL_DEMO_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline underline-offset-4 hover:text-white"
            >
              Escríbenos por WhatsApp y te hacemos una demo de 15 min
            </a>
          </p>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="bg-gray-900 py-6 text-center text-sm text-gray-400 dark:bg-black">
        <p>
          © {new Date().getFullYear()} Kadesh ·{" "}
          <Link href={Routes.terms} className="hover:text-white">
            Términos
          </Link>{" "}
          ·{" "}
          <Link href={Routes.privacy} className="hover:text-white">
            Privacidad
          </Link>{" "}
          ·{" "}
          <a href={`mailto:${KADESH_SUPPORT.email}`} className="hover:text-white">
            {KADESH_SUPPORT.email}
          </a>
        </p>
      </footer>

      {/* Botón fijo en celular: la única acción siempre a la mano. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e0e0e0] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-[#2a2a2a] dark:bg-[#121212]/95 sm:hidden">
        <Link href={TRIAL_CTA_HREF} className={`${PRIMARY_CTA_CLASS} w-full`}>
          {TRIAL_CTA_LABEL}
        </Link>
      </div>
    </main>
  );
}
