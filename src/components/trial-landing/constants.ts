import { PRO_PLAN_PUBLIC } from "kadesh/components/pricing/constants";

/**
 * Titular según el anuncio que trae a la persona (`/prueba?angulo=...`): lo que promete
 * el anuncio debe repetirse en el titular. Sin `angulo` (o uno desconocido) va el genérico.
 */
export const TRIAL_HEADLINES = {
  default:
    "Encuentra cientos de clientes para tu negocio, en tu ciudad, en menos de un minuto",
  radar: "Mira cómo salen 100 negocios de tu giro en tu ciudad, en segundos",
  bases: "Deja de llamar a bases de datos que ya no contestan",
  crm: "Todo tu equipo en un solo CRM, sin pagar por cada vendedor",
  ia: "Cada mañana, Kadesh AI te dice a quién llamar primero",
  ciudades:
    "Consigue clientes en Monterrey, CDMX o Guadalajara sin salir de tu oficina",
} as const;

export type TrialAngle = keyof typeof TRIAL_HEADLINES;

export function resolveTrialAngle(value: string | string[] | undefined): TrialAngle {
  const angle = Array.isArray(value) ? value[0] : value;
  return angle && angle in TRIAL_HEADLINES ? (angle as TrialAngle) : "default";
}

export const TRIAL_HERO_PERKS = [
  "70 créditos incluidos",
  "Sin tarjeta",
  "Listo en 1 minuto",
] as const;

export const TRIAL_CLOSE_PERKS = [
  "70 créditos incluidos",
  "Sin tarjeta",
  "Sin compromiso",
] as const;

export const TRIAL_PAINS = [
  "Pasas más tiempo buscando a quién llamar que llamando.",
  "Compraste una base de datos y la mitad de los números no existen.",
  "Tus vendedores trabajan, pero no sabes a quién le hablaron ni qué quedó pendiente.",
  "Pagas un CRM por cada usuario y aun así el seguimiento vive en libretas y en WhatsApp.",
] as const;

export const TRIAL_STEPS = [
  {
    title: "Elige tu zona en el mapa.",
    detail: "Tu ciudad, otra ciudad o un radio de pocos kilómetros.",
  },
  {
    title: "Elige el giro.",
    detail: "Dentistas, abogados, restaurantes, talleres y más de 150 giros.",
  },
  {
    title: "Recibe tus prospectos.",
    detail:
      "Llegan a tu CRM con teléfono, dirección y reseñas, listos para contactar.",
  },
] as const;

export const TRIAL_LEAD_FIELDS = [
  { label: "Teléfono", detail: "listo para llamar o mandar WhatsApp." },
  { label: "Dirección y mapa", detail: "sabes dónde está y si te queda cerca." },
  {
    label: "Calificación y reseñas de Google",
    detail: "prioriza a los que tienen más movimiento.",
  },
  { label: "Giro del negocio", detail: "filtra y segmenta tus campañas." },
  { label: "Sin repetidos", detail: "si ya lo tienes, no se vuelve a cobrar." },
] as const;

/**
 * Solo objeciones: son respaldo, no el argumento principal (por eso van en acordeón).
 * Falta «¿Qué pasa al terminar los 7 días?»: agregarla cuando se confirme qué pasa con
 * la cuenta y los prospectos (ver README).
 */
export const TRIAL_FAQ = [
  {
    question: "¿Es legal?",
    answer:
      "Sí. Usamos información pública que cualquier persona ve en Google Maps y en el directorio de INEGI. Es prospección B2B, no datos personales.",
  },
  {
    question: "¿Necesito tarjeta para probar?",
    answer:
      "No. Creas tu cuenta con tu correo y en un minuto ya estás buscando.",
  },
  {
    question: "¿Funciona en mi ciudad?",
    answer:
      "Si los negocios de tu giro aparecen en Google Maps, Kadesh los encuentra. Ya hay prospectos en más de 220 ciudades.",
  },
  {
    question: "¿Necesito saber de tecnología?",
    answer: "No. Si sabes usar Google Maps, sabes usar Kadesh.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Sí. Sin contratos ni penalizaciones.",
  },
  {
    question: "¿Qué es un crédito?",
    answer:
      "Cada prospecto que extraes usa 1 crédito. Kadesh AI también usa créditos: su resumen del día suele costar unos 4. Con los 70 de la prueba tienes para una buena primera lista y varios días de IA.",
  },
] as const;

export const TRIAL_PRICE_COPY = `Pruébalo 7 días con todas las funciones y 70 créditos, sin tarjeta. Si te convence, los planes empiezan en $399 al mes, y el plan Pro (el más vendido) te da ${PRO_PLAN_PUBLIC.leadLimit} negocios nuevos cada mes por $${PRO_PLAN_PUBLIC.monthlyMxn}.`;

export const TRIAL_DEMO_WHATSAPP_MESSAGE =
  "Hola KADESH, vengo de la página de prueba y me gustaría una demo de 15 minutos.";
