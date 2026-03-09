"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
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

function formatPrice(cost: number, currency: string, frequency: string): string {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  });
  return formatter.format(cost);
}

function formatPeriod(frequency: string): string {
  const f = frequency?.toLowerCase();
  return f === "monthly" ? "mes" : f === "yearly" ? "año" : frequency || "";
}

function FeatureRow({ feature }: { feature: PlanFeatureItem }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0" aria-hidden>
        {feature.included ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={20}
            className="text-orange-500 dark:text-orange-400"
          />
        ) : (
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={20}
            className="text-red-500 dark:text-red-400"
          />
        )}
      </span>
      <span className="relative inline group/name">
        <span
          className="cursor-help text-sm text-[#616161] dark:text-[#b0b0b0] border-b border-dotted border-[#616161] dark:border-[#b0b0b0]"
          title={feature.description}
        >
          {feature.name}
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 bottom-full z-10 mb-1.5 max-w-[240px] rounded-lg bg-[#212121] dark:bg-[#2a2a2a] px-3 py-2 text-xs text-white dark:text-[#e0e0e0] shadow-lg opacity-0 transition-opacity duration-150 group-hover/name:opacity-100"
        >
          {feature.description}
        </span>
      </span>
    </li>
  );
}

function PlanCard({
  plan,
  onSubscribe,
  isCurrentPlan,
  isVertical = true,
}: {
  plan: SaasPlanItem;
  onSubscribe?: (plan: SaasPlanItem) => void;
  isCurrentPlan?: boolean;
  isVertical?: boolean;
}) {
  const isActive = plan.active;
  const highlighted = isCurrentPlan === true;

  const headerBlock = (
    <>
      <div className={isVertical ? "text-center" : "text-left"}>
        <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
          {plan.name}
        </h3>
        {!isActive && !isCurrentPlan && (
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            No disponible
          </span>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
            {formatPrice(plan.cost, plan.currency, plan.frequency)}
          </span>
          <span className="text-[#616161] dark:text-[#b0b0b0]">
            /{formatPeriod(plan.frequency)}
          </span>
        </div>
        {plan.leadLimit != null && (
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Hasta <strong className="text-[#212121] dark:text-[#e0e0e0]">{plan.leadLimit}</strong> leads/mes
          </p>
        )}
      </div>

      {plan.planFeatures != null && plan.planFeatures.length > 0 && (
        <ul className={isVertical ? "mt-8 space-y-3" : "space-y-3"}>
          {plan.planFeatures.map((f) => (
            <FeatureRow key={f.key} feature={f} />
          ))}
        </ul>
      )}

      {isActive && onSubscribe && plan.cost !== 0 && (
        <button
          type="button"
          onClick={() => onSubscribe(plan)}
          disabled={isCurrentPlan}
          className={cn(
            "mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
            highlighted
              ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              : "border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
            isCurrentPlan && "hover:bg-orange-500 dark:hover:bg-orange-500",
          )}
        >
          {isCurrentPlan ? "Plan actual" : "Iniciar suscripción"}
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
              {!isActive && !isCurrentPlan && (
                <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
                  No disponible
                </span>
              )}
              <div className="mt-4">
                <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
                  {formatPrice(plan.cost, plan.currency, plan.frequency)}
                </span>
                <span className="text-[#616161] dark:text-[#b0b0b0]">
                  /{formatPeriod(plan.frequency)}
                </span>
              </div>
              {plan.leadLimit != null && (
                <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Hasta <strong className="text-[#212121] dark:text-[#e0e0e0]">{plan.leadLimit}</strong> leads/mes
                </p>
              )}
              {plan.cost === 0 && (
                <p className="mt-2 text-sm rounded-full bg-green-500 px-4 py-1 text-xs font-bold text-white">
                  Prueba gratuita de 1 mes
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
                    : "border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
                  isCurrentPlan && "hover:bg-orange-500 dark:hover:bg-orange-500",
                )}
              >
                {isCurrentPlan ? "Plan actual" : "Iniciar suscripción"}
              </button>
            )}
          </div>
          {plan.planFeatures != null && plan.planFeatures.length > 0 && (
            <ul className="flex-1 min-w-0 space-y-3">
              {plan.planFeatures.map((f) => (
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
}

export default function PlansSection({
  hideBackLink = false,
  sectionTitle = "Planes y precios",
  sectionSubtitle = "Planes a la medida de tu empresa",
}: PlansSectionProps = {}) {
  const router = useRouter();
  const { subscription } = useSubscription();
  const { data, loading, error } = useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);

  const plans = data?.saasPlans ?? [];
  const currentPlanName = subscription?.planName?.trim() ?? null;

  const freePlan = plans.find((p) => p.cost === 0);
  const paidPlans = plans.filter((p) => p.cost > 0);

  const handleSubscribe = (plan: SaasPlanItem) => {
    router.push(Routes.profilePlanSubscribe(plan.id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {!hideBackLink && (
        <div className="mb-6">
          <Link
            href={`${Routes.profile}?tab=ventas`}
            className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
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
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...paidPlans]
                .sort((a, b) => a.cost - b.cost)
                .map((plan) => {
                  const isCurrentPlan =
                    currentPlanName != null &&
                    plan.name.trim().toLowerCase() === currentPlanName.toLowerCase();
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onSubscribe={plan.active ? handleSubscribe : undefined}
                      isCurrentPlan={isCurrentPlan}
                      isVertical={true}
                    />
                  );
                })}
            </div>
          )}

          {freePlan && paidPlans.length > 0 && (
            <div className="mx-auto max-w-5xl">
              <PlanCard
                plan={freePlan}
                onSubscribe={freePlan.active ? handleSubscribe : undefined}
                isCurrentPlan={
                  currentPlanName != null &&
                  freePlan.name.trim().toLowerCase() === currentPlanName.toLowerCase()
                }
                isVertical={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
