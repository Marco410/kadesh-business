import type { ReactNode } from "react";

/**
 * Instrucciones al inicio de cada vista de Analítica: qué mide y cómo leerla. Recuerda que cada
 * número tiene su ayuda (ⓘ).
 */
export default function ViewGuide({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-[#424242] dark:border-orange-900/60 dark:bg-orange-500/10 dark:text-[#e0e0e0]">
      <p className="font-semibold text-[#212121] dark:text-white">Cómo leer esta vista</p>
      <div className="mt-1">{children}</div>
      <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
        {note ? <>{note} </> : null}Toca el ícono ⓘ de cada número para saber qué es.
      </p>
    </div>
  );
}
