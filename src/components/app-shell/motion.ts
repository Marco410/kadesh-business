import type { Transition, Variants } from "framer-motion";

/**
 * Movimiento de los paneles (mismo lenguaje que el admin de ICARM): una sola curva para todo,
 * entradas cortas de abajo hacia arriba y escalón de 50 ms con tope de 8 (máx. 400 ms).
 * `AppShell` envuelve todo en `<MotionConfig reducedMotion="user">` y `globals.css` apaga las
 * animaciones CSS con movimiento reducido.
 */
export const DASH_EASE = [0.16, 0.84, 0.44, 1] as const;

export const DASH_STAGGER_STEP = 0.05;
export const DASH_STAGGER_CAP = 8;

export function staggerDelay(index: number): number {
  return Math.min(Math.max(index, 0), DASH_STAGGER_CAP) * DASH_STAGGER_STEP;
}

/** Fade-up de entrada. Usar con `custom={index}` para escalonar. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: DASH_EASE, delay: staggerDelay(index) },
  }),
};

/** Indicadores que se deslizan (píldora activa del menú, segmentados, pestañas). */
export const indicatorTransition: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.8,
};

/** Paneles y menús que aparecen (drawer, "+ Nuevo", modales). */
export const popTransition: Transition = { duration: 0.28, ease: DASH_EASE };

/** Retraso CSS escalonado para barras y filas (`animation-delay`). */
export function cssStaggerDelay(index: number): string {
  return `${Math.round(staggerDelay(index) * 1000)}ms`;
}
