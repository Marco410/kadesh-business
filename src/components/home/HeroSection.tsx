"use client";

import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

const MOCK_LEADS = [
  { name: "Bufete Legal García", rating: 4.8 },
  { name: "Dental Care CDMX", rating: 4.5 },
  { name: "Bar La Esquina", rating: 4.2 },
];

function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
      {/* Glow behind card */}
      <div className="absolute -inset-4 rounded-3xl bg-orange-500/20 dark:bg-orange-500/10 blur-2xl animate-pulse" />
      {/* Card container */}
      <div className="relative rounded-2xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Mini map area */}
        <div className="relative h-46 sm:h-64 bg-[#0d0d0d]">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                linear-gradient(rgba(30,30,30,0.9) 0%, transparent 50%),
                repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(80,80,80,0.2) 20px, rgba(80,80,80,0.2) 21px),
                repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(80,80,80,0.2) 20px, rgba(80,80,80,0.2) 21px)
              `,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-orange-500/70 border-dashed"
              style={{ boxShadow: "0 0 0 3px rgba(247, 148, 94, 0.15)" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-5 h-5 rounded-full bg-orange-500 shadow-lg"
            >
              <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 rounded-lg bg-[#2a2a2a]/90 px-2 py-1 text-xs text-white/80">
            Radio: 5 km
          </div>
        </div>
        {/* Leads list preview */}
        <div className="px-3 py-2 border-t border-white/5">
          <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mb-2">
            Clientes encontrados
          </p>
          <ul className="space-y-1.5">
            {MOCK_LEADS.map((lead, i) => (
              <li
                key={lead.name}
                style={{ animationDelay: `${600 + i * 150}ms` }}
                className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5"
              >
                <span className="text-xs text-white/90 truncate pr-2">
                  {lead.name}
                </span>
                <span className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  <HugeiconsIcon icon={StarIcon} size={12} />
                  <span className="text-xs font-medium">{lead.rating}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Floating "live" indicator */}
      <div className="absolute -top-2 right-2 sm:right-4 flex items-center gap-1.5 rounded-full bg-green-500 border border-green-500/40 px-2.5 py-1 text-[10px] sm:text-xs text-white font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Datos en tiempo real
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] overflow-hidden"
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
