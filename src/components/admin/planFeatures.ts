import { PLAN_FEATURES_MAP, type PlanFeatureKey } from "kadesh/constants/constans";

export type PlanFeatureEntry = {
  key: string;
  name: string;
  description: string;
  included: boolean;
};

function metaFor(key: string) {
  return PLAN_FEATURES_MAP[key as PlanFeatureKey] ?? null;
}

function prettyKey(key: string) {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Features guardadas en el plan, tolerando JSON viejo o incompleto. */
export function readPlanFeatures(value: unknown): PlanFeatureEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is Record<string, unknown> =>
        Boolean(v) && typeof v === "object" && Boolean((v as { key?: unknown }).key),
    )
    .map((v) => {
      const key = String(v.key);
      const meta = metaFor(key);
      return {
        key,
        name: String(v.name ?? meta?.name ?? prettyKey(key)),
        description: String(v.description ?? meta?.description ?? ""),
        included: v.included === true,
      };
    });
}

/**
 * Lista que se muestra en el editor: lo que el plan ya tiene (en su orden, con
 * su nombre y descripción tal cual se publican) más las features conocidas que
 * aún no estaban. Nunca se pierde una key que no esté en PLAN_FEATURES_MAP,
 * como `kadesh_ai`.
 */
export function mergePlanFeatures(value: unknown): PlanFeatureEntry[] {
  const stored = readPlanFeatures(value);
  const seen = new Set(stored.map((f) => f.key));
  const missing = Object.keys(PLAN_FEATURES_MAP)
    .filter((key) => !seen.has(key))
    .map((key) => ({
      key,
      name: PLAN_FEATURES_MAP[key as PlanFeatureKey].name,
      description: PLAN_FEATURES_MAP[key as PlanFeatureKey].description,
      included: false,
    }));
  return [...stored, ...missing];
}

/** Payload para `planFeatures`: conserva nombre y descripción publicados. */
export function toPlanFeaturesPayload(
  entries: PlanFeatureEntry[],
  included: Record<string, boolean>,
): PlanFeatureEntry[] {
  return entries.map((f) => ({
    key: f.key,
    name: f.name,
    description: f.description,
    included: Boolean(included[f.key]),
  }));
}

export function countIncluded(value: unknown): { included: number; total: number } {
  const entries = mergePlanFeatures(value);
  return {
    included: entries.filter((f) => f.included).length,
    total: entries.length,
  };
}
