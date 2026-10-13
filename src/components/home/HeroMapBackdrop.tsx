import type { CSSProperties } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Restaurant01Icon,
  Store01Icon,
  Coffee01Icon,
  Dumbbell01Icon,
  DentalToothIcon,
  Scissor01Icon,
  Pizza01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import styles from "./HeroMapBackdrop.module.css";

/**
 * Fondo del hero: solo el mapa, muy tenue y derivando despacio. Va detrás de todo el hero;
 * el radar y los negocios viven en `HeroRadar`, detrás de la demo, para no pasar por el texto.
 * Decorativo (aria-hidden), sin JS ni imágenes: no compite con el LCP.
 */
export default function HeroMapBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={cn("absolute -inset-[6%] opacity-60 dark:opacity-40", styles.drift)}>
        <MapStreets />
      </div>
    </div>
  );
}

/**
 * Negocios que aparecen alrededor de la demo, fuera de la tarjeta (posición en % del radar,
 * que mide 150% del ancho de la demo). Solo en desktop: en móvil quedarían encima del texto.
 */
const LEADS = [
  { icon: Restaurant01Icon, top: 22, left: 7, delay: 1.6 },
  { icon: Store01Icon, top: 70, left: 93, delay: 2.6 },
  { icon: Coffee01Icon, top: 16, left: 92, delay: 3.6 },
  { icon: DentalToothIcon, top: 80, left: 9, delay: 4.6 },
  { icon: Dumbbell01Icon, top: 44, left: 96, delay: 5.6 },
  { icon: Pizza01Icon, top: 3, left: 30, delay: 6.6 },
  { icon: Scissor01Icon, top: 50, left: 4, delay: 7.6 },
  { icon: Wrench01Icon, top: 97, left: 70, delay: 8.6 },
] as const;

const RINGS = [0, 1.5, 3] as const;

/**
 * Radar detrás de la demo del hero: las ondas salen desde atrás de la tarjeta y los negocios
 * (restaurante, tienda, café…) van apareciendo alrededor. Ciclo de 12 s.
 */
export function HeroRadar() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {RINGS.map((delay, i) => (
        <span
          key={delay}
          className={cn("absolute inset-0 rounded-full border border-white/30", styles.ring)}
          style={
            {
              "--delay": `${delay}s`,
              "--still-scale": `${0.55 + i * 0.2}`,
            } as CSSProperties
          }
        />
      ))}

      <div
        className={cn(
          "absolute inset-0 hidden rounded-full opacity-60 [mask-image:radial-gradient(circle,black_55%,transparent_71%)] lg:block",
          styles.sweep,
        )}
      />

      {LEADS.map(({ icon, top, left, delay }) => (
        <span
          key={`${top}-${left}`}
          className="absolute hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          style={{ top: `${top}%`, left: `${left}%`, "--delay": `${delay}s` } as CSSProperties}
        >
          <span
            className={cn("absolute inset-0 rounded-full border border-white/40", styles.leadPing)}
          />
          <span
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/75",
              styles.lead,
            )}
          >
            <HugeiconsIcon icon={icon} size={15} strokeWidth={1.8} />
          </span>
        </span>
      ))}
    </div>
  );
}

/** Calles estilizadas: avenidas, retícula secundaria, una diagonal y un parque. */
function MapStreets() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <pattern id="hero-map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" stroke="white" strokeOpacity="0.05" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="url(#hero-map-grid)" />

      <rect x="1040" y="120" width="220" height="150" rx="18" fill="white" fillOpacity="0.04" />
      <rect x="240" y="640" width="160" height="200" rx="18" fill="white" fillOpacity="0.03" />
      <circle cx="1320" cy="760" r="90" fill="white" fillOpacity="0.03" />

      <g stroke="white" strokeLinecap="round">
        <path d="M-20 360H1620" strokeOpacity="0.1" strokeWidth="14" />
        <path d="M-20 720H1620" strokeOpacity="0.08" strokeWidth="10" />
        <path d="M520 -20V1020" strokeOpacity="0.1" strokeWidth="14" />
        <path d="M1180 -20V1020" strokeOpacity="0.08" strokeWidth="10" />
        <path d="M-40 980L980 -40" strokeOpacity="0.07" strokeWidth="12" />
        <path
          d="M760 1020C820 820 980 700 1180 640S1520 520 1640 380"
          strokeOpacity="0.06"
          strokeWidth="8"
        />
        <path d="M-20 160H1620M-20 560H1620M-20 880H1620" strokeOpacity="0.05" strokeWidth="4" />
        <path d="M200 -20V1020M840 -20V1020M1440 -20V1020" strokeOpacity="0.05" strokeWidth="4" />
      </g>
    </svg>
  );
}
