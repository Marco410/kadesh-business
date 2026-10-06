/** Plan feature item from subscription API (key, name, included, description, beta). */
export interface PlanFeatureItemFromApi {
  key: string;
  name: string;
  included: boolean;
  description: string;
  beta?: boolean;
}

/**
 * Indica si la suscripción incluye la funcionalidad con el key dado.
 * Usar para mostrar u ocultar secciones según el plan.
 */
export function hasPlanFeature(
  planFeatures: PlanFeatureItemFromApi[] | null | undefined,
  featureKey: string
): boolean {
  if (!planFeatures?.length) return false;
  const feature = planFeatures.find((f) => f.key === featureKey);
  return feature?.included === true;
}

type PlanMatch = {
  name: string;
  cost: number;
  frequency: string;
  planFeatures: PlanFeatureItemFromApi[] | null;
};

type SubscriptionPlanMatch = {
  planName: string | null;
  planCost: number | null;
  planFrequency: string | null;
};

/**
 * El plan del catálogo que corresponde a la suscripción de la empresa.
 * La suscripción guarda una copia al contratar y no trae la marca beta;
 * esa marca vive en el plan que se edita en Operaciones.
 */
export function findSubscriptionPlan<T extends PlanMatch>(
  plans: T[],
  subscription: SubscriptionPlanMatch | null,
): T | null {
  const name = subscription?.planName?.trim().toLowerCase();
  if (!name) return null;
  const sameName = plans.filter((plan) => plan.name.trim().toLowerCase() === name);
  return (
    sameName.find(
      (plan) =>
        plan.cost === subscription?.planCost &&
        plan.frequency === subscription?.planFrequency,
    ) ??
    sameName.find((plan) => plan.cost === subscription?.planCost) ??
    (sameName.length === 1 ? sameName[0] : null)
  );
}

/** Keys incluidas en el plan actual y marcadas en beta. */
export function betaFeatureKeysForSubscription(
  plans: PlanMatch[],
  subscription: SubscriptionPlanMatch | null,
): Set<string> {
  const keys = new Set<string>();
  const plan = findSubscriptionPlan(plans, subscription);
  for (const feature of plan?.planFeatures ?? []) {
    if (feature.included && feature.beta) keys.add(feature.key);
  }
  return keys;
}
