import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  CallIcon,
  Location01Icon,
  Store01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import StatsCounter from "kadesh/components/home/StatsCounter";
import {
  fetchLandingStats,
  roundDownForDisplay,
} from "kadesh/components/home/landing-stats";

/** Por debajo de esto la cifra de empresas resta más de lo que suma: se cambia por "con teléfono". */
const MIN_COMPANIES_TO_SHOW = 25;

/**
 * Franja de cifras reales justo después del hero (conteos de la base vía `landingStats`).
 * Server Component; solo el contador es cliente. Sin datos del API no se pinta.
 */
export default async function LandingStatsBand() {
  const stats = await fetchLandingStats();
  if (!stats || stats.leadsTotal === 0) return null;

  const items = [
    { icon: Store01Icon, value: stats.leadsTotal, label: "negocios en nuestra base" },
    { icon: Location01Icon, value: stats.cities, label: "ciudades con prospectos" },
    { icon: Tag01Icon, value: stats.categories, label: "giros de negocio" },
    stats.companies >= MIN_COMPANIES_TO_SHOW
      ? { icon: Briefcase01Icon, value: stats.companies, label: "empresas prospectan con Kadesh" }
      : { icon: CallIcon, value: stats.leadsWithPhone, label: "con teléfono para llamar" },
  ];

  return (
    <section
      aria-label="Kadesh en números"
      className="relative bg-[#121212] text-white dark:bg-[#0a0a0a]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <dt className="order-2 mt-1.5 flex items-center gap-1.5 text-xs text-white/70 sm:text-sm">
              <HugeiconsIcon icon={item.icon} size={14} className="text-orange-400" />
              {item.label}
            </dt>
            <dd className="order-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <StatsCounter value={roundDownForDisplay(item.value)} suffix="+" />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
