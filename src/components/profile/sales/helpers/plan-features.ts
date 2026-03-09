/** Plan feature item from subscription API (key, name, included, description). */
export interface PlanFeatureItemFromApi {
  key: string;
  name: string;
  included: boolean;
  description: string;
}

/**
 * Indica si la suscripción incluye la funcionalidad con el key dado.
 * Usar para mostrar u ocultar secciones según el plan.
 */
export function hasPlanFeature(
  planFeatures: PlanFeatureItemFromApi[] | null | undefined,
  featureKey: string
): boolean {
  console.log("planFeatures", planFeatures);
  console.log("featureKey", featureKey);
  if (!planFeatures?.length) return false;
  const feature = planFeatures.find((f) => f.key === featureKey);
  return feature?.included === true;
}
