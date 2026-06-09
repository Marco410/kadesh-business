"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  SAAS_CREDITS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  UserCompanyCategoriesResponse,
  UserCompanyCategoriesVariables,
  type SaasCreditItem,
  type SaasCreditsResponse,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { HoverTooltip, SupportContactSection } from "kadesh/components/shared";
import { cn } from "kadesh/utils/cn";
import { useUser } from "kadesh/utils/UserContext";
import CurrentPlanSection from "kadesh/components/profile/sales/CurrentPlanSection";
import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";

function formatPrice(cost: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(cost);
}

function formatPeriod(frequency: string): string {
  const f = frequency?.toLowerCase();
  if (f === "once") return "pago único";
  if (f === "monthly" || f === "month") return "mes";
  if (f === "annual" || f === "yearly" || f === "year") return "año";
  return frequency || "";
}

function getCreditPriceAriaLabel(credit: SaasCreditItem): string {
  const price = formatPrice(credit.cost, credit.currency);
  const period = formatPeriod(credit.frequency);
  if (credit.costOld != null && credit.costOld > credit.cost) {
    const oldPrice = formatPrice(credit.costOld, credit.currency);
    return `Precio del paquete ${credit.name}: antes ${oldPrice}, ahora ${price} (${period})`;
  }
  return `Precio del paquete ${credit.name}: ${price} (${period})`;
}

function formatCredits(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

function formatCostPerCredit(cost: number, creditsToAdd: number): string | null {
  if (!creditsToAdd || creditsToAdd <= 0) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost / creditsToAdd);
}

const CREDIT_PACKAGE_PERSONAS: Record<string, string> = {
  "recarga básica": "Ideal para completar tu cuota del mes",
  "recarga crecimiento": "El paquete más popular para equipos activos",
  "recarga escala": "Para campañas de prospección a gran volumen",
};

const CREDIT_PACKAGE_FEATURES = [
  {
    key: "extra-credits",
    name: "Créditos extra para extracción B2B",
    description:
      "Cada crédito te permite sincronizar un lead nuevo desde Google Maps y 5 créditos te permiten extraer leads de LinkedIn.",
  },
  {
    key: "monthly-quota",
    name: "Se suman a tu cuota del mes actual",
    description:
      "Los créditos comprados se agregan sobre el límite incluido en tu plan.",
  },
  {
    key: "one-time",
    name: "Pago único, sin suscripción",
    description:
      "Compra puntual sin renovación automática ni cargos recurrentes.",
  },
  {
    key: "accumulable",
    name: "Acumulables en el tiempo",
    description:
      "Los créditos comprados si no los usas en el mes, se acumulan para el mes siguiente.",
  },
] as const;

function getCreditPersona(slug: string): string | null {
  return CREDIT_PACKAGE_PERSONAS[slug.trim().toLowerCase()] ?? null;
}

function CreditPriceLine({
  price,
  oldPrice,
  currency,
  periodLabel,
  ariaLabel,
}: {
  price: number;
  oldPrice?: number | null;
  currency: string;
  periodLabel: string;
  ariaLabel?: string;
}) {
  const showOldPrice = oldPrice != null && oldPrice > price;

  return (
    <div
      aria-label={ariaLabel}
      className="flex flex-col items-center gap-1"
    >
      {showOldPrice && (
        <span className="text-lg font-medium tabular-nums text-[#9a9a9a] line-through decoration-1 dark:text-[#6a6a6a]">
          {formatPrice(oldPrice, currency)}
        </span>
      )}
      <p className="flex items-baseline justify-center gap-1 whitespace-nowrap">
        <span className="text-4xl font-bold tabular-nums tracking-tight text-[#212121] dark:text-[#ffffff]">
          {formatPrice(price, currency)}
        </span>
        <span className="shrink-0 text-sm font-medium text-[#616161] dark:text-[#757575]">
          {currency}
        </span>
        <span className="shrink-0 text-sm text-[#616161] dark:text-[#b0b0b0]">
          {periodLabel}
        </span>
      </p>
    </div>
  );
}

function CreditFeatureRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <li className="group/feature relative flex items-start gap-3 hover:z-20 focus-within:z-20">
      <span className="mt-0.5 shrink-0" aria-hidden>
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={20}
          className="text-orange-700 dark:text-orange-400"
        />
      </span>
      <HoverTooltip label={description} className="max-w-full">
        <span className="cursor-help border-b border-dotted border-[#616161] text-left text-sm text-[#616161] dark:border-[#b0b0b0] dark:text-[#b0b0b0]">
          {name}
        </span>
      </HoverTooltip>
    </li>
  );
}

function CreditPackageCard({
  credit,
  onPurchase,
  showBtnStart = true,
}: {
  credit: SaasCreditItem;
  onPurchase: (credit: SaasCreditItem) => void;
  showBtnStart?: boolean;
}) {
  const { user } = useUser();
  const persona = getCreditPersona(credit.slug);
  const costPerCredit = formatCostPerCredit(credit.cost, credit.creditsToAdd);
  const canPurchase =
    credit.active && credit.cost > 0 && Boolean(credit.stripePriceId);

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 sm:p-8",
        credit.bestSeller
          ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10 dark:border-orange-500 dark:bg-orange-500/10"
          : "border-[#e0e0e0] bg-white dark:border-[#3a3a3a] dark:bg-[#1e1e1e]",
      )}
    >
      {credit.bestSeller && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
          MÁS VENDIDO
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
          {credit.name}
        </h3>
        {persona && (
          <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
            {persona}
          </p>
        )}
        {!credit.active && (
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            No disponible
          </span>
        )}

        <div className="mt-4 min-h-[5.5rem]">
          <CreditPriceLine
            price={credit.cost}
            oldPrice={credit.costOld}
            currency={credit.currency}
            periodLabel={`/ ${formatPeriod(credit.frequency)}`}
            ariaLabel={getCreditPriceAriaLabel(credit)}
          />
        </div>

        <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Recibe{" "}
          <strong className="text-[#212121] dark:text-[#e0e0e0]">
            {formatCredits(credit.creditsToAdd)}
          </strong>{" "}
          créditos extra para extraer leads
        </p>
        {costPerCredit && (
          <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-400">
            Solo {costPerCredit} {credit.currency} por crédito
          </p>
        )}
      </div>

      <ul className="mt-8 space-y-3">
        {CREDIT_PACKAGE_FEATURES.map((feature) => (
          <CreditFeatureRow
            key={feature.key}
            name={feature.name}
            description={feature.description}
          />
        ))}
      </ul>

      {canPurchase && user?.id && showBtnStart && (
        <button
          type="button"
          onClick={() => onPurchase(credit)}
          className={cn(
            "mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]",
            credit.bestSeller
              ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              : "border-2 border-orange-600 text-orange-700 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
          )}
        >
          Comprar paquete
        </button>
      )}
    </div>
  );
}

export interface CreditsSectionProps {
  hideBackLink?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
  sectionHeadingLevel?: "h1" | "h2";
  sectionTitleId?: string;
  showBtnStart?: boolean;
  onPurchase?: (credit: SaasCreditItem) => void;
}

export default function CreditsSection({
  hideBackLink = false,
  sectionTitle = "Créditos extra",
  sectionSubtitle = "Recarga créditos adicionales para seguir extrayendo leads B2B",
  sectionHeadingLevel = "h1",
  sectionTitleId,
  showBtnStart = true,
  onPurchase,
}: CreditsSectionProps = {}) {
  const router = useRouter();
  const { user } = useUser();
  const { data, loading, error } = useQuery<SaasCreditsResponse>(SAAS_CREDITS_QUERY);
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });
  
  const handlePurchase =
    onPurchase ??
    ((credit: SaasCreditItem) => {
      router.push(Routes.panelCreditPurchase(credit.id));
    });

  const credits = (data?.saasCredits ?? [])
    .filter((credit) => credit.active)
    .sort((a, b) => a.creditsToAdd - b.creditsToAdd);

  return (
    <SubscriptionProvider companyId={userData?.user?.company?.id ?? null}>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {!hideBackLink && (
          <div className="mb-6">
            <Link
              href={Routes.panel}
              className="inline-flex items-center gap-1.5 text-sm text-[#616161] hover:text-orange-700 dark:text-[#b0b0b0] dark:hover:text-orange-400"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Volver al panel
            </Link>
          </div>
        )}

        <section className="text-center" aria-labelledby={sectionTitleId}>
          {sectionHeadingLevel === "h2" ? (
            <h2
              id={sectionTitleId}
              className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]"
            >
              {sectionTitle}
            </h2>
          ) : (
            <h1
              id={sectionTitleId}
              className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]"
            >
              {sectionTitle}
            </h1>
          )}
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
            No se pudieron cargar los paquetes de créditos. Intenta de nuevo más tarde.
          </div>
        )}

        {credits.length === 0 && !loading && (
          <div className="rounded-2xl border border-[#e0e0e0] bg-[#f5f5f5] p-8 text-center text-[#616161] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
            No hay paquetes de créditos disponibles.
          </div>
        )}

        {credits.length > 0 && (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((credit) => (
              <CreditPackageCard
                key={credit.id}
                credit={credit}
                onPurchase={handlePurchase}
                showBtnStart={showBtnStart}
              />
            ))}
          </div>
        )}

        <CurrentPlanSection />
        <SupportContactSection
          whatsappMessage="Hola KADESH, tengo una consulta sobre mis créditos extra."
          emailSubject="Consulta sobre créditos extra — KADESH"
        />
      </div>
    </SubscriptionProvider>
  );
}
