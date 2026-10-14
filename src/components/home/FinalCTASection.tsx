"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";
import {
  DEMO_CTA_HREF,
  PRIMARY_CTA_ON_DARK_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
} from "kadesh/components/home/landing-cta";

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
      className="relative py-20 sm:py-28 overflow-hidden bg-orange-800 dark:bg-orange-900"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-orange-950/40 blur-3xl" />

      <div className="final-cta-copy relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
          Tu próxima lista de clientes está a un minuto
        </h2>
        <p className="text-lg text-white mb-8 leading-relaxed">
          Elige tu ciudad y tu giro. Te regalamos 7 días y 70 créditos para que
          lo pruebes con prospectos reales antes de pagar un peso.
        </p>
        <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_ON_DARK_CLASS}>
          {TRIAL_CTA_LABEL}
        </Link>
        <p className="mt-4 text-sm text-white/90">
          70 créditos incluidos · Sin tarjeta · Sin compromiso
        </p>
        <p className="mt-6 text-sm text-white">
          ¿Prefieres verlo con alguien?{" "}
          <Link
            href={DEMO_CTA_HREF}
            className="font-semibold text-white underline underline-offset-4 hover:text-white hover:decoration-2"
          >
            Agenda una demo de 15 min
          </Link>
        </p>
      </div>
    </section>
  );
}
