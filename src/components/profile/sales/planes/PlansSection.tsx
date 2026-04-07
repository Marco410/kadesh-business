"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  SAAS_PLANS_QUERY,
  type SaasPlansResponse,
  type SaasPlanItem,
  type PlanFeatureItem,
} from "kadesh/components/profile/sales/queries";
import { useSubscription } from "kadesh/components/profile/sales/SubscriptionContext";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useUser } from "kadesh/utils/UserContext";

function formatPrice(
  cost: number,
  currency: string,
  frequency: string,
): string {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  });
  return formatter.format(cost);
}

function formatPeriod(frequency: string): string {
  const f = frequency?.toLowerCase();
  return f === "monthly" ? "mes" : f === "annual" ? "año" : frequency || "";
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

function displayTierNameFromPlanName(name: string): string {
  return name.trim().replace(/\s+anual\s*$/i, "").trim();
}

type SaasPlanPair = {
  baseKey: string;
  displayName: string;
  monthly: SaasPlanItem | null;
  annual: SaasPlanItem | null;
};

function groupPaidPlansIntoPairs(paidPlans: SaasPlanItem[]): SaasPlanPair[] {
  const map = new Map<
    string,
    {
      monthly?: SaasPlanItem;
      annual?: SaasPlanItem;
      displayName?: string;
    }
  >();

  for (const p of paidPlans) {
    const key = normalizePlanBaseKey(p.name);
    const entry = map.get(key) ?? {};
    if (isMonthlyFrequency(p.frequency)) {
      entry.monthly = p;
      entry.displayName = entry.displayName ?? displayTierNameFromPlanName(p.name);
    } else if (isAnnualFrequency(p.frequency)) {
      entry.annual = p;
      entry.displayName = entry.displayName ?? displayTierNameFromPlanName(p.name);
    } else {
      entry.monthly = entry.monthly ?? p;
      entry.displayName = entry.displayName ?? displayTierNameFromPlanName(p.name);
    }
    map.set(key, entry);
  }

  return [...map.entries()].map(([baseKey, v]) => ({
    baseKey,
    displayName: v.displayName ?? baseKey,
    monthly: v.monthly ?? null,
    annual: v.annual ?? null,
  }));
}

function sortKeyForPair(pair: SaasPlanPair): number {
  if (pair.monthly) return pair.monthly.cost;
  if (pair.annual) return pair.annual.cost / 12;
  return 0;
}

function annualSavingsVsMonthly(
  monthly: SaasPlanItem | null,
  annual: SaasPlanItem | null,
): number | null {
  if (!monthly || !annual) return null;
  if (monthly.cost <= 0) return null;
  return monthly.cost * 12 - annual.cost;
}

function isCurrentPlanForPair(
  currentPlanName: string | null,
  pair: SaasPlanPair,
): boolean {
  if (!currentPlanName) return false;
  const cur = currentPlanName.trim().toLowerCase();
  return (
    pair.monthly?.name.trim().toLowerCase() === cur ||
    pair.annual?.name.trim().toLowerCase() === cur
  );
}

function getPriceAriaLabel(plan: SaasPlanItem): string {
  const monthly = formatPrice(plan.cost, plan.currency, plan.frequency);
  return `Precio del plan ${plan.name} de Kadesh: ${monthly} al ${formatPeriod(plan.frequency)} en pesos mexicanos`;
}

function formatCostPerLead(
  cost: number,
  leadLimit: number | null,
): string | null {
  if (!leadLimit || leadLimit <= 0) return null;
  const perLead = cost / leadLimit;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(perLead);
}

const PLAN_PERSONAS: Record<string, string> = {
  starter: "Para vendedores independientes y equipos de 1–2 personas",
  pro: "Para equipos de ventas en crecimiento con múltiples vendedores",
  agencia: "Para agencias con múltiples carteras de clientes",
};

const PLAN_CTA: Record<string, string> = {
  starter: "Empezar con Starter",
  pro: "Empezar con Pro",
  agencia: "Contactar para Agencia",
};

function getPlanPersona(name: string): string | null {
  return PLAN_PERSONAS[name.trim().toLowerCase()] ?? null;
}

function getPlanPersonaForTier(baseKey: string, displayName: string): string | null {
  return PLAN_PERSONAS[baseKey] ?? getPlanPersona(displayName);
}

type BillingPeriod = "monthly" | "annual";

function getPlanCta(name: string, isCurrentPlan: boolean): string {
  if (isCurrentPlan) return "Plan actual";
  return PLAN_CTA[name.trim().toLowerCase()] ?? "Iniciar suscripción";
}

function FeatureRow({ feature }: { feature: PlanFeatureItem }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <li className={cn("flex items-start gap-3", open && "relative z-20")}>
      <span className="mt-0.5 flex-shrink-0" aria-hidden>
        {feature.included ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={20}
            className="text-orange-700 dark:text-orange-400"
          />
        ) : (
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={20}
            className="text-red-500 dark:text-red-400"
          />
        )}
      </span>
      <span ref={wrapperRef} className="relative inline group/name">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="cursor-help text-left text-sm text-[#616161] dark:text-[#b0b0b0] border-b border-dotted border-[#616161] dark:border-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#e0e0e0] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#121212] rounded-sm"
          title={feature.description}
          aria-expanded={open}
          aria-describedby={open ? tooltipId : undefined}
        >
          {feature.name}
        </button>
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute left-0 bottom-full z-10 mb-1.5 max-w-[240px] rounded-lg bg-[#212121] dark:bg-[#2a2a2a] px-3 py-2 text-xs text-white dark:text-[#e0e0e0] shadow-lg transition-opacity duration-150",
            "opacity-0 group-hover/name:opacity-100",
            open && "opacity-100 pointer-events-none",
          )}
        >
          {feature.description}
        </span>
      </span>
    </li>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (next: BillingPeriod) => void;
}) {
  const segmentClass = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212]",
      active
        ? "bg-orange-500 text-white shadow-sm"
        : "text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white",
    );

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="Periodo de facturación"
    >
      <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-[#e0e0e0] bg-[#f5f5f5] p-1 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
        <button
          type="button"
          className={segmentClass(value === "monthly")}
          onClick={() => onChange("monthly")}
          aria-pressed={value === "monthly"}
        >
          Mensual
        </button>
        <span className="flex items-center gap-2 pr-1">
          <button
            type="button"
            className={segmentClass(value === "annual")}
            onClick={() => onChange("annual")}
            aria-pressed={value === "annual"}
          >
            Anual
          </button>
        </span>
      </div>
      { value === "annual" && (
        <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Ahorra 2 meses 🎁
        </span>
      )}
    </div>
  );
}

function PairedPlanCard({
  pair,
  billingPeriod,
  onSubscribe,
  isCurrentPlan,
  showBtnStart = true,
}: {
  pair: SaasPlanPair;
  billingPeriod: BillingPeriod;
  onSubscribe?: (plan: SaasPlanItem) => void;
  isCurrentPlan?: boolean;
  showBtnStart?: boolean;
}) {
  const { user } = useUser();
  const { monthly, annual, displayName, baseKey } = pair;

  const planForMeta = annual ?? monthly;
  const isActive = planForMeta?.active ?? false;
  const highlighted = isCurrentPlan === true;
  const bestSeller = monthly?.bestSeller === true || annual?.bestSeller === true;

  const persona = getPlanPersonaForTier(baseKey, displayName);
  const includedSource = annual ?? monthly;
  const includedFeatures =
    includedSource?.planFeatures?.filter((f) => f.included) ?? [];

  const planToSubscribe: SaasPlanItem | null =
    billingPeriod === "annual" ? annual : monthly;
  const canSubscribe =
    planToSubscribe != null && planToSubscribe.active && planToSubscribe.cost > 0;

  const savings = annualSavingsVsMonthly(monthly, annual);

  const leadLimit = planToSubscribe?.leadLimit ?? monthly?.leadLimit ?? annual?.leadLimit;

  let mainPrice = 0;
  let currency = planForMeta?.currency ?? "MXN";
  let priceAria = "";
  let annualDisclaimer: string | null = null;

  if (billingPeriod === "monthly") {
    if (monthly) {
      mainPrice = monthly.cost;
      currency = monthly.currency;
      priceAria = `Precio del plan ${displayName} de Kadesh: ${formatPrice(monthly.cost, monthly.currency, monthly.frequency)} al mes en pesos mexicanos`;
    }
  } else {
    if (annual) {
      mainPrice = annual.cost / 12;
      currency = annual.currency;
      priceAria = `Equivalente mensual del plan ${displayName} con pago anual: ${formatPrice(mainPrice, annual.currency, "monthly")} al mes; cobro anual ${formatPrice(annual.cost, annual.currency, annual.frequency)}`;
      const payOnce = formatPrice(annual.cost, annual.currency, annual.frequency);
      if (savings != null && savings > 0) {
        const saveFmt = formatPrice(savings, annual.currency, annual.frequency);
        annualDisclaimer = `Cobrado anualmente en un solo pago de ${payOnce}. Ahorras ${saveFmt} frente a 12 meses al precio mensual.`;
      } else {
        annualDisclaimer = `Cobrado anualmente en un solo pago de ${payOnce}.`;
      }
    }
  }

  const missingPlanCopy =
    billingPeriod === "monthly"
      ? "Facturación mensual no disponible para este plan."
      : "Facturación anual no disponible para este plan.";

  const effectiveCostForPerLead =
    billingPeriod === "annual" && annual
      ? annual.cost / 12
      : monthly?.cost ?? annual?.cost ?? 0;
  const costPerLead = formatCostPerLead(effectiveCostForPerLead, leadLimit ?? null);

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 sm:p-8",
        highlighted
          ? "border-orange-500 dark:border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]",
      )}
    >
      {bestSeller && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
          MÁS VENDIDO
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">
            Tu plan actual
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
          {displayName}
        </h3>
        {persona && (
          <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
            {persona}
          </p>
        )}
        {!isActive && !isCurrentPlan && (
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            No disponible
          </span>
        )}

        <div className="mt-4 min-h-[4.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${billingPeriod}-${displayName}-${mainPrice}-${annual?.cost ?? 0}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {((billingPeriod === "monthly" && monthly) ||
                (billingPeriod === "annual" && annual)) && (
                <p aria-label={priceAria}>
                  <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
                    {formatPrice(mainPrice, currency, "monthly")}
                  </span>
                  <span className="ml-1 text-xs font-medium text-[#616161] dark:text-[#757575]">
                    {currency}
                  </span>
                  <span className="text-[#616161] dark:text-[#b0b0b0]"> / mes</span>
                </p>
              )}
              {((billingPeriod === "monthly" && !monthly) ||
                (billingPeriod === "annual" && !annual)) && (
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  {missingPlanCopy}
                </p>
              )}
              {billingPeriod === "annual" && annual && annualDisclaimer && (
                <p className="mx-auto mt-2 max-w-[280px] text-xs leading-relaxed text-[#616161] dark:text-[#8a8a8a]">
                  {annualDisclaimer}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {leadLimit != null && (
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cada mes puedes extraer{" "}
            <strong className="text-[#212121] dark:text-[#e0e0e0]">
              {leadLimit}
            </strong>{" "}
            leads
          </p>
        )}
        {costPerLead && (
          <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
            Solo {costPerLead} {currency} por lead
          </p>
        )}
      </div>

      {includedFeatures.length > 0 && (
        <ul className="mt-8 space-y-3">
          {includedFeatures.map((f) => (
            <FeatureRow key={f.key} feature={f} />
          ))}
        </ul>
      )}

      {canSubscribe && onSubscribe && user?.id && showBtnStart && (
        <button
          type="button"
          onClick={() => planToSubscribe && onSubscribe(planToSubscribe)}
          disabled={isCurrentPlan}
          className={cn(
            "mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
            highlighted
              ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              : "border-2 border-orange-600 text-orange-700 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
            isCurrentPlan && "hover:bg-orange-500 dark:hover:bg-orange-500",
          )}
        >
          {getPlanCta(displayName, isCurrentPlan ?? false)}
        </button>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onSubscribe,
  isCurrentPlan,
  isVertical = true,
  showBtnStart = true,
}: {
  plan: SaasPlanItem;
  onSubscribe?: (plan: SaasPlanItem) => void;
  isCurrentPlan?: boolean;
  isVertical?: boolean;
  showBtnStart?: boolean;
}) {
  const isActive = plan.active;
  const highlighted = isCurrentPlan === true;
  const { user } = useUser();

  const persona = getPlanPersona(plan.name);
  const costPerLead = formatCostPerLead(plan.cost, plan.leadLimit);
  const includedFeatures = plan.planFeatures?.filter((f) => f.included) ?? [];

  const headerBlock = (
    <>
      <div className={isVertical ? "text-center" : "text-left"}>
        <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
          {plan.name}
        </h3>
        {persona && (
          <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
            {persona}
          </p>
        )}
        {!isActive && !isCurrentPlan && (
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            No disponible
          </span>
        )}
        <p className="mt-4" aria-label={getPriceAriaLabel(plan)}>
          <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
            {formatPrice(plan.cost, plan.currency, plan.frequency)}
          </span>
          <span className="text-xs font-medium text-[#616161] dark:text-[#757575] ml-1">
            {plan.currency}
          </span>
          <span className="text-[#616161] dark:text-[#b0b0b0]">
            /{formatPeriod(plan.frequency)}
          </span>
        </p>
        {plan.leadLimit != null && (
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cada mes puedes extraer{" "}
            <strong className="text-[#212121] dark:text-[#e0e0e0]">
              {plan.leadLimit}
            </strong>{" "}
            leads
          </p>
        )}
        {costPerLead && (
          <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
            Solo {costPerLead} {plan.currency} por lead
          </p>
        )}
      </div>

      {includedFeatures.length > 0 && (
        <ul className={isVertical ? "mt-8 space-y-3" : "space-y-3"}>
          {includedFeatures.map((f) => (
            <FeatureRow key={f.key} feature={f} />
          ))}
        </ul>
      )}

      {isActive && onSubscribe && plan.cost !== 0 && user?.id && showBtnStart && (
        <button
          type="button"
          onClick={() => onSubscribe(plan)}
          disabled={isCurrentPlan}
          className={cn(
            "mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
            highlighted
              ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              : "border-2 border-orange-600 text-orange-700 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
            isCurrentPlan && "hover:bg-orange-500 dark:hover:bg-orange-500",
          )}
        >
          {getPlanCta(plan.name, isCurrentPlan ?? false)}
        </button>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 sm:p-8",
        highlighted
          ? "border-orange-500 dark:border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]",
      )}
    >
      {plan.bestSeller === true && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
          MÁS VENDIDO
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">
            Tu plan actual
          </span>
        </div>
      )}

      {isVertical ? (
        headerBlock
      ) : (
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="flex-1 shrink-0">
            <div className="text-left">
              <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
                {plan.name}
              </h3>
              {persona && (
                <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  {persona}
                </p>
              )}
              {!isActive && !isCurrentPlan && (
                <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
                  No disponible
                </span>
              )}
              <p className="mt-4" aria-label={getPriceAriaLabel(plan)}>
                <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
                  {formatPrice(plan.cost, plan.currency, plan.frequency)}
                </span>
                <span className="text-xs font-medium text-[#616161] dark:text-[#757575] ml-1">
                  {plan.currency}
                </span>
                <span className="text-[#616161] dark:text-[#b0b0b0]">
                  /{formatPeriod(plan.frequency)}
                </span>
              </p>
              {plan.leadLimit != null && plan.cost !== 0 && (
                <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Cada mes puedes extraer{" "}
                  <strong className="text-[#212121] dark:text-[#e0e0e0]">
                    {plan.leadLimit}
                  </strong>{" "}
                  leads/mes
                </p>
              )}
              {costPerLead && (
                <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
                  Solo {costPerLead} {plan.currency} por lead
                </p>
              )}
              {plan.cost === 0 && (
                <p className="mt-2 inline-block rounded-full bg-green-500 px-4 py-1 text-sm font-bold text-white">
                  Prueba gratuita de 7 días
                </p>
              )}
            </div>

            {isActive && onSubscribe && plan.cost !== 0 && (
              <button
                type="button"
                onClick={() => onSubscribe(plan)}
                disabled={isCurrentPlan}
                className={cn(
                  "mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
                  highlighted
                    ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
                    : "border-2 border-orange-600 text-orange-700 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
                  isCurrentPlan &&
                    "hover:bg-orange-500 dark:hover:bg-orange-500",
                )}
              >
                {getPlanCta(plan.name, isCurrentPlan ?? false)}
              </button>
            )}
          </div>
          {includedFeatures.length > 0 && (
            <ul className="flex-1 min-w-0 space-y-3">
              {includedFeatures.map((f) => (
                <FeatureRow key={f.key} feature={f} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export interface PlansSectionProps {
  /** Hide "Volver a Ventas" link (e.g. on landing page). */
  hideBackLink?: boolean;
  /** Override section title. */
  sectionTitle?: string;
  /** Override section subtitle. */
  sectionSubtitle?: string;
  showBtnStart?: boolean;
}

export default function PlansSection({
  hideBackLink = false,
  sectionTitle = "Planes y precios",
  sectionSubtitle = "Planes a la medida de tu empresa",
  showBtnStart = true,
}: PlansSectionProps = {}) {
  const router = useRouter();
  const { subscription } = useSubscription();
  const { data, loading, error } =
    useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

  const plans = data?.saasPlans ?? [];
  const currentPlanName = subscription?.planName?.trim() ?? null;

  const freePlan = plans.find((p) => p.cost === 0);
  const paidPlans = plans.filter((p) => p.cost > 0);
  const planPairs = groupPaidPlansIntoPairs(paidPlans).sort(
    (a, b) => sortKeyForPair(a) - sortKeyForPair(b),
  );

  const handleSubscribe = (plan: SaasPlanItem) => {
    router.push(Routes.panelPlanSubscribe(plan.id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {!hideBackLink && (
        <div className="mb-6">
          <Link
            href={`${Routes.panel}?tab=ventas`}
            className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-700 dark:hover:text-orange-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Volver a Ventas
          </Link>
        </div>
      )}

      <section id="planes" className="text-center">
        <h1 className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
          {sectionTitle}
        </h1>
        <p className="mt-2 text-[#616161] dark:text-[#b0b0b0]">
          {sectionSubtitle}
        </p>
      </section>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          No se pudieron cargar los planes. Intenta de nuevo más tarde.
        </div>
      )}

      {plans.length === 0 && !loading && (
        <div className="rounded-2xl border border-[#e0e0e0] bg-[#f5f5f5] p-8 text-center text-[#616161] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
          No hay planes disponibles.
        </div>
      )}

      {plans.length > 0 && (
        <div className="space-y-8">
          {paidPlans.length > 0 && (
            <>
              <div className="flex justify-center pt-2">
                <BillingToggle
                  value={billingPeriod}
                  onChange={setBillingPeriod}
                />
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {planPairs.map((pair) => (
                  <PairedPlanCard
                    key={pair.baseKey}
                    pair={pair}
                    billingPeriod={billingPeriod}
                    onSubscribe={handleSubscribe}
                    isCurrentPlan={isCurrentPlanForPair(currentPlanName, pair)}
                    showBtnStart={showBtnStart}
                  />
                ))}
              </div>
            </>
          )}

          {freePlan && paidPlans.length > 0 && (
            <div className="mx-auto max-w-5xl">
              <PlanCard
                plan={freePlan}
                onSubscribe={freePlan.active ? handleSubscribe : undefined}
                isCurrentPlan={
                  currentPlanName != null &&
                  freePlan.name.trim().toLowerCase() ===
                    currentPlanName.toLowerCase()
                }
                isVertical={false}
                showBtnStart={showBtnStart}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
