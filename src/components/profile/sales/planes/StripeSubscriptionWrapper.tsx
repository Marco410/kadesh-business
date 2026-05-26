"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import SuscripcionSection from "./SuscripcionSection";
import { getStripeElementsAppearance } from "./stripe-elements-appearance";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

interface StripeSubscriptionWrapperProps {
  clientSecret: string;
}

export function StripeSubscriptionElements({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const appearance = useMemo(
    () =>
      getStripeElementsAppearance(resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme],
  );

  const options = useMemo(
    () => ({
      clientSecret,
      appearance,
      locale: "es" as const,
    }),
    [clientSecret, appearance],
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export default function StripeSubscriptionWrapper() {
  return <SuscripcionSection />;
}
