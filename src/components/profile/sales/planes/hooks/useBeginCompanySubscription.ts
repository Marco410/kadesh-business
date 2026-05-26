"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  BEGIN_COMPANY_SUBSCRIPTION,
  type BeginCompanySubscriptionResponse,
  type SaasPlanItem,
} from "kadesh/components/profile/sales/queries";

export function useBeginCompanySubscription(
  plan: SaasPlanItem | null,
  email: string | undefined,
) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(
    null,
  );
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(
    null,
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [beginCheckout, { loading: beginningCheckout }] =
    useMutation<BeginCompanySubscriptionResponse>(BEGIN_COMPANY_SUBSCRIPTION);

  const resetCheckout = useCallback(() => {
    setClientSecret(null);
    setStripeSubscriptionId(null);
    setStripePaymentIntentId(null);
    setCheckoutError(null);
  }, []);

  const startCheckout = useCallback(async () => {
    if (!plan?.id || !email) return;

    setCheckoutError(null);
    try {
      const { data, errors } = await beginCheckout({
        variables: {
          input: {
            planId: plan.id,
            email,
            total: plan.cost.toFixed(2),
          },
        },
      });

      if (errors?.length) {
        setCheckoutError(errors[0]?.message ?? "Error al iniciar el pago.");
        resetCheckout();
        return;
      }

      const result = data?.beginCompanySubscription;
      const hasCheckoutSession =
        Boolean(result?.stripeSubscriptionId) ||
        Boolean(result?.stripePaymentIntentId);

      if (!result?.success || !result.clientSecret || !hasCheckoutSession) {
        setCheckoutError(
          result?.message ??
            "No se pudo iniciar el pago. Intenta de nuevo en unos segundos.",
        );
        resetCheckout();
        return;
      }

      setClientSecret(result.clientSecret);
      setStripeSubscriptionId(result.stripeSubscriptionId ?? null);
      setStripePaymentIntentId(result.stripePaymentIntentId ?? null);
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Error de conexión al iniciar el pago.",
      );
      resetCheckout();
    }
  }, [beginCheckout, email, plan, resetCheckout]);

  useEffect(() => {
    if (!plan?.id || !email) {
      resetCheckout();
      return;
    }
    void startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reiniciar solo si cambia plan o email
  }, [plan?.id, plan?.cost, email]);

  return {
    clientSecret,
    stripeSubscriptionId,
    stripePaymentIntentId,
    checkoutError,
    beginningCheckout,
    retryCheckout: startCheckout,
  };
}
