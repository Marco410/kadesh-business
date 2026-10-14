import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  CallIcon,
  FlashIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import StatsCounter from "kadesh/components/home/StatsCounter";
import {
  MIN_COMPANIES_TO_SHOW,
  fetchLandingStats,
  roundDownForDisplay,
} from "kadesh/components/home/landing-stats";

/**
 * Franja de cifras reales justo después del hero (conteos de la base vía `landingStats`).
 * Tres cifras: empresas, ciudades y el tiempo a la primera lista. Ya no va "negocios en nuestra
 * base": para una herramienta que busca en todo Google Maps, un total de miles se ve chico.
 * Server Component; solo el contador es cliente. Sin datos del API no se pinta.
 */
export default async function LandingStatsBand() {
  const stats = await fetchLandingStats();
  if (!stats || stats.leadsTotal === 0) return null;

  const items = [
    stats.companies >= MIN_COMPANIES_TO_SHOW
      ? { icon: Briefcase01Icon, value: stats.companies, label: "empresas prospectan con Kadesh" }
      : { icon: CallIcon, value: stats.leadsWithPhone, label: "negocios con teléfono para llamar" },
    { icon: Location01Icon, value: stats.cities, label: "ciudades con prospectos" },
  ];

  return (
    <section
      aria-label="Kadesh en números"
      className="relative bg-[#121212] text-white dark:bg-[#0a0a0a]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      <dl className="mx-auto grid max-w-5xl grid-cols-3 gap-x-3 px-4 py-8 sm:gap-x-6 sm:px-6 sm:py-12 lg:px-8">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center">
            <dt className="order-2 mt-1.5 flex flex-col items-center gap-1 text-xs text-white/70 sm:flex-row sm:gap-1.5 sm:text-sm">
              <HugeiconsIcon icon={item.icon} size={14} className="text-orange-400" />
              {item.label}
            </dt>
            <dd className="order-1 text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <StatsCounter value={roundDownForDisplay(item.value)} suffix="+" />
            </dd>
          </div>
        ))}
        <div className="flex flex-col items-center text-center">
          <dt className="order-2 mt-1.5 flex flex-col items-center gap-1 text-xs text-white/70 sm:flex-row sm:gap-1.5 sm:text-sm">
            <HugeiconsIcon icon={FlashIcon} size={14} className="text-orange-400" />
            para tu primera lista
          </dt>
          <dd className="order-1 text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            &lt; 1 min
          </dd>
        </div>
      </dl>
    </section>
  );
}
