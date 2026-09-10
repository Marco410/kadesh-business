"use client";

import { useRef } from "react";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";

export default function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".final-cta-copy > *", {
          y: 24,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="cta-final"
      className="relative py-20 sm:py-28 overflow-hidden bg-orange-500 dark:bg-orange-600"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-orange-800/40 blur-3xl" />

      <div className="final-cta-copy relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
          ¿Listo para extraer tu primera lista de leads B2B?
        </h2>
        <p className="text-lg text-white/90 mb-8 leading-relaxed">
          Crea tu cuenta en menos de un minuto. 50 leads de Google Maps
          incluidos, 7 días de prueba y sin tarjeta de crédito.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 hover:text-gray-900 font-bold text-lg rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 transition-all duration-150"
          >
            Acceder ahora a Kadesh
          </Link>
          <Link
            href="/#agendar-demo"
            className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold text-lg rounded-2xl border border-white/60 hover:bg-white/10 transition-colors duration-150"
          >
            Agendar demo en vivo
          </Link>
        </div>
      </div>
    </section>
  );
}
