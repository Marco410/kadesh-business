import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import HeroVisual from "kadesh/components/home/HeroVisual";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative w-full min-h-0 flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] overflow-hidden py-20"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
      </div>
      {/* Subtle grid (dark mode) */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
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
                  className="inline-flex h-11 items-center justify-center px-6 text-sm font-semibold rounded-lg border border-white/40 text-white bg-white/5 hover:bg-white/10 transition-colors w-full sm:w-auto"
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
