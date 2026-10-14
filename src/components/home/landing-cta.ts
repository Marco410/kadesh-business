import { Routes } from "kadesh/core/routes";

/**
 * Solo dos botones en toda la landing: probar gratis (principal) y agendar demo (secundario).
 * Antes había ~9 textos distintos ("Probar gratis (70 leads)", "Regístrate gratis", "Acceder ahora"…)
 * y el visitante no sabía si eran la misma acción.
 */
export const TRIAL_CTA_LABEL = "Probar gratis 7 días";
export const DEMO_CTA_LABEL = "Agendar demo de 15 min";

export const TRIAL_CTA_HREF = Routes.auth.register;
export const DEMO_CTA_HREF = `${Routes.home}${Routes.navigation.scheduleDemo}`;

/**
 * «Créditos», no «leads»: los 70 de la prueba sirven para extraer y para Kadesh AI,
 * así que si usan la IA sacan menos de 70 prospectos.
 */
export const TRIAL_PERKS = [
  "7 días gratis",
  "70 créditos incluidos",
  "Sin tarjeta",
  "Datos públicos y legales",
] as const;

/** Principal sobre fondo claro. `orange-800` y no el `orange-500` de marca: blanco sobre 500 no pasa AA. */
export const PRIMARY_CTA_CLASS =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-800 px-7 text-base font-semibold text-white shadow-[0_10px_24px_rgba(168,86,31,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212]";

/** Principal sobre fondo naranja u oscuro (hero, costo, cierre): el naranja no se distinguiría. */
export const PRIMARY_CTA_ON_DARK_CLASS =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-base font-semibold text-gray-900 shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-800";

/** Secundario sobre fondo naranja u oscuro: solo borde. */
export const SECONDARY_CTA_ON_DARK_CLASS =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/10 px-7 text-base font-semibold text-white transition-colors duration-150 hover:bg-white/20 hover:text-white dark:border-white/40";

/**
 * La pregunta de cada sección queda como texto pequeño encima del encabezado (la leen buscadores
 * y motores de IA); el encabezado grande es el beneficio.
 */
export const SECTION_QUESTION_CLASS =
  "mb-3 text-sm font-semibold text-orange-800 dark:text-orange-400";
