/**
 * Textos del ícono ⓘ del Resumen de Kadesh Pet. Misma idea que `admin/analytics/help.ts`:
 * español sencillo y en un solo lugar.
 */

const STATUS_RULE =
  "El estatus de cada animal es el de su registro más reciente en la bitácora (la fecha del estatus y, si empatan, la de alta).";

export const PET_HELP = {
  // Pendientes
  placeClaims: "Fichas que alguien reclamó como suyas y esperan que Kadesh las apruebe o rechace.",
  services: "Servicios nuevos que pidió una veterinaria y esperan aprobación antes de salir en su ficha.",
  events:
    "Eventos que mandó la comunidad (campañas, jornadas, ferias de adopción) o que editaron después de publicarse. No salen en Kadesh Pet hasta que alguien de Kadesh los aprueba.",
  facebookPending: "Animales que todavía no se publican en la página de Facebook de Kadesh Pet.",
  animalClaims:
    "Personas que piden quedarse con un reporte (por ejemplo, el dueño de un perro que subió un voluntario). Se resuelven desde Kadesh Pet; aquí solo se cuentan.",

  // Animales
  animalsTotal:
    "Animales registrados en Kadesh Pet. No cuenta los reportes repetidos que se unieron a otro. Abajo, cuántos se registraron en el periodo elegido.",
  lost: `Animales cuyo estatus actual es "Perdido". ${STATUS_RULE}`,
  found: `Animales cuyo estatus actual es "Encontrado": alguien lo vio o lo tiene y busca a su familia. ${STATUS_RULE}`,
  inAdoption: `Animales cuyo estatus actual es "En adopción". ${STATUS_RULE}`,
  home: `Animales que ya tienen hogar: su estatus actual es "En familia" (regresó a casa) o "Adoptado". ${STATUS_RULE}`,
  facebook: "Animales publicados en la página de Facebook de Kadesh Pet. Abajo, los que faltan.",
  animalsSeries:
    "Animales registrados por día, semana o mes (hora de Ciudad de México). La última barra es el periodo en curso y va más clara. Con desglose: por su estatus actual o por quién lo publicó.",
  byStatus: `Cuántos animales hay en cada estatus hoy. ${STATUS_RULE} "Sin estatus" = sin registro en la bitácora.`,
  typeAndOrigin:
    'Qué tipo de animal es y quién lo publicó: "Del admin" = una cuenta con rol de administrador (lo que sube Kadesh, por ejemplo desde Facebook). Dueño o voluntario lo elige quien reporta.',
  location:
    "Dónde están los animales según la ubicación de su registro más reciente en la bitácora. Se juntan nombres escritos con distintas mayúsculas.",
  engagement:
    "Vistas, favoritos y comentarios en las fichas de animales dentro del periodo elegido. Las vistas cuentan cada vez que se abre una ficha, con o sin sesión.",
  topViewed: "Los animales cuya ficha se abrió más veces en el periodo. Toca uno para ver su detalle.",

  // Veterinarias
  placesTotal:
    "Fichas del directorio (veterinarias, refugios, tiendas, hoteles, parques). Casi todas se importan solas de Google cuando alguien busca cerca.",
  veterinaries: "Fichas marcadas como tipo Veterinaria.",
  verified: "Fichas cuyo dueño o encargado ya se verificó con Kadesh y puede editarlas.",
  placesPending: "Fichas con un reclamo esperando revisión.",
  fromGoogle: "Fichas que se importaron de Google Maps.",
  reviews: "Reseñas en fichas del directorio (las de Google importadas y las de usuarios de Kadesh Pet).",
  placesSeries:
    'Altas = fichas nuevas en el directorio. Reclamadas = cuándo alguien pidió ser dueño (cuenta el último reclamo de cada ficha). Verificadas = cuándo Kadesh aprobó al dueño. Por día, semana o mes en hora de Ciudad de México.',
  claimStatus: "En qué paso del reclamo está cada ficha: sin reclamar, en revisión, verificada o rechazada.",
  placeTypes: "Tipos de lugar (una ficha puede tener más de uno) y los estados con más fichas.",

  // Usuarios
  usersTotal:
    "Cuentas creadas en Kadesh Pet. No cuenta cuentas de Kadesh Negocios (tienen empresa) ni cuentas de prueba.",
  usersSeries: "Cuentas nuevas de Kadesh Pet por día, semana o mes (hora de Ciudad de México).",
} as const;
