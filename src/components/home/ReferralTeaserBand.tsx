import Link from "next/link";
import { Routes } from "kadesh/core/routes";

/**
 * Franja corta cerca del footer. El programa completo vive en /referidos: en medio de la home
 * distraía a quien vino a probar y, si la calculadora cargaba tarde, mostraba comisiones en $0.
 */
export default function ReferralTeaserBand() {
  return (
    <section
      aria-label="Programa de referidos"
      className="border-t border-[#e5e5e5] bg-[#f8f8f8] py-10 dark:border-white/10 dark:bg-[#0d0d0d]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-[#424242] dark:text-[#d6d6d6]">
          <strong className="text-[#212121] dark:text-white">
            ¿Recomiendas herramientas a otros negocios? Gana con Kadesh.
          </strong>{" "}
          20% del primer pago y 10% mensual mientras tu referido siga activo
          (hasta 12 meses).
        </p>
        <Link
          href={Routes.referidos}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-orange-800 px-5 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-800 hover:text-white dark:border-orange-400 dark:text-orange-300 dark:hover:bg-orange-400 dark:hover:text-[#121212]"
        >
          Ver programa de referidos
        </Link>
      </div>
    </section>
  );
}
