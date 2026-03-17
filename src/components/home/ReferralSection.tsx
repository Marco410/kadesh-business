"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  SAAS_PLANS_QUERY,
  type SaasPlansResponse,
  type SaasPlanItem,
} from "kadesh/components/profile/sales/queries";

const MONTHS_RECURRING = 12;

function formatCurrency(amount: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPlanByName(plans: SaasPlanItem[], slug: "starter" | "pro" | "agencia") {
  return plans.find((plan) => plan.name.trim().toLowerCase() === slug);
}

export default function ReferralSection() {
  const { data, loading } = useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);
  const plans = data?.saasPlans ?? [];

  const { starter, pro, agencia } = useMemo(() => {
    const starterPlan = getPlanByName(plans, "starter");
    const proPlan = getPlanByName(plans, "pro");
    const agenciaPlan = getPlanByName(plans, "agencia");
    return { starter: starterPlan, pro: proPlan, agencia: agenciaPlan };
  }, [plans]);

  const starterCurrency = starter?.currency ?? "MXN";
  const proCurrency = pro?.currency ?? "MXN";
  const agenciaCurrency = agencia?.currency ?? "MXN";

  const starterUpfrontRate = (starter?.referralUpfrontCommissionPct ?? 20) / 100;
  const starterRecurringRate = (starter?.referralRecurringCommissionPct ?? 10) / 100;
  const proUpfrontRate = (pro?.referralUpfrontCommissionPct ?? 20) / 100;
  const proRecurringRate = (pro?.referralRecurringCommissionPct ?? 10) / 100;
  const agenciaUpfrontRate = (agencia?.referralUpfrontCommissionPct ?? 20) / 100;
  const agenciaRecurringRate = (agencia?.referralRecurringCommissionPct ?? 10) / 100;

  const starterFirst = starter ? starter.cost * starterUpfrontRate : 160;
  const starterRecurring = starter ? starter.cost * starterRecurringRate : 80;

  const proFirst = pro ? pro.cost * proUpfrontRate : 340;
  const proRecurring = pro ? pro.cost * proRecurringRate : 170;

  const agenciaFirst = agencia ? agencia.cost * agenciaUpfrontRate : 700;
  const agenciaRecurring = agencia ? agencia.cost * agenciaRecurringRate : 350;

  const starterExampleFirstMonth = starterFirst * 10;
  const starterExampleMonthly = starterRecurring * 10;

  const proExampleFirstMonth = proFirst * 10;
  const proExampleMonthly = proRecurring * 10;

  const agenciaExampleFirstMonth = agenciaFirst * 5;
  const agenciaExampleMonthly = agenciaRecurring * 5;

  const comboFirstMonth = starterFirst * 4 + proFirst * 4 + agenciaFirst * 2;
  const comboMonthly = starterRecurring * 4 + proRecurring * 4 + agenciaRecurring * 2;

  return (
    <section className="bg-[#0b0b0f] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Programa de referidos KADESH
        </h2>
        <p className="text-sm sm:text-base text-white/70 mb-4 max-w-3xl">
          Gana comisiones recurrentes por cada negocio que refieras a KADESH. Te
          pagamos por el primer pago y también mes a mes mientras tus referidos
          sigan activos.
        </p>
        {loading && (
          <p className="text-xs text-white/60 mb-6">
            Calculando comisiones con los precios actuales de los planes...
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300 flex items-center gap-1 mb-1">
              💰 Starter{" "}
              {starter && (
                <span className="font-normal text-white/80">
                  – {formatCurrency(starter.cost, starterCurrency)} / mes
                </span>
              )}
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Starter</h3>
            <ul className="space-y-1.5 text-sm text-white/80 mb-4">
              <li>
                <strong>Primer pago ({Math.round(starterUpfrontRate * 100)}%)</strong>: ganas{" "}
                <span className="font-semibold">
                  {formatCurrency(starterFirst, starterCurrency)}
                </span>{" "}
                por cada venta.
              </li>
              <li>
                <strong>Ingreso recurrente ({Math.round(starterRecurringRate * 100)}%)</strong>: recibes{" "}
                <span className="font-semibold">
                  {formatCurrency(starterRecurring, starterCurrency)} / mes
                </span>{" "}
                mientras el cliente siga activo (hasta {MONTHS_RECURRING} meses).
              </li>
            </ul>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-white/80">
                Si vendes <strong>10 planes Starter</strong>:
              </p>
              <p className="mt-1">
                • <strong>Primer mes</strong>:{" "}
                {formatCurrency(starterExampleFirstMonth, starterCurrency)}
              </p>
              <p>
                • <strong>Ingreso mensual</strong>:{" "}
                {formatCurrency(starterExampleMonthly, starterCurrency)} durante{" "}
                {MONTHS_RECURRING} meses
              </p>
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-b from-amber-500/10 to-transparent p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300 flex items-center gap-1 mb-1">
              ⭐ Pro{" "}
              {pro && (
                <span className="font-normal text-white/80">
                  – {formatCurrency(pro.cost, proCurrency)} / mes (más vendido)
                </span>
              )}
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Pro</h3>
            <ul className="space-y-1.5 text-sm text-white/80 mb-4">
              <li>
                <strong>Primer pago ({Math.round(proUpfrontRate * 100)}%)</strong>: ganas{" "}
                <span className="font-semibold">
                  {formatCurrency(proFirst, proCurrency)}
                </span>{" "}
                por cada venta.
              </li>
              <li>
                <strong>Ingreso recurrente ({Math.round(proRecurringRate * 100)}%)</strong>: recibes{" "}
                <span className="font-semibold">
                  {formatCurrency(proRecurring, proCurrency)} / mes
                </span>
                .
              </li>
            </ul>
            <div className="rounded-2xl bg-black/20 border border-amber-300/40 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-white/80">
                Si vendes <strong>10 planes Pro</strong>:
              </p>
              <p className="mt-1">
                • <strong>Primer mes</strong>:{" "}
                {formatCurrency(proExampleFirstMonth, proCurrency)}
              </p>
              <p>
                • <strong>Ingreso mensual</strong>:{" "}
                {formatCurrency(proExampleMonthly, proCurrency)} durante{" "}
                {MONTHS_RECURRING} meses
              </p>
            </div>
          </div>

          {/* Agencia */}
          <div className="rounded-2xl border border-sky-300/50 bg-sky-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300 flex items-center gap-1 mb-1">
              🚀 Agencia{" "}
              {agencia && (
                <span className="font-normal text-white/80">
                  – {formatCurrency(agencia.cost, agenciaCurrency)} / mes
                </span>
              )}
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Agencia</h3>
            <ul className="space-y-1.5 text-sm text-white/80 mb-4">
              <li>
                <strong>Primer pago ({Math.round(agenciaUpfrontRate * 100)}%)</strong>: ganas{" "}
                <span className="font-semibold">
                  {formatCurrency(agenciaFirst, agenciaCurrency)}
                </span>{" "}
                por cada venta.
              </li>
              <li>
                <strong>Ingreso recurrente ({Math.round(agenciaRecurringRate * 100)}%)</strong>: recibes{" "}
                <span className="font-semibold">
                  {formatCurrency(agenciaRecurring, agenciaCurrency)} / mes
                </span>
                .
              </li>
            </ul>
            <div className="rounded-2xl bg-sky-500/10 border border-sky-300/40 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-white/80">
                Si vendes <strong>5 planes Agencia</strong>:
              </p>
              <p className="mt-1">
                • <strong>Primer mes</strong>:{" "}
                {formatCurrency(agenciaExampleFirstMonth, agenciaCurrency)}
              </p>
              <p>
                • <strong>Ingreso mensual</strong>:{" "}
                {formatCurrency(agenciaExampleMonthly, agenciaCurrency)} durante{" "}
                {MONTHS_RECURRING} meses
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold mb-3">
              📈 Ejemplo real de ingresos de un vendedor
            </h3>
            <p className="text-sm text-white/80 mb-3">Si en un mes vendes:</p>
            <ul className="text-sm text-white/80 space-y-1.5 mb-4">
              <li>• 4 planes Starter</li>
              <li>• 4 planes Pro</li>
              <li>• 2 planes Agencia</li>
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-sm">
                <p className="font-semibold mb-1">Ingresos primer mes</p>
                <p>
                  Starter: 4 × {formatCurrency(starterFirst, starterCurrency)} ={" "}
                  <strong>{formatCurrency(starterFirst * 4, starterCurrency)}</strong>
                </p>
                <p>
                  Pro: 4 × {formatCurrency(proFirst, proCurrency)} ={" "}
                  <strong>{formatCurrency(proFirst * 4, proCurrency)}</strong>
                </p>
                <p>
                  Agencia: 2 × {formatCurrency(agenciaFirst, agenciaCurrency)} ={" "}
                  <strong>{formatCurrency(agenciaFirst * 2, agenciaCurrency)}</strong>
                </p>
                <p className="mt-2 text-emerald-300 font-semibold">
                  Total primer mes: {formatCurrency(comboFirstMonth, starterCurrency)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border-emerald-400/40 p-4 text-sm">
                <p className="font-semibold mb-1">Ingreso recurrente mensual</p>
                <p>
                  Starter: 4 × {formatCurrency(starterRecurring, starterCurrency)} ={" "}
                  <strong>{formatCurrency(starterRecurring * 4, starterCurrency)}</strong>
                </p>
                <p>
                  Pro: 4 × {formatCurrency(proRecurring, proCurrency)} ={" "}
                  <strong>{formatCurrency(proRecurring * 4, proCurrency)}</strong>
                </p>
                <p>
                  Agencia: 2 × {formatCurrency(agenciaRecurring, agenciaCurrency)} ={" "}
                  <strong>{formatCurrency(agenciaRecurring * 2, agenciaCurrency)}</strong>
                </p>
                <p className="mt-2 text-emerald-300 font-semibold">
                  Total mensual: {formatCurrency(comboMonthly, starterCurrency)}
                </p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Mientras los clientes sigan activos durante {MONTHS_RECURRING} meses.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/85">
            <h3 className="text-lg font-semibold mb-3">💡 Potencial de ingresos</h3>
            <p className="mb-3">
              Con los precios actuales de los planes, un vendedor que mantenga{" "}
              <strong>30-40 clientes activos</strong> puede ganar fácilmente:
            </p>
            <p className="mb-3">
              <strong>
                {formatCurrency(
                  (starterRecurring + proRecurring + agenciaRecurring) * 10,
                  starterCurrency,
                )}{" "}
                –{" "}
                {formatCurrency(
                  (starterRecurring + proRecurring + agenciaRecurring) * 15,
                  starterCurrency,
                )}{" "}
                MXN mensuales
              </strong>{" "}
              solo en comisiones recurrentes, además de las comisiones por nuevas ventas.
            </p>
            <p className="text-xs text-white/60">
              Las comisiones se calculan sobre el precio listado del plan y se pagan
              mientras la suscripción del cliente se mantenga activa y al corriente
              (hasta {MONTHS_RECURRING} meses por cliente).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
