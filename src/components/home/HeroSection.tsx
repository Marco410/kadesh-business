import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import HeroVisual from "kadesh/components/home/HeroVisual";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  FlashIcon,
  Tick02Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";

const TRUST_BADGES = [
  { icon: Shield01Icon, label: "Datos públicos legales" },
  { icon: Tick02Icon, label: "Sin tarjeta" },
  { icon: FlashIcon, label: "Listo en 60 s" },
] as const;

/**
 * Server Component hero — no GSAP on the critical path.
 * Entrance fades that start at opacity 0 delay LCP; keep copy visible immediately.
 */
export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-800 to-orange-900 dark:from-orange-800 dark:via-orange-900 dark:to-[#5c2c0a]"
    >
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          <div className="hero-copy flex-1 text-center lg:text-left max-w-xl lg:max-w-2xl">
            <h1 className="hero-headline text-[2rem] sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-bold text-white mb-5 leading-[1.12] tracking-tight">
              Extrae leads B2B de Google Maps e INEGI y conviértelos en clientes
            </h1>

            <p className="hero-lead text-base sm:text-lg text-white mb-5 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Kadesh extrae negocios reales de Google Maps e INEGI con teléfono
              y dirección, y los gestiona en un CRM integrado.{" "}
              <Link
                href={`${Routes.home}${Routes.navigation.kadeshAi}`}
                className="ai-urim-fill mx-0.5 inline-flex translate-y-px items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold text-white no-underline shadow-[0_6px_14px_rgba(139,92,246,0.35)] hover:text-white hover:opacity-90"
              >
                <HugeiconsIcon icon={SparklesIcon} size={14} />
                {KADESH_URIM_AI_NAME}
              </Link>{" "}
              revisa tu pipeline y te propone qué hacer hoy: está en todos los
              planes. Prueba 7 días con 50 leads gratis, sin tarjeta.
            </p>

            <Link
              href={`${Routes.home}${Routes.navigation.kadeshAi}`}
              className="hero-ai-chip ai-urim-fill mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-[0_8px_20px_rgba(139,92,246,0.4)] transition-opacity hover:opacity-90 hover:text-white"
            >
              <HugeiconsIcon icon={SparklesIcon} size={16} />
              {KADESH_URIM_AI_NAME} · En todos los planes
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-7">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="hero-badge inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white"
                >
                  <HugeiconsIcon
                    icon={badge.icon}
                    size={14}
                    className="text-white"
                  />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="hero-cta flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Link
                  href={Routes.auth.register}
                  className="inline-flex h-12 items-center justify-center px-7 text-sm font-semibold rounded-xl bg-white text-gray-900 hover:text-gray-900 shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-800 transition-all duration-150 w-full sm:w-auto"
                >
                  Probar gratis
                  <span className="ml-1.5 font-normal text-gray-700 hidden sm:inline">
                    (50 leads)
                  </span>
                </Link>
                <Link
                  href="/#agendar-demo"
                  className="inline-flex h-12 items-center justify-center px-7 text-sm font-semibold rounded-xl border border-white/70 text-white bg-white/15 hover:bg-white/25 shadow-sm transition-colors duration-150 w-full sm:w-auto dark:border-white/40 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Solicitar demo
                </Link>
              </div>
              <p className="text-xs text-white/90 text-center lg:text-left">
                7 días de prueba · Cancela cuando quieras
              </p>
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
