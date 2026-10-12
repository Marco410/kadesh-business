/**
 * Textos de ayuda (ícono ⓘ) de Analítica e Inicio. En un solo lugar para que quien lea Operaciones
 * sepa qué es cada número sin preguntar, y para cambiar la explicación sin buscar en cada pantalla.
 * Español sencillo: nada de "mediana" sin explicar, ni nombres técnicos.
 */

const MEDIAN = "La mitad tarda menos que eso y la otra mitad más (mediana).";

export const HELP = {
  // Inicio
  activeCompanies: "Empresas con su plan activo. No cuenta las cuentas de prueba interna.",
  trialCompanies: "Empresas usando la prueba gratis. Abajo dice cuántas vencen en 3 días o menos.",
  paymentIssues: "Empresas con un cobro vencido o sin pagar en Stripe. Hay que contactarlas antes de que pierdan el acceso.",
  mrr: "Ingreso mensual estimado: la suma de los planes activos convertidos a mes (un plan anual cuenta su precio entre 12).",
  signups: "Personas que se registraron en los últimos 7 días y cuántas empresas nuevas hay.",
  activeUsers7d: "Personas que entraron al panel en los últimos 7 días (iniciaron sesión o lo tuvieron abierto).",
  extractions24h: "Extracciones de leads de las últimas 24 horas y cuántas fallaron.",
  creditsMonth: "Créditos que gastaron todas las empresas este mes en extracciones e IA.",
  attention:
    "Empresas que necesitan algo de Kadesh: pagos, pruebas por vencer, sin créditos, errores, riesgo de baja u oportunidad de venta. Las rojas primero.",

  // Salud
  healthy: "Puntaje de 70 o más: usa Kadesh seguido y con su equipo.",
  watch: "Puntaje entre 40 y 69: lo usa, pero flojo. Conviene revisar.",
  risk: "Puntaje menor a 40: casi no usa Kadesh. Puede irse.",
  churnRisk:
    "Señales de que puede cancelar: pago vencido, nadie entra, su uso cayó mucho o su salud es baja. Llámales primero.",
  upsell:
    "Señales de que puede comprar más: se quedó sin créditos antes del día 20, vio módulos de otro plan o es una prueba con buen uso.",
  healthScore:
    "Puntaje de 0 a 100 con lo que hizo en las últimas 4 semanas. La flecha dice si su uso sube o baja contra las 2 semanas anteriores.",
  healthSignals: "El motivo de la alerta, en palabras: qué decir cuando le llames.",
  healthParts:
    "Cada barra es una parte del puntaje. Entre más llena, mejor. El detalle está abajo, en \"¿Cómo se calcula la salud?\".",
  healthTeam: "Cuántas personas del equipo entraron en las últimas 4 semanas y cuándo fue el último acceso.",

  // Activación
  activation: `De las empresas que se registraron en el periodo, qué parte llegó a cada paso y en cuántos días. ${MEDIAN} Cada paso se cuenta por separado: hay quien paga sin cotizar.`,
  activationByMonth:
    "Lo mismo, separado por el mes en que se registraron. Las más recientes han tenido menos tiempo, por eso suelen salir más bajo.",

  // Retención
  retention:
    "Cada fila son las empresas que se registraron ese mes. Cada columna dice qué parte usó Kadesh ese mes (Mes 0 es el de registro). Entre más naranja, más se quedaron.",

  // Uso
  dau: "Promedio de personas que abren el panel cada día, en los últimos 30 días.",
  wau: "Personas distintas que abrieron el panel en los últimos 7 días.",
  mau: "Personas distintas que abrieron el panel en los últimos 30 días.",
  stickiness:
    "Activas al día entre activas en el mes. 20% quiere decir que quien usa Kadesh entra, en promedio, 1 de cada 5 días.",
  activeCompanies7d: "Empresas con al menos una persona que abrió el panel en los últimos 7 días.",
  activeCompanies30d: "Empresas con al menos una persona que abrió el panel en los últimos 30 días.",
  dailyActive: "Cada barra es un día. Pasa el cursor (o toca) una barra para ver la fecha y cuántas personas entraron.",
  modules:
    "Qué parte de las empresas de cada plan usó cada módulo en los últimos 30 días. Sirve para ver qué se aprovecha y qué casi nadie usa.",
  sections: "Las secciones del panel que más se abren y cuántas personas distintas las abrieron.",

  // Demanda
  demandRuns: "Extracciones que terminaron bien en el periodo.",
  demandLow: "Las que trajeron el número de negocios elegido en \"Pocos =\" o menos.",
  demandGaps:
    "El mismo giro buscado 2 veces o más en la misma zona (un cuadro de unos 11 km) con pocos resultados. Ahí falta cobertura de Google Maps o INEGI, o el giro casi no existe.",
  demandCategories: "Giros con más extracciones flojas. \"Promedio\" = negocios que trajo cada extracción.",
  demandZones: "Zonas con más extracciones flojas y qué giros se buscaron ahí. Toca las coordenadas para verla en Google Maps.",

  // Adquisición
  acquisitionWithData:
    "Empresas de las que sabemos de dónde llegaron. Las que se registraron antes de empezar a medirlo salen como \"Sin dato\".",
  acquisitionPaid: "Parte de las empresas registradas que ya pagó algo (plan o recarga de créditos).",
  acquisitionChannels:
    "Canal = la campaña del enlace (utm_source); si no tiene, el sitio que la mandó; si no, \"Directo\". Con código de referido es \"Referido\". Extrajeron = hicieron al menos una extracción.",
  acquisitionLandings: "La primera página de Kadesh que vio la persona antes de registrarse.",
  acquisitionCampaigns: "El nombre de campaña (utm_campaign) de los enlaces de anuncios o correos.",

  // Ventas (velocidad comercial)
  salesHowTo:
    "Mide qué tan rápido mueven sus leads las empresas en el pipeline. Sale del historial de etapas, de las actividades y de los WhatsApp. Antes de la fecha de \"Datos desde\" no se guardaba el historial, así que lo de antes no aparece.",
  winRate:
    "De los tratos que se cerraron en el periodo, qué parte se ganó. Ganado = Propuesta aceptada o Cerrado ganado. Perdido = Propuesta rechazada, Cerrado perdido o Descartado.",
  salesCycle: `Días desde que el lead entró al pipeline hasta que se ganó. ${MEDIAN} Solo cuenta leads que vimos entrar desde el principio.`,
  wonValue: "Suma del valor estimado que capturaron en los tratos ganados. Si no lo llenan, cuenta 0.",
  firstContact: `Horas desde que el lead entró al pipeline hasta el primer contacto: moverlo a Contactado o más adelante, registrar una actividad o mandarle un WhatsApp. ${MEDIAN}`,
  contacted2d:
    "De los leads que entraron en el periodo, qué parte se contactó en sus primeras 48 horas. Una extracción mete muchos leads a la vez, así que es normal que salga bajo.",
  stalled:
    "Tratos abiertos (de Contactado a En negociación) que no cambian de etapa hace 14 días o más. Son los primeros a revisar.",
  waResponse: `Minutos que tarda el equipo en contestar cuando un lead escribe por WhatsApp. ${MEDIAN} Si el lead manda varios mensajes seguidos, cuentan como uno.`,
  waWithin1h: "De los mensajes de leads, qué parte se contestó en menos de una hora.",
  waReplyRate: "De las conversaciones que empezó la empresa, en cuántas contestó el lead dentro de 7 días.",
  stageEntered: "Leads que llegaron a esta etapa en el periodo.",
  stageAdvanced: "De esos, cuántos pasaron a una etapa más adelante. \"Sin respuesta\" cuenta igual que \"Contactado\".",
  stageLost: "De esos, cuántos se movieron a Propuesta rechazada, Cerrado perdido o Descartado.",
  stageDays: `Días que se quedaron en la etapa antes de moverse. ${MEDIAN} Solo cuenta los que ya salieron.`,
  stageStalled: "Siguen en esta etapa hace 14 días o más sin moverse.",
  salesCompanies: "Empresas con más tratos estancados primero. Toca una para abrir su 360.",
  salesStages: "Cada fila es una etapa del pipeline: cuántos leads llegaron, cuántos avanzaron o se perdieron y cuánto tardaron.",
} as const;
