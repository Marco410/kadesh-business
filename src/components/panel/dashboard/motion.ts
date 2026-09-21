import type { Transition, Variants } from "framer-motion";

/** Misma curva que extracción B2B y CRM (`cubic-bezier(0.2, 0, 0, 1)`). */
export const DASHBOARD_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

export const dashboardViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -24px 0px",
} as const;

export function dashboardTransition(
  reduce: boolean | null,
  delay = 0,
): Transition {
  if (reduce) return { duration: 0.12, delay: 0 };
  return { duration: 0.28, ease: DASHBOARD_EASE, delay };
}

export function fadeUpVariants(reduce: boolean | null): Variants {
  if (reduce) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };
}

export function staggerContainer(
  reduce: boolean | null,
  delayChildren = 0.04,
): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.05,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  };
}

export function barGrowDelay(index: number, reduce: boolean | null) {
  if (reduce) return undefined;
  return `${Math.min(index * 40, 280)}ms`;
}
