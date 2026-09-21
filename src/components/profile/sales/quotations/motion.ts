import type { Transition, Variants } from "framer-motion";

/** Misma curva Corporate que clientes, dashboard y perfil. */
export const QUOTATION_MOTION_EASE: [number, number, number, number] = [
  0.2, 0, 0, 1,
];

export function quotationMotionTransition(
  reduce: boolean | null,
  delay = 0,
): Transition {
  if (reduce) return { duration: 0.12, delay: 0 };
  return { duration: 0.28, ease: QUOTATION_MOTION_EASE, delay };
}

export function quotationFadeUp(reduce: boolean | null): Variants {
  if (reduce) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };
}

export function quotationStagger(
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
