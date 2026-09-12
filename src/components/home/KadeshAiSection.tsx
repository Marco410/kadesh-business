"use client";

import { useRef } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";

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

const DIGEST_EXAMPLE = [
  {
    source: "Cotización sin respuesta",
    title: "Clínica Dental Norte",
    detail: "Enviada hace 5 días. Llama hoy, antes de que se enfríe.",
  },
  {
    source: "Sin primer contacto",
    title: "Taller Martínez",
    detail: "Lead nuevo. Abre con un WhatsApp de dos líneas.",
  },
  {
    source: "Seguimiento vencido",
    title: "Constructora Lima",
    detail: "La propuesta espera desde el lunes.",
  },
] as const;

const KNOWLEDGE = [
  { pillar: "Qué", summary: "Sitios y campañas para negocios locales" },
  { pillar: "Quién", summary: "Clínicas, talleres y constructoras" },
  { pillar: "Cuánto", summary: "Proyectos de 15 a 40 mil MXN" },
  { pillar: "Cómo", summary: "Extraes en Maps y cierras por WhatsApp" },
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
              <h2
                id="kadesh-ai-heading"
                className="mb-4 text-3xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-4xl"
              >
                ¿Cómo funciona {KADESH_URIM_AI_NAME}?
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
              <Link
                href={Routes.auth.register}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(231,124,58,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0a14]"
              >
                Probar {KADESH_URIM_AI_NAME} con 50 leads gratis
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
            <div className="ai-live-ring rounded-3xl">
              <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_rgba(76,29,149,0.16)] dark:bg-[#141118] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#ececec] px-4 py-3 dark:border-[#2a2a2a] sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                    }}
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={18} />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-[#212121] dark:text-white">
                      Resumen de hoy
                    </p>
                    <p className="text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
                      Ejemplo · {KADESH_URIM_AI_NAME} en el panel
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full bg-[#f3eefc] px-3 py-1 text-xs font-semibold text-[#6d28d9] dark:bg-[#2a1848] dark:text-[#c4b5fd] sm:inline">
                  3 siguientes pasos
                </span>
              </div>

              <div>
                <ol className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
                  {DIGEST_EXAMPLE.map((item, index) => (
                    <li
                      key={item.title}
                      className="ai-digest-row flex gap-3 px-4 py-4 sm:px-5"
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#7a7a7a]">
                          {item.source}
                        </p>
                        <p className="text-sm font-semibold text-[#212121] dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <aside className="border-t border-[#ececec] bg-[#faf8ff] dark:border-[#2a2a2a] dark:bg-[#1a1624]">
                  <p className="px-4 pt-4 text-sm font-semibold text-[#212121] dark:text-white sm:px-5">
                    Lo que {KADESH_URIM_AI_NAME} sabe
                  </p>
                  <ul className="px-4 pb-4 pt-2 sm:px-5">
                    {KNOWLEDGE.map((item) => (
                      <li
                        key={item.pillar}
                        className="ai-knowledge-row border-b border-[#ececec] py-2.5 last:border-b-0 dark:border-[#2a2a2a]"
                      >
                        <p className="text-xs font-semibold text-[#212121] dark:text-white">
                          {item.pillar}
                        </p>
                        <p className="text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]">
                          {item.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
