"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import type { Stripe, StripeElements } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import {
  CREATE_COMPANY_SUBSCRIPTION,
  type CreateCompanySubscriptionResponse,
  type SaasPlanItem,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { isPaymentIntentAlreadySucceeded } from "../stripe-payment-errors";

export interface SubscriptionPaymentFormData {
  nameCard: string;
  email: string;
  notes?: string;
}

interface ProcessSubscriptionPaymentParams {
  plan: SaasPlanItem;
  stripeSubscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
  formData: SubscriptionPaymentFormData;
  stripe: Stripe | null;
  elements: StripeElements | null;
}

export function useSubscriptionPayment() {
  const router = useRouter();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [paymentAlreadyConfirmed, setPaymentAlreadyConfirmed] = useState(false);
  /** Evita volver a confirmar un PI que ya cobró (reintento tras error en createCompanySubscription). */
  const paymentConfirmedRef = useRef(false);

  const markPaymentConfirmed = () => {
    paymentConfirmedRef.current = true;
    setPaymentAlreadyConfirmed(true);
  };

  const [createCompanySubscription] =
    useMutation<CreateCompanySubscriptionResponse>(CREATE_COMPANY_SUBSCRIPTION);

  const finalizeSubscription = useCallback(
    async ({
      plan,
      stripeSubscriptionId,
      stripePaymentIntentId,
      formData,
    }: Omit<
      ProcessSubscriptionPaymentParams,
      "stripe" | "elements"
    >) => {
      const response = await createCompanySubscription({
        variables: {
          input: {
            planId: plan.id,
            notes: formData.notes ?? null,
            nameCard: formData.nameCard.trim() || "Tarjetahabiente",
            email: formData.email,
            total: plan.cost.toFixed(2),
            paymentType: "subscription",
            stripeSubscriptionId: stripeSubscriptionId ?? null,
            stripePaymentIntentId: stripePaymentIntentId ?? null,
          },
        },
      });

      const result = response.data?.createCompanySubscription;

      if (result?.success) {
        setRedirecting(true);
        sileo.success({
          title: result.message ?? "Suscripción activada.",
          description:
            "¡Listo! Tu suscripción está activa y ahora puedes disfrutar de los beneficios del plan seleccionado.",
        });
        router.replace(Routes.panelPlanSubscriptionSuccess);
        return true;
      }

      sileo.error({
        title:
          result?.message ??
          "No se pudo completar la suscripción. Intenta de nuevo.",
      });
      return false;
    },
    [createCompanySubscription, router],
  );

  const processSubscriptionPayment = async ({
    plan,
    stripeSubscriptionId,
    stripePaymentIntentId,
    formData,
    stripe,
    elements,
  }: ProcessSubscriptionPaymentParams) => {
    if (!stripe || !elements) {
      sileo.error({
        title: "El formulario de pago aún no está listo. Espera un momento.",
      });
      return;
    }

    if (!stripeSubscriptionId && !stripePaymentIntentId) {
      sileo.error({
        title: "No se pudo iniciar la sesión de pago. Recarga la página.",
      });
      return;
    }

    setLoadingPayment(true);

    try {
      if (!paymentConfirmedRef.current) {
        const returnUrl = `${window.location.origin}${Routes.panelPlanSubscriptionSuccess}`;
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details: {
                name: formData.nameCard.trim() || "Tarjetahabiente",
                email: formData.email,
              },
            },
          },
          redirect: "if_required",
        });

        if (confirmError) {
          if (isPaymentIntentAlreadySucceeded(confirmError)) {
            markPaymentConfirmed();
          } else {
            sileo.error({
              title:
                confirmError.message ??
                "No se pudo confirmar el pago. Intenta de nuevo.",
            });
            setLoadingPayment(false);
            return;
          }
        } else {
          markPaymentConfirmed();
        }
      }

      const ok = await finalizeSubscription({
        plan,
        stripeSubscriptionId,
        stripePaymentIntentId,
        formData,
      });

      if (!ok) {
        setLoadingPayment(false);
      }
    } catch (err) {
      setLoadingPayment(false);
      const message =
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.";
      sileo.error({ title: message });
    }
  };

  return {
    processSubscriptionPayment,
    loadingPayment,
    redirecting,
    paymentAlreadyConfirmed,
  };
}
