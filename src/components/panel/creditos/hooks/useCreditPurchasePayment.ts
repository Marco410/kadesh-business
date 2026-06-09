"use client";

import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import {
  GET_STRIPE_PAYMENT_METHODS,
  GET_PAYMENT_METHOD,
  CREATE_PAYMENT_METHOD,
  PURCHASE_CREDITS_MUTATION,
  type PurchaseCreditsResponse,
  type SaasCreditItem,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";

export interface CreditPurchasePaymentFormData {
  nameCard: string;
  email: string;
  notes?: string;
}

export function useCreditPurchasePayment(
  userId: string | undefined,
  userEmail: string | undefined,
  stripeCustomerId: string | undefined,
) {
  const client = useApolloClient();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [createPaymentMethod] = useMutation(CREATE_PAYMENT_METHOD);
  const [purchaseCredits] =
    useMutation<PurchaseCreditsResponse>(PURCHASE_CREDITS_MUTATION);

  const processCreditPurchasePayment = async (
    credit: SaasCreditItem,
    formData: CreditPurchasePaymentFormData,
  ) => {
    if (!stripe || !elements || !userId || !userEmail) {
      sileo.error({
        title: "Sesión o datos incompletos. Inicia sesión e intenta de nuevo.",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      sileo.error({ title: "No se pudo obtener el formulario de tarjeta." });
      return;
    }

    setLoadingPayment(true);

    try {
      const userName = formData.nameCard.trim() || "Tarjetahabiente";

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: userName,
          email: userEmail,
        },
      });

      if (error) {
        sileo.error({
          title:
            "Error al procesar el pago: " +
            (error.message ?? "Intenta de nuevo."),
        });
        setLoadingPayment(false);
        return;
      }

      if (!paymentMethod?.card) {
        sileo.error({ title: "No se pudo crear el método de pago." });
        setLoadingPayment(false);
        return;
      }

      let methodsList: unknown[] = [];
      if (stripeCustomerId) {
        try {
          const { data: getStripePaymentMethods } = await client.query({
            query: GET_STRIPE_PAYMENT_METHODS,
            variables: { email: userEmail },
            fetchPolicy: "network-only",
          });
          const raw = (getStripePaymentMethods as { StripePaymentMethods?: { success?: boolean; data?: { data?: unknown[] } } })
            ?.StripePaymentMethods;
          if (raw?.success === true && Array.isArray(raw?.data?.data)) {
            methodsList = raw.data.data;
          }
        } catch {
          // Seguir como si no hubiera métodos guardados.
        }
      }

      const stripePaymentMethodDuplicate = methodsList.find(
        (method) => {
          const card = (method as { card?: { last4?: string; exp_month?: number; exp_year?: number; brand?: string } }).card;
          return (
            card?.last4 === paymentMethod.card?.last4 &&
            card?.exp_month === paymentMethod.card?.exp_month &&
            card?.exp_year === paymentMethod.card?.exp_year &&
            card?.brand === paymentMethod.card?.brand
          );
        },
      ) as { id: string } | undefined;

      const paymentMethodVariables = {
        user: { connect: { id: userId } },
        cardType: paymentMethod.type,
        lastFourDigits: paymentMethod.card.last4?.toString() ?? "",
        expMonth: paymentMethod.card.exp_month?.toString() ?? "",
        expYear: paymentMethod.card.exp_year?.toString() ?? "",
        stripeProcessorId: "-",
        stripePaymentMethodId: paymentMethod.id,
        address: "",
        postalCode:
          paymentMethod.billing_details?.address?.postal_code?.toString() ?? "",
        ownerName: userName,
        country: paymentMethod.card.country ?? "",
      };

      let paymentMethodId: string;

      if (!stripePaymentMethodDuplicate) {
        const res = await createPaymentMethod({
          variables: { data: paymentMethodVariables },
        });
        paymentMethodId = (res.data as { createSaasPaymentMethod: { id: string } })
          .createSaasPaymentMethod.id;
      } else {
        const { data: getPaymentMethod } = await client.query({
          query: GET_PAYMENT_METHOD,
          variables: {
            where: { stripePaymentMethodId: stripePaymentMethodDuplicate.id },
          },
          fetchPolicy: "network-only",
        });
        const existing = (getPaymentMethod as { saasPaymentMethod?: { id: string } | null })
          ?.saasPaymentMethod;
        if (existing?.id) {
          paymentMethodId = existing.id;
        } else {
          const res = await createPaymentMethod({
            variables: { data: paymentMethodVariables },
          });
          paymentMethodId = (res.data as { createSaasPaymentMethod: { id: string } })
            .createSaasPaymentMethod.id;
        }
      }

      const total = credit.cost.toFixed(2);
      const response = await purchaseCredits({
        variables: {
          input: {
            creditPackageId: credit.id,
            notes: formData.notes ?? null,
            nameCard: userName,
            email: userEmail,
            paymentMethodId,
            total,
            paymentType: "credit",
          },
        },
      });

      const result = response.data?.purchaseCredits;

      if (result?.success) {
        setRedirecting(true);
        const creditsAdded = result.creditsAdded;
        const remainingQuota = result.newCreditsTotal;
        sileo.success({
          title: result.message ?? "Créditos agregados correctamente.",
          description:
            creditsAdded != null && remainingQuota != null
              ? `Compraste ${creditsAdded} créditos. Tu cuota disponible restante es ${remainingQuota}.`
              : remainingQuota != null
                ? `Tu cuota disponible restante es ${remainingQuota}.`
                : creditsAdded != null
                  ? `Se añadieron ${creditsAdded} créditos a tu cuenta.`
                  : "Tu compra se procesó correctamente.",
        });
        router.replace(Routes.panelCreditPurchaseSuccess);
      } else {
        setLoadingPayment(false);
        sileo.error({
          title:
            result?.message ??
            "No se pudo completar la compra. Intenta de nuevo.",
        });
      }
    } catch (err) {
      setLoadingPayment(false);
      const message =
        err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.";
      sileo.error({ title: message });
    }
  };

  return {
    processCreditPurchasePayment,
    loadingPayment,
    redirecting,
  };
}
