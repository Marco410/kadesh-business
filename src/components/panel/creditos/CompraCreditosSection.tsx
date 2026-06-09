"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { CardElement } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import {
  SAAS_CREDITS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type SaasCreditsResponse,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import EmptyCompanySection from "kadesh/components/profile/sales/EmptyCompanySection";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useCreditPurchasePayment } from "./hooks/useCreditPurchasePayment";

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

function formatCredits(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

const CREDIT_SUMMARY_FEATURES = [
  "Créditos extra para extracción B2B",
  "Se suman a tu cuota del mes actual",
  "Pago único, sin suscripción",
] as const;

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

export default function CompraCreditosSection() {
  const params = useParams();
  const id = params?.creditId as string | undefined;
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

  const { data, loading, error } = useQuery<SaasCreditsResponse>(SAAS_CREDITS_QUERY);
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });

  const credit = id
    ? (data?.saasCredits?.find((item) => item.id === id) ?? null)
    : null;
  const stripeCustomerId = userData?.user?.stripeCustomerId;
  const companyId = userData?.user?.company?.id ?? null;

  const { processCreditPurchasePayment, loadingPayment, redirecting } =
    useCreditPurchasePayment(user?.id, user?.email, stripeCustomerId);

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credit?.active || !acceptTerms || !user?.email) return;
    const nameCard =
      cardName.trim() || [user.name, user.lastName].filter(Boolean).join(" ");
    await processCreditPurchasePayment(credit, {
      nameCard: nameCard || "Tarjetahabiente",
      email: user.email,
      notes: notes.trim() || undefined,
    });
  };

  if (!id) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href={Routes.panelCredits}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a créditos
        </Link>
        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 text-center dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            Identificador de paquete no válido.
          </p>
          <Link
            href={Routes.panelCredits}
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Ver paquetes
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

  if (error || !credit) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href={Routes.panelCredits}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a créditos
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">
            {error
              ? "No se pudo cargar el paquete. Intenta de nuevo."
              : "Paquete no encontrado."}
          </p>
          <Link
            href={Routes.panelCredits}
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Ver paquetes
          </Link>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <EmptyCompanySection
        userId={user?.id ?? ""}
        onSuccess={async () => {}}
      />
    );
  }

  const isActive = credit.active;
  const showOldPrice =
    credit.costOld != null && credit.costOld > credit.cost;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <Link
        href={Routes.panelCredits}
        className="inline-flex items-center gap-1.5 text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] dark:hover:text-orange-400"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Volver a créditos
      </Link>

      <section className="text-center">
        <h1 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Comprar créditos extra
        </h1>
        <p className="mt-1 text-[#616161] dark:text-[#b0b0b0]">
          Revisa el resumen del paquete e ingresa tu método de pago.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div
          className={cn(
            "relative rounded-2xl border p-6 sm:p-8",
            credit.bestSeller
              ? "border-orange-500/50 bg-orange-500/5 dark:border-orange-500/50 dark:bg-orange-500/10"
              : "border-orange-500/50 bg-orange-500/5 dark:border-orange-500/50 dark:bg-orange-500/10",
          )}
        >
          {credit.bestSeller && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
              MÁS VENDIDO
            </div>
          )}

          <div className="text-center">
            <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
              {credit.name}
            </h2>
            {!isActive && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Este paquete no está disponible para compra.
              </p>
            )}
            <div className="mt-4 flex flex-col items-center gap-1">
              {showOldPrice && (
                <span className="text-lg font-medium tabular-nums text-[#9a9a9a] line-through decoration-1 dark:text-[#6a6a6a]">
                  {formatPrice(credit.costOld!, credit.currency)}
                </span>
              )}
              <p className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                <span className="text-3xl font-bold tabular-nums text-[#212121] dark:text-[#ffffff]">
                  {formatPrice(credit.cost, credit.currency)}
                </span>
                <span className="shrink-0 text-xs font-medium text-[#616161] dark:text-[#757575]">
                  {credit.currency}
                </span>
                <span className="text-[#616161] dark:text-[#b0b0b0]">
                  / {formatPeriod(credit.frequency)}
                </span>
              </p>
            </div>
            <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Recibes{" "}
              <strong className="text-[#212121] dark:text-[#e0e0e0]">
                {formatCredits(credit.creditsToAdd)}
              </strong>{" "}
              créditos extra para extraer leads
            </p>
          </div>

          <ul className="mt-8 space-y-2">
            {CREDIT_SUMMARY_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={20}
                  className="shrink-0 text-orange-500 dark:text-orange-400"
                />
                <span className="text-[#212121] dark:text-[#e0e0e0]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href={Routes.panelCredits}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Cambiar paquete
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#212121] dark:text-[#ffffff]">
            <span
              className="flex size-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
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
            Ingresa los datos de tu tarjeta para confirmar la compra.
          </p>

          <form onSubmit={handleConfirmPurchase} className="mt-6 space-y-4">
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
              <div className="rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-orange-500 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
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
                Acepto los términos y autorizo el cargo único por este paquete
                de créditos.
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
                    : "Confirmar compra"}
              </button>
              <Link
                href={Routes.panelCredits}
                className="w-full rounded-xl border-2 border-[#e0e0e0] px-6 py-3 text-center text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
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
