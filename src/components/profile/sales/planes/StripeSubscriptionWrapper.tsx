"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import SuscripcionSection from "./SuscripcionSection";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

export default function StripeSubscriptionWrapper() {
  const options = useMemo(() => ({}), []);

  return (
    <Elements stripe={stripePromise} options={options}>
      <SuscripcionSection />
    </Elements>
  );
}
