"use client";

import { useRef } from "react";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { gsap, useGSAP } from "kadesh/components/home/register-gsap";
import { PRO_PLAN_PUBLIC } from "kadesh/components/pricing/constants";

/** Meta Ads: referencia de mercado (MXN por lead). Se compara contra el extremo bajo para no exagerar. */
const META_ADS_MIN_MXN = 150;
const META_ADS_MAX_MXN = 300;
const TIMES_CHEAPER = Math.floor(META_ADS_MIN_MXN / PRO_PLAN_PUBLIC.costPerLeadMxn);
/** Ancho de la barra de Kadesh frente a la de Meta Ads (máx.); con un mínimo para que se vea. */
const KADESH_BAR_PCT = Math.max(1.5, (PRO_PLAN_PUBLIC.costPerLeadMxn / META_ADS_MAX_MXN) * 100);

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
              value: META_ADS_MAX_MXN,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 72%",
                once: true,
              },
              onUpdate: () => {
                const n = Math.round(adsState.value);
                ads.textContent =
                  n < META_ADS_MIN_MXN ? `$${n}` : `$${META_ADS_MIN_MXN}–$${n}`;
              },
            },
          );
        }

        gsap.from(".cost-bar", {
          scaleX: 0,
          transformOrigin: "left center",
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        });

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
      className="relative overflow-hidden py-16 sm:py-24 bg-[#121212] text-white dark:bg-[#0a0a0a]"
    >
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-orange-600/20 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
          Costo por lead
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight text-center">
          ¿Cuánto cuesta un lead en Kadesh frente a Meta Ads?
        </h2>
        <p className="text-lg text-white/75 max-w-3xl mx-auto mb-12 leading-relaxed text-center">
          Un lead en Meta Ads suele costar entre {META_ADS_MIN_MXN} y{" "}
          {META_ADS_MAX_MXN} MXN y no siempre incluye un teléfono. Con el plan
          Pro de Kadesh ({PRO_PLAN_PUBLIC.monthlyMxn} MXN y{" "}
          {PRO_PLAN_PUBLIC.leadLimit} créditos al mes) el costo queda en unos{" "}
          {PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)} MXN por prospecto, con
          teléfono y dirección listos para contactar en minutos.
        </p>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="cost-panel rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-7">
            <p className="text-sm font-semibold text-white/60 mb-2">Meta Ads</p>
            <p
              data-count="ads"
              className="text-4xl sm:text-5xl font-black tabular-nums text-white/50 line-through decoration-red-400/70 decoration-2"
            >
              ${META_ADS_MIN_MXN}–${META_ADS_MAX_MXN}
            </p>
            <p className="text-sm text-white/50 mt-1">MXN por lead, aprox.</p>
          </div>
          <div className="cost-panel relative rounded-3xl border border-orange-500/40 bg-gradient-to-br from-orange-700/40 to-orange-900/30 px-6 py-7 shadow-[0_20px_60px_rgba(234,88,12,0.25)]">
            <p className="text-sm font-semibold text-orange-200 mb-2">Kadesh Plan Pro</p>
            <p className="text-5xl sm:text-6xl font-black tabular-nums text-white">
              ~${PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)}
            </p>
            <p className="text-sm text-orange-100/80 mt-1">MXN por lead, con teléfono</p>
            <span className="absolute -top-3 right-5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              +{TIMES_CHEAPER}× más barato
            </span>
          </div>
        </div>

        {/* Barras proporcionales: la de Kadesh casi no se ve, y ese es el punto. */}
        <div className="mb-12 space-y-4" aria-hidden>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-white/60">
              <span>Meta Ads</span>
              <span className="tabular-nums">hasta ${META_ADS_MAX_MXN} MXN</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div className="cost-bar h-full w-full rounded-full bg-gradient-to-r from-red-500/60 to-red-400/80" />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-white/60">
              <span>Kadesh</span>
              <span className="tabular-nums">~${PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)} MXN</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="cost-bar h-full rounded-full bg-orange-500"
                style={{ width: `${KADESH_BAR_PCT}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] mb-10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">
              Comparativa de costo por lead entre Meta Ads y Kadesh
            </caption>
            <thead className="bg-white/[0.06] text-white">
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
            <tbody className="text-white/75">
              <tr className="border-t border-white/10">
                <th scope="row" className="px-4 py-3 font-medium">
                  Meta Ads
                </th>
                <td className="px-4 py-3">{META_ADS_MIN_MXN}–{META_ADS_MAX_MXN} MXN (aprox.)</td>
                <td className="px-4 py-3">
                  Clics o formularios; el teléfono no siempre llega
                </td>
                <td className="px-4 py-3">Días o semanas de campaña</td>
              </tr>
              <tr className="border-t border-white/10 bg-orange-500/10">
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-white"
                >
                  Kadesh Plan Pro
                </th>
                <td className="px-4 py-3 font-semibold">
                  ~{PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2)} MXN
                </td>
                <td className="px-4 py-3">
                  Negocio de Google Maps o INEGI con teléfono y dirección
                </td>
                <td className="px-4 py-3">Minutos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-white/50 text-center mb-8 max-w-2xl mx-auto">
          El rango de Meta Ads es una referencia de mercado y varía por sector y
          campaña. El costo en Kadesh usa el precio del plan Pro (
          {PRO_PLAN_PUBLIC.monthlyMxn} MXN) sobre {PRO_PLAN_PUBLIC.leadLimit}{" "}
          créditos mensuales.
        </p>

        <div className="text-center">
          <Link
            href={Routes.auth.register}
            className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-orange-50 text-gray-900 hover:text-gray-900 font-bold text-lg rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] transition-all duration-150"
          >
            Empieza gratis (70 leads incluidos)
          </Link>
        </div>
      </div>
    </section>
  );
}
