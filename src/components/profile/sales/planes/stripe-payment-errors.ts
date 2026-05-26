import type { StripeError } from "@stripe/stripe-js";

/** PI ya cobrado; no se puede volver a confirmar el mismo client_secret. */
export function isPaymentIntentAlreadySucceeded(
  error: StripeError | undefined,
): boolean {
  if (!error) return false;

  if (error.code !== "payment_intent_unexpected_state") return false;

  const pi = error.payment_intent;
  if (!pi || typeof pi !== "object") return false;

  return "status" in pi && pi.status === "succeeded";
}
