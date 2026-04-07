"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  SAAS_PLANS_QUERY,
  type SaasPlansResponse,
  type SaasPlanItem,
} from "kadesh/components/profile/sales/queries";

const MONTHS_RECURRING = 12;
const ANNUAL_COMMISSION_PCT = 0.15;

function formatCurrency(amount: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isMonthlyFrequency(frequency: string): boolean {
  const f = frequency?.toLowerCase();
  return f === "monthly" || f === "month";
}

function isAnnualFrequency(frequency: string): boolean {
  const f = frequency?.toLowerCase();
  return f === "annual" || f === "yearly" || f === "year";
}

function normalizePlanBaseKey(name: string): string {
  return name
    .trim()
    .replace(/\s+anual\s*$/i, "")
    .trim()
    .toLowerCase();
}

function getPlanPairBySlug(
  plans: SaasPlanItem[],
  slug: "starter" | "pro" | "agencia",
): { monthly: SaasPlanItem | null; annual: SaasPlanItem | null } {
  const base = plans.filter((p) => normalizePlanBaseKey(p.name) === slug);
  return {
    monthly: base.find((p) => isMonthlyFrequency(p.frequency)) ?? null,
    annual: base.find((p) => isAnnualFrequency(p.frequency)) ?? null,
  };
}

export default function ReferralSection() {
  const { data, loading } = useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);
  const plans = data?.saasPlans ?? [];

  const { starter, pro, agencia } = useMemo(() => {
    return {
      starter: getPlanPairBySlug(plans, "starter"),
      pro: getPlanPairBySlug(plans, "pro"),
      agencia: getPlanPairBySlug(plans, "agencia"),
    };
  }, [plans]);

  const starterCurrency = starter.monthly?.currency ?? starter.annual?.currency ?? "MXN";
  const proCurrency = pro.monthly?.currency ?? pro.annual?.currency ?? "MXN";
  const agenciaCurrency = agencia.monthly?.currency ?? agencia.annual?.currency ?? "MXN";

  const starterUpfrontRate = (starter.monthly?.referralUpfrontCommissionPct ?? 20) / 100;
  const starterRecurringRate = (starter.monthly?.referralRecurringCommissionPct ?? 10) / 100;
  const proUpfrontRate = (pro.monthly?.referralUpfrontCommissionPct ?? 20) / 100;
  const proRecurringRate = (pro.monthly?.referralRecurringCommissionPct ?? 10) / 100;
  const agenciaUpfrontRate = (agencia.monthly?.referralUpfrontCommissionPct ?? 20) / 100;
  const agenciaRecurringRate = (agencia.monthly?.referralRecurringCommissionPct ?? 10) / 100;

  const starterFirst = starter.monthly ? starter.monthly.cost * starterUpfrontRate : 0;
  const starterRecurring = starter.monthly ? starter.monthly.cost * starterRecurringRate : 0;
  const starterAnnualCommission = starter.annual ? starter.annual.cost * ANNUAL_COMMISSION_PCT : 0;

  const proFirst = pro.monthly ? pro.monthly.cost * proUpfrontRate : 0;
  const proRecurring = pro.monthly ? pro.monthly.cost * proRecurringRate : 0;
  const proAnnualCommission = pro.annual ? pro.annual.cost * ANNUAL_COMMISSION_PCT : 0;

  const agenciaFirst = agencia.monthly ? agencia.monthly.cost * agenciaUpfrontRate : 0;
  const agenciaRecurring = agencia.monthly ? agencia.monthly.cost * agenciaRecurringRate : 0;
  const agenciaAnnualCommission = agencia.annual ? agencia.annual.cost * ANNUAL_COMMISSION_PCT : 0;

  const starterExampleFirstMonth = starterFirst * 10;
  const starterExampleMonthly = starterRecurring * 10;
  const starterExampleAnnual = starterAnnualCommission * 10;

  const proExampleFirstMonth = proFirst * 10;
  const proExampleMonthly = proRecurring * 10;
  const proExampleAnnual = proAnnualCommission * 10;

  const agenciaExampleFirstMonth = agenciaFirst * 5;
  const agenciaExampleMonthly = agenciaRecurring * 5;
  const agenciaExampleAnnual = agenciaAnnualCommission * 5;

  const comboFirstMonth = starterFirst * 4 + proFirst * 4 + agenciaFirst * 2;
  const comboMonthly = starterRecurring * 4 + proRecurring * 4 + agenciaRecurring * 2;
  const comboAnnual =
    starterAnnualCommission * 4 + proAnnualCommission * 4 + agenciaAnnualCommission * 2;

  return (
    <section className="bg-[#f8f8f8] text-[#212121] dark:bg-[#0b0b0f] dark:text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Programa de referidos KADESH
        </h2>
        <p className="text-sm sm:text-base text-[#616161] dark:text-white/70 mb-4 max-w-3xl">
          Gana comisiones recurrentes por cada negocio que refieras a KADESH. Te
          pagamos por el primer pago y también mes a mes mientras tus referidos
          sigan activos.
        </p>
        {loading && (
          <p className="text-xs text-[#757575] dark:text-white/60 mb-6">
            Calculando comisiones con los precios actuales de los planes...
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-[#e0e0e0] dark:border-white/10 bg-white dark:bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-1">
              💰 Starter{" "}
              <span className="ml-1 inline-flex flex-wrap items-center gap-1.5 font-normal text-[#616161] dark:text-white/80">
                {starter.monthly && (
                  <span className="inline-flex items-center rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#424242] dark:bg-white/10 dark:text-white/85">
                    Mensual: {formatCurrency(starter.monthly.cost, starterCurrency)} / mes
                  </span>
                )}
                {starter.annual && (
                  <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    Anual: {formatCurrency(starter.annual.cost, starterCurrency)} / año (pago único)
                  </span>
                )}
              </span>
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Starter</h3>
            <ul className="space-y-1.5 text-sm text-[#424242] dark:text-white/80 mb-4">
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
              {starter.annual && (
                <li>
                  <strong>Paquete anual (15%)</strong>: ganas{" "}
                  <span className="font-semibold">
                    {formatCurrency(starterAnnualCommission, starterCurrency)}
                  </span>{" "}
                  por venta anual (pago único).
                </li>
              )}
            </ul>
            <div className="rounded-xl bg-[#fafafa] dark:bg-white/5 border border-[#e0e0e0] dark:border-white/10 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-[#424242] dark:text-white/80">
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
              {starter.annual && (
                <p className="mt-1">
                  • <strong>Ventas anuales</strong>:{" "}
                  {formatCurrency(starterExampleAnnual, starterCurrency)} (10 ventas × 15%)
                </p>
              )}
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-amber-400/50 dark:border-amber-300/60 bg-gradient-to-b from-amber-200/35 to-white dark:from-amber-500/10 dark:to-transparent p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 flex items-center gap-1 mb-1">
              ⭐ Pro{" "}
              <span className="ml-1 inline-flex flex-wrap items-center gap-1.5 font-normal text-[#616161] dark:text-white/80">
                {pro.monthly && (
                  <span className="inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-[#424242] dark:bg-black/20 dark:text-white/85">
                    Mensual: {formatCurrency(pro.monthly.cost, proCurrency)} / mes
                  </span>
                )}
                {pro.annual && (
                  <span className="inline-flex items-center rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                    Anual: {formatCurrency(pro.annual.cost, proCurrency)} / año (pago único)
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Más vendido
                </span>
              </span>
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Pro</h3>
            <ul className="space-y-1.5 text-sm text-[#424242] dark:text-white/80 mb-4">
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
              {pro.annual && (
                <li>
                  <strong>Paquete anual (15%)</strong>: ganas{" "}
                  <span className="font-semibold">
                    {formatCurrency(proAnnualCommission, proCurrency)}
                  </span>{" "}
                  por venta anual (pago único).
                </li>
              )}
            </ul>
            <div className="rounded-2xl bg-white/70 dark:bg-black/20 border border-amber-400/40 dark:border-amber-300/40 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-[#424242] dark:text-white/80">
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
              {pro.annual && (
                <p className="mt-1">
                  • <strong>Ventas anuales</strong>:{" "}
                  {formatCurrency(proExampleAnnual, proCurrency)} (10 ventas × 15%)
                </p>
              )}
            </div>
          </div>

          {/* Agencia */}
          <div className="rounded-2xl border border-sky-300/70 dark:border-sky-300/50 bg-sky-50 dark:bg-sky-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300 flex items-center gap-1 mb-1">
              🚀 Agencia{" "}
              <span className="ml-1 inline-flex flex-wrap items-center gap-1.5 font-normal text-[#616161] dark:text-white/80">
                {agencia.monthly && (
                  <span className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-500/10 dark:text-white/85">
                    Mensual: {formatCurrency(agencia.monthly.cost, agenciaCurrency)} / mes
                  </span>
                )}
                {agencia.annual && (
                  <span className="inline-flex items-center rounded-full bg-sky-600/10 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-300/10 dark:text-sky-200">
                    Anual: {formatCurrency(agencia.annual.cost, agenciaCurrency)} / año (pago único)
                  </span>
                )}
              </span>
            </p>
            <h3 className="text-lg font-semibold mb-3">Plan Agencia</h3>
            <ul className="space-y-1.5 text-sm text-[#424242] dark:text-white/80 mb-4">
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
              {agencia.annual && (
                <li>
                  <strong>Paquete anual (15%)</strong>: ganas{" "}
                  <span className="font-semibold">
                    {formatCurrency(agenciaAnnualCommission, agenciaCurrency)}
                  </span>{" "}
                  por venta anual (pago único).
                </li>
              )}
            </ul>
            <div className="rounded-2xl bg-sky-100/60 dark:bg-sky-500/10 border border-sky-300/60 dark:border-sky-300/40 p-4 text-sm">
              <p className="font-semibold mb-1">Ejemplo</p>
              <p className="text-[#424242] dark:text-white/80">
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
              {agencia.annual && (
                <p className="mt-1">
                  • <strong>Ventas anuales</strong>:{" "}
                  {formatCurrency(agenciaExampleAnnual, agenciaCurrency)} (5 ventas × 15%)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="rounded-2xl border border-[#e0e0e0] dark:border-white/10 bg-white dark:bg-white/5 p-6">
            <h3 className="text-lg font-semibold mb-3">
              📈 Ejemplo real de ingresos de un vendedor
            </h3>
            <p className="text-sm text-[#424242] dark:text-white/80 mb-3">Si en un mes vendes:</p>
            <ul className="text-sm text-[#424242] dark:text-white/80 space-y-1.5 mb-4">
              <li>• 4 planes Starter</li>
              <li>• 4 planes Pro</li>
              <li>• 2 planes Agencia</li>
            </ul>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-[#fafafa] dark:bg-black/30 border border-[#e0e0e0] dark:border-white/10 p-4 text-sm">
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
                <p className="mt-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Total primer mes: {formatCurrency(comboFirstMonth, starterCurrency)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-400/40 p-4 text-sm">
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
                <p className="mt-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Total mensual: {formatCurrency(comboMonthly, starterCurrency)}
                </p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-100/80 mt-1">
                  Mientras los clientes sigan activos durante {MONTHS_RECURRING} meses.
                </p>
              </div>
              {(starter.annual || pro.annual || agencia.annual) && (
                <div className="rounded-xl bg-[#f5f5f5] dark:bg-white/5 border border-[#e0e0e0] dark:border-white/10 p-4 text-sm">
                  <p className="font-semibold mb-1">Ingresos por planes anuales (15%)</p>
                  <p className="text-xs text-[#616161] dark:text-white/60 mb-2">
                    Comisión única por cada venta anual (sin recurrencia).
                  </p>
                  {starter.annual && (
                    <p>
                      Starter anual: 4 × {formatCurrency(starterAnnualCommission, starterCurrency)} ={" "}
                      <strong>
                        {formatCurrency(starterAnnualCommission * 4, starterCurrency)}
                      </strong>
                    </p>
                  )}
                  {pro.annual && (
                    <p>
                      Pro anual: 4 × {formatCurrency(proAnnualCommission, proCurrency)} ={" "}
                      <strong>{formatCurrency(proAnnualCommission * 4, proCurrency)}</strong>
                    </p>
                  )}
                  {agencia.annual && (
                    <p>
                      Agencia anual: 2 × {formatCurrency(agenciaAnnualCommission, agenciaCurrency)} ={" "}
                      <strong>
                        {formatCurrency(agenciaAnnualCommission * 2, agenciaCurrency)}
                      </strong>
                    </p>
                  )}
                  <p className="mt-2 font-semibold text-[#212121] dark:text-white">
                    Total anual (pago único): {formatCurrency(comboAnnual, starterCurrency)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e0e0] dark:border-white/10 bg-white dark:bg-white/5 p-6 text-sm text-[#424242] dark:text-white/85">
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
            <p className="text-xs text-[#757575] dark:text-white/60">
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
