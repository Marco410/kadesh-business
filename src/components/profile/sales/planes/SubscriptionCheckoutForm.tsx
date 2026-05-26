"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import type { SaasPlanItem } from "kadesh/components/profile/sales/queries";
import { useSubscriptionPayment } from "./hooks/useSubscriptionPayment";

const inputBase =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-2.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

interface SubscriptionCheckoutFormProps {
  plan: SaasPlanItem;
  userEmail: string;
  userName: string;
  stripeSubscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
  isActive: boolean;
}

export default function SubscriptionCheckoutForm({
  plan,
  userEmail,
  userName,
  stripeSubscriptionId,
  stripePaymentIntentId,
  isActive,
}: SubscriptionCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardName, setCardName] = useState(userName);
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    processSubscriptionPayment,
    loadingPayment,
    redirecting,
    paymentAlreadyConfirmed,
  } = useSubscriptionPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive || !acceptTerms) return;

    const nameCard = cardName.trim() || userName || "Tarjetahabiente";
    await processSubscriptionPayment({
      plan,
      stripeSubscriptionId,
      stripePaymentIntentId,
      formData: {
        nameCard,
        email: userEmail,
        notes: notes.trim() || undefined,
      },
      stripe,
      elements,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          placeholder={userName || "Juan Pérez"}
          className={inputBase}
          autoComplete="cc-name"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#212121] dark:text-[#e0e0e0]">
          Datos de la tarjeta
        </label>
        <p className="mb-2 text-xs text-[#757575] dark:text-[#999]">
          Si tu tarjeta es elegible, podrás elegir meses sin intereses después de
          ingresar el número.
        </p>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-3">
          <PaymentElement
            options={{
              layout: "tabs",
              wallets: {
                link: "never",
              },
              defaultValues: {
                billingDetails: {
                  address: { country: "MX" },
                },
              },
            }}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-medium text-[#212121] dark:text-[#e0e0e0]"
        >
          Notas{" "}
          <span className="text-[#9e9e9e] dark:text-[#666]">(opcional)</span>
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
          Acepto los términos del plan y el cargo recurrente según la frecuencia
          seleccionada.
        </span>
      </label>

      <div className="flex flex-col gap-3 pt-2">
        {(loadingPayment || redirecting) && (
          <p className="text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
            {redirecting
              ? "Redirigiendo a la confirmación…"
              : paymentAlreadyConfirmed
                ? "Activando tu suscripción…"
                : "Procesando el pago…"}
          </p>
        )}
        {paymentAlreadyConfirmed && !loadingPayment && !redirecting && (
          <p className="text-center text-sm text-amber-700 dark:text-amber-300">
            Tu pago ya fue procesado. Pulsa el botón para completar la activación
            de la suscripción.
          </p>
        )}
        <button
          type="submit"
          disabled={
            !stripe ||
            !elements ||
            !isActive ||
            !acceptTerms ||
            loadingPayment ||
            redirecting
          }
          className={cn(
            "w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
            isActive && acceptTerms && !redirecting
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-[#9e9e9e] dark:bg-[#555]",
          )}
        >
          {redirecting
            ? "Redirigiendo…"
            : loadingPayment
              ? paymentAlreadyConfirmed
                ? "Activando…"
                : "Procesando…"
              : paymentAlreadyConfirmed
                ? "Activar suscripción"
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
  );
}
