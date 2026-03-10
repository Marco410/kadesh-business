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
  CREATE_COMPANY_SUBSCRIPTION,
  type CreateCompanySubscriptionResponse,
  type SaasPlanItem,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";

export interface SubscriptionPaymentFormData {
  nameCard: string;
  email: string;
  notes?: string;
}

export function useSubscriptionPayment(
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
  const [createCompanySubscription] =
    useMutation<CreateCompanySubscriptionResponse>(CREATE_COMPANY_SUBSCRIPTION);

  const processSubscriptionPayment = async (
    plan: SaasPlanItem,
    formData: SubscriptionPaymentFormData,
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

      // Listar métodos de pago en Stripe solo si hay customer (evitar "No such customer").
      // Si no hay stripeCustomerId, o el backend devuelve success: false, usamos lista vacía.
      let methodsList: unknown[] = [];
      if (stripeCustomerId) {
        try {
          const { data: getStripePaymentMethods } = await client.query({
            query: GET_STRIPE_PAYMENT_METHODS,
            variables: { email: userEmail },
            fetchPolicy: "network-only",
          });
          const raw = (getStripePaymentMethods as any)?.StripePaymentMethods;
          if (raw?.success === true && Array.isArray(raw?.data?.data)) {
            methodsList = raw.data.data;
          }
        } catch {
          // Error de red o excepción: seguir como si no hubiera métodos.
        }
      }

      const stripePaymentMethodDuplicate = methodsList.find(
        (method: any) =>
          method.card?.last4 === paymentMethod.card?.last4 &&
          method.card?.exp_month === paymentMethod.card?.exp_month &&
          method.card?.exp_year === paymentMethod.card?.exp_year &&
          method.card?.brand === paymentMethod.card?.brand,
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
      let noDuplicatePaymentMethod: boolean;

      if (!stripePaymentMethodDuplicate) {
        const res = await createPaymentMethod({
          variables: { data: paymentMethodVariables },
        });
        paymentMethodId = (res.data as any).createSaasPaymentMethod.id;
        noDuplicatePaymentMethod = true;
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
          noDuplicatePaymentMethod = false;
        } else {
          const res = await createPaymentMethod({
            variables: { data: paymentMethodVariables },
          });
          paymentMethodId = (res.data as { createSaasPaymentMethod: { id: string } })
            .createSaasPaymentMethod.id;
          noDuplicatePaymentMethod = true;
        }
      }

      const total = plan.cost.toFixed(2);
      const response = await createCompanySubscription({
        variables: {
          input: {
            planId: plan.id,
            notes: formData.notes ?? null,
            nameCard: userName,
            email: userEmail,
            paymentMethodId,
            total,
            paymentType: "subscription",
            noDuplicatePaymentMethod,
          },
        },
      });

      const result = response.data?.createCompanySubscription;

      if (result?.success) {
        setRedirecting(true);
        sileo.success({
          title: result.message ?? "Suscripción activada.",
          description: "¡Listo! Tu suscripción está activa y ahora puedes disfrutar de los beneficios del plan seleccionado.",
        });
        router.replace(Routes.panelPlanSubscriptionSuccess);
      } else {
        setLoadingPayment(false);
        sileo.error({
          title:
            result?.message ??
            "No se pudo completar la suscripción. Intenta de nuevo.",
        });
      }
    } catch (err) {
      setLoadingPayment(false);
      const message = err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.";
      sileo.error({ title: message });
    }
  };

  return {
    processSubscriptionPayment,
    loadingPayment,
    redirecting,
  };
}
