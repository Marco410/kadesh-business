"use client";

import { useRef } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";
import AiDigestCard from "kadesh/components/home/AiDigestCard";
import {
  PRIMARY_CTA_CLASS,
  SECTION_QUESTION_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
} from "kadesh/components/home/landing-cta";

const FLOW = [
  {
    title: "Cuéntale qué vendes",
    detail:
      "Oferta, cliente ideal, ticket y cómo cierras. Con lo que capturas en el perfil, ya sabe de tu empresa.",
  },
  {
    title: "Revisa el pipeline",
    detail:
      "Cotizaciones sin respuesta, clientes sin primer contacto, seguimientos vencidos y leads que se enfriaron.",
  },
  {
    title: "Tres siguientes pasos",
    detail:
      "Cada día te dice a quién contactar, qué cotización empujar y qué seguimiento no puede esperar.",
  },
] as const;

/**
 * Cómo funciona Kadesh AI: perfil del negocio + pipeline → 3 pasos de hoy.
 * Copy alineado con src/components/profile/ai/README.md (sin proveedores ni jerga).
 */
export default function KadeshAiSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".ai-home-intro > *",
            ".ai-flow-step",
            ".ai-home-cta",
            ".ai-home-mock",
            ".ai-digest-row",
            ".ai-knowledge-row",
          ],
          { autoAlpha: 1, y: 0, x: 0, filter: "none" },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            once: true,
          },
        });

        tl.from(".ai-home-intro > *", {
          y: 22,
          autoAlpha: 0,
          filter: "blur(8px)",
          stagger: 0.08,
          duration: 0.55,
        })
          .from(
            ".ai-flow-step",
            { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.45 },
            0.16,
          )
          .from(
            ".ai-home-mock",
            { y: 28, autoAlpha: 0, duration: 0.55 },
            0.12,
          )
          .from(
            ".ai-digest-row",
            { y: 14, autoAlpha: 0, stagger: 0.14, duration: 0.42 },
            0.38,
          )
          .from(
            ".ai-knowledge-row",
            { x: 12, autoAlpha: 0, stagger: 0.07, duration: 0.35 },
            0.5,
          )
          .from(".ai-home-cta", { y: 14, autoAlpha: 0, duration: 0.4 }, 0.62);
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="kadesh-ai"
      aria-labelledby="kadesh-ai-heading"
      className="relative overflow-hidden py-16 sm:py-24 scroll-mt-28 sm:scroll-mt-32 bg-[#f3eefc] dark:bg-[#0c0a14]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl opacity-70"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--ai-urim-purple) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--ai-urim-blue) 40%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div>
            <div className="ai-home-intro">
              <p className={SECTION_QUESTION_CLASS}>
                ¿Cómo funciona {KADESH_URIM_AI_NAME}?
              </p>
              <h2
                id="kadesh-ai-heading"
                className="mb-4 text-3xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-4xl"
              >
                {KADESH_URIM_AI_NAME} te dice cada mañana a quién llamar primero
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[#424242] dark:text-[#d6d6d6]">
                {KADESH_URIM_AI_NAME} ya conoce tu negocio —qué vendes, a quién
                y cómo cierras— y revisa tu CRM cada día. Te propone tres
                siguientes pasos: a quién contactar, qué cotización empujar y
                qué seguimiento no puede esperar. No es un chat genérico:
                trabaja con tu pipeline.
              </p>
            </div>

            <ol className="mb-8 space-y-5">
              {FLOW.map((step, index) => (
                <li key={step.title} className="ai-flow-step flex gap-4">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-[0_8px_18px_rgba(139,92,246,0.35)]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#212121] dark:text-white">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="ai-home-cta">
              <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_CLASS}>
                {TRIAL_CTA_LABEL}
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </Link>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                El administrador lo configura en el panel; el equipo ve el
                resumen del día en Inicio. Está en todos los planes: usa los
                créditos de tu cuota o conecta tu propia API key.
              </p>
            </div>
          </div>

          <div className="ai-home-mock">
            <AiDigestCard />
          </div>
        </div>
      </div>
    </section>
  );
}
