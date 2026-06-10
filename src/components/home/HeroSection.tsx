import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import HeroVisual from "kadesh/components/home/HeroVisual";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] overflow-hidden"
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left: Copy + CTA */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Encuentra clientes para tu negocio en segundos.
            </h1>

            <p className="text-lg sm:text-xl text-white/95 mb-10 leading-relaxed">
              Busca negocios desde el mapa, obtén sus datos reales y gestiona
              tus ventas desde un CRM integrado.
            </p>

            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                <Link
                  href={Routes.auth.register}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-700 font-bold text-lg rounded-2xl shadow-xl hover:bg-orange-50 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 transition-all duration-300"
                >
                  Empieza gratis ahora (50 leads incluidos)
                </Link>
              </div>
              <p className="text-sm sm:text-base text-white/85 text-center lg:text-left max-w-md">
                ¿Prefieres verlo antes?{" "}
                <Link
                  href="/#agendar-demo"
                  className="font-semibold text-white underline underline-offset-4 decoration-white/70 hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 rounded-sm"
                >
                  Agenda una demo en vivo (15 min)
                </Link>
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
