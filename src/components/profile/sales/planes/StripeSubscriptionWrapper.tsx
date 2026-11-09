"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import SuscripcionSection from "./SuscripcionSection";

// En español: los errores de tarjeta de Stripe («Tu tarjeta fue rechazada…») se muestran tal cual.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "", {
  locale: "es",
});

export default function StripeSubscriptionWrapper() {
  const options = useMemo(() => ({ locale: "es" as const }), []);

  return (
    <Elements stripe={stripePromise} options={options}>
      <SuscripcionSection />
    </Elements>
  );
}
