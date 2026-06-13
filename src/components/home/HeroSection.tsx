import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import HeroVisual from "kadesh/components/home/HeroVisual";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative w-full min-h-0 flex items-center justify-center overflow-hidden py-20 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]"
    >
      {/* Light-mode depth: soft highlights + shadow vignettes */}
      <div className="absolute inset-0 pointer-events-none dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_75%,rgba(251,146,60,0.45),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(194,65,12,0.18),transparent_45%)]" />
      </div>

      {/* Dark-mode depth */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_30%,rgba(251,146,60,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_70%,rgba(234,88,12,0.1),transparent_45%)]" />
      </div>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] -left-16 w-80 h-80 rounded-full blur-3xl bg-white/25 dark:bg-orange-400/20" />
        <div className="absolute bottom-[8%] -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl bg-orange-800/30 dark:bg-orange-600/15" />
        <div className="absolute top-1/2 right-[18%] w-56 h-56 rounded-full blur-3xl bg-white/15 dark:bg-orange-500/10 hidden sm:block" />
        <div className="absolute bottom-[30%] left-[35%] w-40 h-40 rounded-full blur-2xl bg-orange-700/20 dark:hidden" />
      </div>

      {/* Grid overlay — stronger in light mode */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.09] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Dot pattern — light mode only */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14] dark:hidden"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* Left: Copy + CTA */}
          <div className="flex-1 text-center lg:text-left max-w-xl lg:max-w-2xl">
            <h1 className="text-[1.75rem] sm:text-3xl lg:text-4xl font-bold text-white mb-5 leading-[1.2] tracking-tight">
              Obtén leads cualificados en minutos y{" "}
              <span className="text-white/90">conviértelos en clientes</span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Extrae negocios reales de Google Maps con teléfono, rating y
              dirección. Gestiona todo el funnel desde un CRM integrado.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-7">
              {[
                { icon: "🛡️", label: "Datos públicos legales" },
                { icon: "💳", label: "Sin tarjeta" },
                { icon: "⚡", label: "Listo en 60 s" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-medium text-white/90"
                >
                  <span aria-hidden>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                <Link
                  href={Routes.auth.register}
                  className="inline-flex h-11 items-center justify-center px-6 text-sm font-semibold rounded-lg bg-white text-gray-900 shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Probar gratis
                  <span className="ml-1.5 font-normal text-gray-500 hidden sm:inline">
                    (50 leads)
                  </span>
                </Link>
                <Link
                  href="/#agendar-demo"
                  className="inline-flex h-11 items-center justify-center px-6 text-sm font-semibold rounded-lg border border-white/70 text-white bg-white/15 hover:bg-white/25 shadow-sm transition-colors w-full sm:w-auto dark:border-white/40 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Solicitar demo
                </Link>
              </div>
              <p className="text-xs text-white/70 text-center lg:text-left">
                7 días de prueba · Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* Right: Product visual */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
