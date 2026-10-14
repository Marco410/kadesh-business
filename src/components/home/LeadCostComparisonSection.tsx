import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { PRO_PLAN_PUBLIC } from "kadesh/components/pricing/constants";
import {
  PRIMARY_CTA_ON_DARK_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
} from "kadesh/components/home/landing-cta";

const COST_PER_LEAD = PRO_PLAN_PUBLIC.costPerLeadMxn.toFixed(2);

/**
 * Se compara contra la alternativa real del cliente (armar la lista a mano o comprar una base),
 * no contra Meta Ads: quien llega aquí no está decidiendo entre canales de pauta.
 * La comparación con Meta Ads sigue en las FAQ.
 */
const OPTIONS = [
  {
    option: "Armar la lista a mano",
    gets: "Lo que alcances a copiar",
    time: "Días por cada lista",
    highlight: false,
  },
  {
    option: "Base de datos comprada",
    gets: "Contactos de antigüedad desconocida",
    time: "Inmediato, pero envejece",
    highlight: false,
  },
  {
    option: `Kadesh Pro ($${PRO_PLAN_PUBLIC.monthlyMxn}/mes)`,
    gets: `${PRO_PLAN_PUBLIC.leadLimit} negocios con teléfono, sin repetidos`,
    time: "Menos de 1 minuto por búsqueda",
    highlight: true,
  },
] as const;

export default function LeadCostComparisonSection() {
  return (
    <section
      id="costo-leads"
      className="relative overflow-hidden py-16 sm:py-24 bg-[#121212] text-white dark:bg-[#0a0a0a]"
    >
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-orange-600/20 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-sm font-semibold text-orange-400">
          ¿Cuánto cuesta un prospecto en Kadesh frente a armar o comprar una lista?
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight text-center">
          Cada prospecto te cuesta menos que una llamada
        </h2>
        <p className="text-lg text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed text-center">
          Armar una lista de {PRO_PLAN_PUBLIC.leadLimit} negocios a mano le toma
          a un vendedor varios días. Una base comprada en Excel cuesta miles de
          pesos y nadie te dice cuántos números siguen activos. Con Kadesh Pro
          tienes {PRO_PLAN_PUBLIC.leadLimit} negocios nuevos al mes por $
          {PRO_PLAN_PUBLIC.monthlyMxn}: unos ${COST_PER_LEAD} por prospecto, con
          teléfono y dirección del día de hoy.
        </p>

        <div className="mx-auto mb-10 max-w-sm rounded-3xl border border-orange-500/40 bg-gradient-to-br from-orange-700/40 to-orange-900/30 px-6 py-7 text-center shadow-[0_20px_60px_rgba(234,88,12,0.25)]">
          <p className="mb-2 text-sm font-semibold text-orange-200">Kadesh Plan Pro</p>
          <p className="text-5xl sm:text-6xl font-black tabular-nums text-white">
            ~${COST_PER_LEAD}
          </p>
          <p className="mt-1 text-sm text-orange-100/80">MXN por prospecto, con teléfono</p>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Comparativa entre armar una lista a mano, comprar una base de datos y Kadesh Pro
            </caption>
            <thead className="bg-white/[0.06] text-white">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">
                  Opción
                </th>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">
                  Qué recibes
                </th>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="text-white/75">
              {OPTIONS.map((row) => (
                <tr
                  key={row.option}
                  className={`border-t border-white/10 align-top ${row.highlight ? "bg-orange-500/10 text-white" : ""}`}
                >
                  <th scope="row" className="px-3 py-3 font-medium sm:px-4">
                    {row.option}
                  </th>
                  <td className={`px-3 py-3 sm:px-4 ${row.highlight ? "font-semibold" : ""}`}>
                    {row.gets}
                  </td>
                  <td className="px-3 py-3 sm:px-4">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-white/50 text-center mb-8 max-w-2xl mx-auto">
          El costo por prospecto usa el precio del plan Pro ({PRO_PLAN_PUBLIC.monthlyMxn}{" "}
          MXN) sobre {PRO_PLAN_PUBLIC.leadLimit} créditos mensuales.
        </p>

        <div className="text-center">
          <Link href={TRIAL_CTA_HREF} className={PRIMARY_CTA_ON_DARK_CLASS}>
            {TRIAL_CTA_LABEL}
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
