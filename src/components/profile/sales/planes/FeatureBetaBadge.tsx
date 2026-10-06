/**
 * Etiqueta de un módulo que aún está en beta. El mismo badge va en el editor
 * de planes y donde el cliente ve qué incluye el plan.
 */
export default function FeatureBetaBadge({ onFill = false }: { onFill?: boolean }) {
  return (
    <span
      className={
        onFill
          ? "inline-flex shrink-0 items-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          : "inline-flex shrink-0 items-center rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300"
      }
    >
      Beta
    </span>
  );
}
