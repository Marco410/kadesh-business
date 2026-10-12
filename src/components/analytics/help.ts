/**
 * Ayudas (ícono ⓘ) de la Analítica del cliente. Hablan de "tu equipo" y "tus leads": las lee el
 * dueño o el vendedor, no Kadesh. Mismas reglas que Operaciones (kadesh-back `utils/analytics/salesVelocity.ts`).
 */

const MEDIAN = "La mitad tarda menos que eso y la otra mitad más.";

export const ANALYTICS_HELP = {
  guide:
    "Aquí ves qué tan rápido avanzan tus leads en el pipeline: cuántos cierras, en cuántos días, cuánto tardas en contactar y en contestar, y qué tratos se están quedando atrás. Se calcula solo con lo que registras en Kadesh: mueve tus leads de etapa para que los números sean reales.",
  winRate:
    "De los tratos que cerraste en el periodo, qué parte ganaste. Ganado = Propuesta aceptada o Cerrado ganado. Perdido = Propuesta rechazada, Cerrado perdido o Descartado.",
  salesCycle: `Días desde que un lead entra a tu pipeline hasta que lo ganas. ${MEDIAN}`,
  wonValue: "Suma del valor estimado de los tratos que ganaste. Llena el valor estimado en cada lead para que cuente.",
  stalled:
    "Tratos abiertos (de Contactado a En negociación) que no cambian de etapa hace 14 días o más. Revísalos abajo: son los que se pueden enfriar.",
  firstContact: `Horas desde que un lead entra a tu pipeline hasta el primer contacto: moverlo a Contactado o más adelante, registrar una actividad o mandarle un WhatsApp. ${MEDIAN}`,
  contacted2d:
    "De los leads que entraron en el periodo, qué parte contactaste en sus primeras 48 horas. Si extraes muchos a la vez, es normal que salga bajo.",
  waResponse: `Minutos que tardas en contestar cuando un cliente te escribe por WhatsApp. ${MEDIAN} Si te manda varios mensajes seguidos, cuentan como uno.`,
  waWithin1h: "De los mensajes de tus clientes, qué parte contestaste en menos de una hora.",
  waReplyRate: "De las conversaciones que empezaste, en cuántas te contestó el cliente dentro de 7 días.",
  stages:
    "Cada fila es una etapa de tu pipeline: cuántos leads llegaron, cuántos avanzaron o se perdieron y cuántos días se quedaron.",
  stageEntered: "Leads que llegaron a esta etapa en el periodo.",
  stageAdvanced: "Cuántos pasaron a una etapa más adelante. \"Sin respuesta\" cuenta igual que \"Contactado\".",
  stageLost: "Cuántos se movieron a Propuesta rechazada, Cerrado perdido o Descartado.",
  stageDays: `Días que se quedaron en la etapa antes de moverse. ${MEDIAN}`,
  stageStalled: "Siguen en esta etapa hace 14 días o más sin moverse.",
  team:
    "Los números de cada vendedor con los leads que tiene asignados hoy, más las actividades que registró y los WhatsApp que mandó en el periodo.",
  stalledList: "Tratos que no cambian de etapa hace 14 días o más, del más viejo al más nuevo. Toca uno para abrirlo.",
} as const;
