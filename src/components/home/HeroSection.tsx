import Link from "next/link";
import HeroVisual from "kadesh/components/home/HeroVisual";
import HeroMapBackdrop from "kadesh/components/home/HeroMapBackdrop";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons";
import {
  DEMO_CTA_HREF,
  DEMO_CTA_LABEL,
  PRIMARY_CTA_ON_DARK_CLASS,
  SECONDARY_CTA_ON_DARK_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
  TRIAL_PERKS,
} from "kadesh/components/home/landing-cta";
import {
  MIN_COMPANIES_TO_SHOW,
  fetchLandingStats,
  roundDownForDisplay,
} from "kadesh/components/home/landing-stats";
import { HERO_TESTIMONIAL } from "kadesh/components/home/testimonials";

/**
 * Server Component hero — no GSAP on the critical path.
 * Entrance fades that start at opacity 0 delay LCP; keep copy visible immediately.
 * Una sola promesa: titular → subtítulo → botón → quitamiedos → prueba social.
 */
export default async function HeroSection() {
  const stats = await fetchLandingStats();
  const companies =
    stats && stats.companies >= MIN_COMPANIES_TO_SHOW
      ? roundDownForDisplay(stats.companies)
      : null;

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-800 to-orange-900 dark:from-orange-800 dark:via-orange-900 dark:to-[#5c2c0a]"
    >
      <HeroMapBackdrop />
      <div
        className="hero-orb pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl motion-safe:animate-[kadesh-float_7s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="hero-orb pointer-events-none absolute bottom-8 left-1/3 h-40 w-40 rounded-full bg-orange-800/30 blur-3xl motion-safe:animate-[kadesh-float_9s_ease-in-out_infinite_reverse] hidden sm:block"
        aria-hidden
      />
      <div
        className="hero-orb absolute top-1/2 right-[18%] w-56 h-56 rounded-full blur-3xl bg-white/15 dark:bg-orange-500/10 hidden sm:block motion-safe:animate-[kadesh-float_8s_ease-in-out_infinite]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-28 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          <div className="hero-copy flex-1 text-center lg:text-left max-w-xl lg:max-w-2xl">
            <p className="mb-4 text-sm font-semibold text-white/90">
              Prospección para agencias y equipos de ventas en México
            </p>
            <h1 className="hero-headline text-[2rem] sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-bold text-white mb-5 leading-[1.12] tracking-tight">
              Encuentra cientos de clientes para tu negocio, en tu ciudad, en
              menos de un minuto
            </h1>

            <p className="hero-lead text-base sm:text-lg text-white mb-7 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Kadesh saca negocios reales de Google Maps e INEGI con su teléfono
              y los deja en un CRM listo para llamar o mandar WhatsApp. Sin
              comprar bases de datos que ya no contestan.
            </p>

            <div className="hero-cta flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Link
                  href={TRIAL_CTA_HREF}
                  className={`${PRIMARY_CTA_ON_DARK_CLASS} w-full sm:w-auto`}
                >
                  {TRIAL_CTA_LABEL}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </Link>
                <Link
                  href={DEMO_CTA_HREF}
                  className={`${SECONDARY_CTA_ON_DARK_CLASS} w-full sm:w-auto`}
                >
                  {DEMO_CTA_LABEL}
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-white/90 text-center lg:text-left">
                {TRIAL_PERKS.join(" · ")}
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center gap-1.5 border-t border-white/20 pt-5 text-sm text-white lg:items-start">
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
              {companies && (
                <p className="text-white/80">
                  <strong className="font-semibold text-white">
                    {companies.toLocaleString("es-MX")}+
                  </strong>{" "}
                  empresas ya prospectan con Kadesh
                </p>
              )}
            </div>
          </div>

          <div className="hero-visual-frame flex-1 w-full flex justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
