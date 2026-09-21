import type { Transition, Variants } from "framer-motion";

/** Misma curva que dashboard, perfil y CRM (`cubic-bezier(0.2, 0, 0, 1)`). */
export const AI_MOTION_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

export function aiMotionTransition(
  reduce: boolean | null,
  delay = 0,
): Transition {
  if (reduce) return { duration: 0.12, delay: 0 };
  return { duration: 0.28, ease: AI_MOTION_EASE, delay };
}

export function aiFadeUpVariants(reduce: boolean | null): Variants {
  if (reduce) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };
}

export function aiStaggerContainer(
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

export function aiTabSwitchTransition(reduce: boolean | null): Transition {
  if (reduce) return { duration: 0.12 };
  return { duration: 0.22, ease: AI_MOTION_EASE };
}
