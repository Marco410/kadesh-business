/**
 * Solo testimonios reales y con permiso. Uno solo bien presentado convence más que cinco
 * que nadie puede encontrar; además Meta puede rechazar anuncios que llevan a reseñas no verificables.
 * `role` y `city` se muestran solo cuando estén confirmados por la persona.
 */
export type Testimonial = {
  name: string;
  initials: string;
  role?: string;
  city?: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Alejandra García",
    initials: "AG",
    quote:
      "Había probado CRM y bases de datos con contactos incompletos. Con Kadesh encontré negocios reales, activos y listos para contactar. Ahora me enfoco en conversar y cerrar ventas.",
  },
];

/** Frase corta del mismo testimonio para la prueba social del hero. */
export const HERO_TESTIMONIAL = {
  name: "Alejandra García",
  quote: "Encontré negocios reales, activos y listos para contactar",
} as const;
