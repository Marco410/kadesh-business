"use client";

import { useRef } from "react";
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
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";

const TRUST_BADGES = [
  { icon: Shield01Icon, label: "Datos públicos legales" },
  { icon: Tick02Icon, label: "Sin tarjeta" },
  { icon: FlashIcon, label: "Listo en 60 s" },
] as const;

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          const orbs = root.querySelectorAll<HTMLElement>(".hero-orb");

          if (reduceMotion) {
            gsap.set([".hero-copy > *", ".hero-visual-frame"], {
              autoAlpha: 1,
              y: 0,
              filter: "none",
              clipPath: "none",
            });
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          tl.from(
            ".hero-headline",
            {
              y: 36,
              autoAlpha: 0,
              filter: "blur(10px)",
              duration: 0.72,
            },
            0,
          )
            .from(
              ".hero-lead",
              { y: 20, autoAlpha: 0, duration: 0.5 },
              0.12,
            )
            .from(
              ".hero-ai-chip",
              { y: 12, duration: 0.4 },
              0.2,
            )
            .from(
              ".hero-badge",
              { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.4 },
              0.26,
            )
            .from(
              ".hero-cta",
              { y: 16, autoAlpha: 0, duration: 0.45 },
              0.32,
            )
            .from(
              ".hero-visual-frame",
              {
                y: 40,
                autoAlpha: 0,
                scale: 0.94,
                duration: 0.8,
                ease: "power4.out",
              },
              0.18,
            );

          orbs.forEach((orb, index) => {
            gsap.to(orb, {
              y: index % 2 === 0 ? 18 : -22,
              x: index % 2 === 0 ? 12 : -10,
              duration: 5 + index,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative w-full min-h-0 flex items-center justify-center overflow-hidden py-20 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]"
    >
      <div className="absolute inset-0 pointer-events-none dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_75%,rgba(251,146,60,0.45),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(194,65,12,0.18),transparent_45%)]" />
      </div>

      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_30%,rgba(251,146,60,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_70%,rgba(234,88,12,0.1),transparent_45%)]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-orb absolute top-[12%] -left-16 w-80 h-80 rounded-full blur-3xl bg-white/25 dark:bg-orange-400/20" />
        <div className="hero-orb absolute bottom-[8%] -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl bg-orange-800/30 dark:bg-orange-600/15" />
        <div className="hero-orb absolute top-1/2 right-[18%] w-56 h-56 rounded-full blur-3xl bg-white/15 dark:bg-orange-500/10 hidden sm:block" />
        <div className="hero-orb absolute bottom-[30%] left-[35%] w-40 h-40 rounded-full blur-2xl bg-orange-700/20 dark:hidden" />
      </div>

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

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          <div className="hero-copy flex-1 text-center lg:text-left max-w-xl lg:max-w-2xl">
            <h1 className="hero-headline text-[2rem] sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-bold text-white mb-5 leading-[1.12] tracking-tight">
              Extrae leads B2B de Google Maps y conviértelos en clientes
            </h1>

            <p className="hero-lead text-base sm:text-lg text-white/90 mb-5 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Kadesh extrae negocios reales de Google Maps con teléfono, rating
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
                  className="hero-badge inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white/95"
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
                  className="inline-flex h-12 items-center justify-center px-7 text-sm font-semibold rounded-xl bg-white text-gray-900 hover:text-gray-900 shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 transition-all duration-150 w-full sm:w-auto"
                >
                  Probar gratis
                  <span className="ml-1.5 font-normal text-gray-500 hidden sm:inline">
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
              <p className="text-xs text-white/70 text-center lg:text-left">
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
