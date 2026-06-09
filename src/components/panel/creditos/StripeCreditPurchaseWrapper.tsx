"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CompraCreditosSection from "./CompraCreditosSection";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

export default function StripeCreditPurchaseWrapper() {
  const options = useMemo(() => ({}), []);

  return (
    <Elements stripe={stripePromise} options={options}>
      <CompraCreditosSection />
    </Elements>
  );
}
