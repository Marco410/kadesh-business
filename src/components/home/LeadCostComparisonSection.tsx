"use client";

import { useRef } from "react";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";
import { PRO_PLAN_PUBLIC } from "kadesh/components/pricing/constants";

export default function LeadCostComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ads = sectionRef.current?.querySelector("[data-count='ads']");
        const adsState = { value: 0 };

        if (ads) {
          gsap.fromTo(
            adsState,
            { value: 0 },
            {
              value: 300,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 72%",
                once: true,
              },
              onUpdate: () => {
                const n = Math.round(adsState.value);
                ads.textContent = n < 150 ? `$${n}` : `$150–$${n}`;
              },
            },
          );
        }

        gsap.from(".cost-panel", {
          y: 28,
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
      id="costo-leads"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-5 leading-tight text-center">
          ¿Cuánto cuesta un lead en Kadesh frente a Meta Ads?
        </h2>
        <p className="text-lg text-[#424242] dark:text-[#d6d6d6] max-w-3xl mx-auto mb-10 leading-relaxed text-center">
          Un lead en Meta Ads suele costar entre 150 y 300 MXN y no siempre
          incluye un teléfono. Con el plan Pro de Kadesh (
          {PRO_PLAN_PUBLIC.monthlyMxn} MXN y {PRO_PLAN_PUBLIC.leadLimit}{" "}
          créditos al mes) el costo queda en unos{" "}
          {PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)} MXN por prospecto, con
          teléfono, dirección y rating listos para contactar en minutos.
        </p>

        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center mb-10">
          <div className="cost-panel rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-6 py-6 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
              Meta Ads
            </p>
            <p
              data-count="ads"
              className="text-4xl font-black tabular-nums text-red-700 dark:text-red-300"
            >
              $150–$300
            </p>
            <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-1">
              MXN por lead, aprox.
            </p>
          </div>
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-[#9ca3af]">
            vs
          </p>
          <div className="cost-panel rounded-3xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/25 px-6 py-6 text-center shadow-[0_16px_36px_rgba(231,124,58,0.16)]">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
              Kadesh Plan Pro
            </p>
            <p className="text-4xl font-black tabular-nums text-orange-700 dark:text-orange-300">
              ~${PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)}
            </p>
            <p className="text-sm text-orange-800/80 dark:text-orange-400/80 mt-1">
              MXN por lead
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] mb-10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">
              Comparativa de costo por lead entre Meta Ads y Kadesh
            </caption>
            <thead className="bg-[#f3f3f3] dark:bg-[#252525] text-[#212121] dark:text-white">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Canal
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Costo por lead
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Qué recibes
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="text-[#424242] dark:text-[#d6d6d6]">
              <tr className="border-t border-[#e8e8e8] dark:border-[#2a2a2a]">
                <th scope="row" className="px-4 py-3 font-medium">
                  Meta Ads
                </th>
                <td className="px-4 py-3">150–300 MXN (aprox.)</td>
                <td className="px-4 py-3">
                  Clics o formularios; el teléfono no siempre llega
                </td>
                <td className="px-4 py-3">Días o semanas de campaña</td>
              </tr>
              <tr className="border-t border-[#e8e8e8] dark:border-[#2a2a2a] bg-orange-50/70 dark:bg-orange-950/20">
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-[#212121] dark:text-white"
                >
                  Kadesh Plan Pro
                </th>
                <td className="px-4 py-3 font-semibold">
                  ~{PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)} MXN
                </td>
                <td className="px-4 py-3">
                  Negocio de Google Maps con teléfono, dirección y rating
                </td>
                <td className="px-4 py-3">Minutos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[#757575] dark:text-[#9e9e9e] text-center mb-8 max-w-2xl mx-auto">
          El rango de Meta Ads es una referencia de mercado y varía por sector y
          campaña. El costo en Kadesh usa el precio del plan Pro (
          {PRO_PLAN_PUBLIC.monthlyMxn} MXN) sobre {PRO_PLAN_PUBLIC.leadLimit}{" "}
          créditos mensuales.
        </p>

        <div className="text-center">
          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white hover:text-white font-bold text-lg rounded-2xl shadow-[0_12px_28px_rgba(231,124,58,0.3)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d0d0d] transition-all duration-150"
          >
            Empieza gratis (50 leads incluidos)
          </Link>
        </div>
      </div>
    </section>
  );
}
