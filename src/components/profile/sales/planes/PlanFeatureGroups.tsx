import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { PlanFeatureItem } from "kadesh/components/profile/sales/queries";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import {
  KADESH_URIM_AI_NAME,
  KADESH_AI_CREDIT_HINT,
} from "kadesh/components/profile/ai/constants";
import FeatureBetaBadge from "kadesh/components/profile/sales/planes/FeatureBetaBadge";
import { cn } from "kadesh/utils/cn";

const KADESH_AI_FEATURE_KEY = "kadesh_ai";

/** Van como chips destacados encima de los bloques, no dentro de uno. */
const HIGHLIGHTED_KEYS: readonly string[] = [
  KADESH_AI_FEATURE_KEY,
  PLAN_FEATURE_KEYS.WHATSAPP,
];

/**
 * Cuatro bloques en vez de ~18 chips del mismo peso: así se comparan planes por créditos y
 * por equipo, no contando chips. Una función nueva sin bloque cae en «Más funciones».
 */
const FEATURE_GROUPS: { title: string; keys: readonly string[] }[] = [
  {
    title: "Encuentra clientes",
    keys: [
      PLAN_FEATURE_KEYS.LEAD_SYNC,
      PLAN_FEATURE_KEYS.ADD_OWN_LEADS,
      PLAN_FEATURE_KEYS.EDIT_LEAD_DATA,
      PLAN_FEATURE_KEYS.EXPORT_EXCEL,
    ],
  },
  {
    title: "Da seguimiento",
    keys: [
      PLAN_FEATURE_KEYS.CRM,
      PLAN_FEATURE_KEYS.SALES_ACTIVITIES,
      PLAN_FEATURE_KEYS.FOLLOW_UP_TASKS,
      PLAN_FEATURE_KEYS.CALENDAR_CRM,
      PLAN_FEATURE_KEYS.ANALYTICS,
    ],
  },
  {
    title: "Cierra la venta",
    keys: [
      PLAN_FEATURE_KEYS.QUOTATIONS,
      PLAN_FEATURE_KEYS.PROPOSALS,
      PLAN_FEATURE_KEYS.PROJECTS,
      PLAN_FEATURE_KEYS.WORKSPACES,
      PLAN_FEATURE_KEYS.UPLOAD_FILES,
    ],
  },
  {
    title: "Trabaja en equipo",
    keys: [
      PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT,
      PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON,
      PLAN_FEATURE_KEYS.SALES_COMMISSION,
    ],
  },
];

const GROUPED_KEYS = new Set(FEATURE_GROUPS.flatMap((group) => group.keys));

function groupFeatures(features: PlanFeatureItem[]) {
  const byKey = new Map(features.map((f) => [f.key, f]));
  const groups = FEATURE_GROUPS.map((group) => ({
    title: group.title,
    items: group.keys
      .map((key) => byKey.get(key))
      .filter((f): f is PlanFeatureItem => f != null),
  }));
  const rest = features.filter(
    (f) => !GROUPED_KEYS.has(f.key) && !HIGHLIGHTED_KEYS.includes(f.key),
  );
  if (rest.length > 0) groups.push({ title: "Más funciones", items: rest });
  return groups.filter((group) => group.items.length > 0);
}

function HighlightChip({ feature }: { feature: PlanFeatureItem }) {
  const isAi = feature.key === KADESH_AI_FEATURE_KEY;
  return (
    <li>
      <span
        title={isAi ? KADESH_AI_CREDIT_HINT : feature.description}
        className={
          isAi
            ? "ai-urim-fill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold shadow-[0_6px_14px_rgba(139,92,246,0.28)]"
            : "inline-flex items-center gap-1.5 rounded-full bg-[#e7f8ee] px-3 py-1.5 text-sm font-semibold text-[#14532d] dark:bg-green-500/15 dark:text-green-300"
        }
      >
        <HugeiconsIcon
          icon={isAi ? SparklesIcon : CheckmarkCircle02Icon}
          size={16}
          className="shrink-0"
          aria-hidden
        />
        {isAi ? KADESH_URIM_AI_NAME : feature.name}
        {feature.beta ? <FeatureBetaBadge onFill={isAi} /> : null}
      </span>
    </li>
  );
}

/**
 * Funciones incluidas de un plan: Kadesh AI y WhatsApp como chips destacados y el resto en
 * cuatro bloques con su título. `layout="grid"` pone los bloques lado a lado (tarjeta Gratis,
 * que es ancha); `stack` los apila (tarjetas de pago, angostas).
 */
export default function PlanFeatureGroups({
  features,
  highlightLabel,
  layout = "stack",
}: {
  features: PlanFeatureItem[] | null | undefined;
  /** Texto sobre los chips destacados (p. ej. «Incluido en tu prueba»). */
  highlightLabel?: string;
  layout?: "stack" | "grid";
}) {
  const included = features?.filter((f) => f.included) ?? [];
  if (included.length === 0) return null;

  const highlighted = HIGHLIGHTED_KEYS.map((key) =>
    included.find((f) => f.key === key),
  ).filter((f): f is PlanFeatureItem => f != null);
  const groups = groupFeatures(included);

  return (
    <div className="space-y-5 text-left">
      {highlighted.length > 0 && (
        <div>
          {highlightLabel && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
              {highlightLabel}
            </p>
          )}
          <ul className="flex flex-wrap gap-2">
            {highlighted.map((f) => (
              <HighlightChip key={f.key} feature={f} />
            ))}
          </ul>
        </div>
      )}

      <div
        className={cn(
          "grid gap-5",
          layout === "grid" && "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-sm font-semibold text-[#212121] dark:text-white">
              {group.title}
            </p>
            <ul className="space-y-1.5">
              {group.items.map((f) => (
                <li
                  key={f.key}
                  title={f.description}
                  className="flex items-start gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={16}
                    className="mt-0.5 shrink-0 text-orange-700 dark:text-orange-400"
                    aria-hidden
                  />
                  <span>
                    {f.name}
                    {f.beta ? (
                      <>
                        {" "}
                        <FeatureBetaBadge />
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
