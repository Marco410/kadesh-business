"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { CardElement } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import {
  SAAS_PLANS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type SaasPlansResponse,
  type SaasPlanItem,
  type PlanFeatureItem,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useSubscriptionPayment } from "./hooks/useSubscriptionPayment";
import EmptyCompanySection from "../EmptyCompanySection";

function formatPrice(cost: number, currency: string): string {
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

const inputBase =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-2.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

const cardElementOptionsLight = {
  style: {
    base: {
      fontSize: "16px",
      color: "#212121",
      "::placeholder": { color: "#9e9e9e" },
      iconColor: "#212121",
    },
    invalid: {
      color: "#b91c1c",
      iconColor: "#b91c1c",
    },
  },
  hidePostalCode: true,
};

const cardElementOptionsDark = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      "::placeholder": { color: "#9ca3af" },
      iconColor: "#ffffff",
    },
    invalid: {
      color: "#f87171",
      iconColor: "#f87171",
    },
  },
  hidePostalCode: true,
};

export default function SuscripcionSection() {
  const params = useParams();
  const id = params?.planId as string | undefined;
  const { resolvedTheme } = useTheme();
  const { user } = useUser();

  const cardElementOptions = useMemo(
    () =>
      resolvedTheme === "dark"
        ? cardElementOptionsDark
        : cardElementOptionsLight,
    [resolvedTheme],
  );

  const [cardName, setCardName] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { data, loading, error } =
    useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });

  const plan = id ? (data?.saasPlans?.find((p) => p.id === id) ?? null) : null;
  const stripeCustomerId = userData?.user?.stripeCustomerId;

  const { processSubscriptionPayment, loadingPayment, redirecting } =
    useSubscriptionPayment(user?.id, user?.email, stripeCustomerId);

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan?.active || !acceptTerms || !user?.email) return;
    const nameCard =
      cardName.trim() || [user.name, user.lastName].filter(Boolean).join(" ");
    await processSubscriptionPayment(plan, {
      nameCard: nameCard || "Tarjetahabiente",
      email: user.email,
      notes: notes.trim() || undefined,
    });
  };

  const companyId = userData?.user?.company?.id ?? null;

  if (!id) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Link
          href={Routes.panelPlans}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a planes
        </Link>
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 text-center">
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            Identificador de plan no válido.
          </p>
          <Link
            href={Routes.panelPlans}
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Link
          href={Routes.panelPlans}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a planes
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">
            {error
              ? "No se pudo cargar el plan. Intenta de nuevo."
              : "Plan no encontrado."}
          </p>
          <Link
            href={Routes.panelPlans}
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  const isActive = plan.active;

  if (!companyId) {
    return (
      <EmptyCompanySection
        userId={user?.id ?? ""}
        onSuccess={async () => {
          /*  await refetchUserCompany();
          await refreshUser(); */
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Link
        href={Routes.panelPlans}
        className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Volver a planes
      </Link>

      <section className="text-center">
        <h1 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Iniciar suscripción
        </h1>
        <p className="mt-1 text-[#616161] dark:text-[#b0b0b0]">
          Revisa el resumen del plan e ingresa tu método de pago.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Resumen del plan */}
        <div
          className={cn(
            "relative rounded-2xl border p-6 sm:p-8",
            "border-orange-500/50 dark:border-orange-500/50 bg-orange-500/5 dark:bg-orange-500/10",
          )}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
              {plan.name}
            </h2>
            {!isActive && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Este plan no está disponible para nuevas suscripciones.
              </p>
            )}
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
                {formatPrice(plan.cost, plan.currency)}
              </span>
              <span className="text-[#616161] dark:text-[#b0b0b0]">
                /{formatPeriod(plan.frequency)}
              </span>
            </div>
            {plan.leadLimit != null && (
              <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                Cada mes puedes extraer{" "}
                <strong className="text-[#212121] dark:text-[#e0e0e0]">
                  {plan.leadLimit}
                </strong>{" "}
                leads
              </p>
            )}
          </div>
          {plan.planFeatures != null && plan.planFeatures.length > 0 && (
            <ul className="mt-8 space-y-2">
              {plan.planFeatures
                .filter((f: PlanFeatureItem) => f.included)
                .map((f: PlanFeatureItem) => (
                  <li key={f.key} className="flex items-center gap-3 text-sm">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={20}
                      className="flex-shrink-0 text-orange-500 dark:text-orange-400"
                    />
                    <span className="text-[#212121] dark:text-[#e0e0e0]">
                      {f.name}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-6">
            <Link
              href={Routes.panelPlans}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Cambiar plan
            </Link>
          </div>
        </div>

        {/* Formulario método de pago */}
        <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#212121] dark:text-[#ffffff]">
            <span
              className="flex size-9 items-center justify-center rounded-lg bg-orange-500/15 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400"
              aria-hidden
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </span>
            Método de pago
          </h3>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Ingresa los datos de tu tarjeta para confirmar la suscripción.
          </p>

          <form onSubmit={handleConfirmSubscription} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="cardName"
                className="mb-1.5 block text-sm font-medium text-[#212121] dark:text-[#e0e0e0]"
              >
                Nombre en la tarjeta
              </label>
              <input
                id="cardName"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={
                  user
                    ? [user.name, user.lastName].filter(Boolean).join(" ") ||
                      "Juan Pérez"
                    : "Juan Pérez"
                }
                className={inputBase}
                autoComplete="cc-name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#212121] dark:text-[#e0e0e0]">
                Datos de la tarjeta
              </label>
              <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-sm font-medium text-[#212121] dark:text-[#e0e0e0]"
              >
                Notas{" "}
                <span className="text-[#9e9e9e] dark:text-[#666]">
                  (opcional)
                </span>
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Comentarios o referencia"
                className={inputBase}
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 size-4 rounded border-[#e0e0e0] text-orange-500 focus:ring-orange-500 dark:border-[#3a3a3a]"
              />
              <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Acepto los términos del plan y el cargo recurrente según la
                frecuencia seleccionada.
              </span>
            </label>

            <div className="flex flex-col gap-3 pt-2">
              {(loadingPayment || redirecting) && (
                <p className="text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                  {redirecting
                    ? "Redirigiendo a la confirmación…"
                    : "Procesando el pago…"}
                </p>
              )}
              <button
                type="submit"
                disabled={
                  !isActive ||
                  !acceptTerms ||
                  loadingPayment ||
                  redirecting ||
                  !user?.email
                }
                className={cn(
                  "w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
                  isActive && acceptTerms && user?.email && !redirecting
                    ? "bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
                    : "bg-[#9e9e9e] dark:bg-[#555]",
                )}
              >
                {redirecting
                  ? "Redirigiendo…"
                  : loadingPayment
                    ? "Procesando…"
                    : "Confirmar suscripción"}
              </button>
              <Link
                href={Routes.panelPlans}
                className="w-full rounded-xl border-2 border-[#e0e0e0] dark:border-[#3a3a3a] px-6 py-3 text-center text-sm font-semibold text-[#212121] dark:text-[#e0e0e0] transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
