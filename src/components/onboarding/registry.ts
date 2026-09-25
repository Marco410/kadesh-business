import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai";
import { Routes } from "kadesh/core/routes";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import type { TourDefinition } from "./types";

/**
 * Fuente única de verdad de los tutoriales.
 * Toda sección/botón principal nuevo debe registrar aquí su paso y tener su `data-tour`
 * (ver README y `pnpm check:tours`).
 */

const PANEL_INICIO = `${Routes.panel}?tab=inicio`;
const PANEL_CLIENTES = `${Routes.panel}?tab=clientes`;

export const WELCOME_TOUR_ID = "welcome";

export const TOURS: TourDefinition[] = [
  {
    id: WELCOME_TOUR_ID,
    title: "Tutorial de bienvenida",
    version: 1,
    steps: [
      {
        title: "¡Bienvenido a Kadesh!",
        description:
          "En un minuto te mostramos cómo conseguir y registrar a tus clientes. Puedes salir cuando quieras y volver a verlo desde el botón de ayuda.",
      },
      {
        target: '[data-tour="main-tab-control"]',
        href: PANEL_INICIO,
        title: "Tu panel de control",
        description:
          "Aquí vive tu CRM: clientes, cotizaciones, espacios de trabajo y más.",
      },
      {
        target: '[data-tour="main-tab-extraccion"]',
        title: "Extracción B2B",
        description:
          "Busca negocios con teléfono según giro y zona para llenar tu lista de clientes.",
        when: ({ user }) => isAdminCompanyUser(user),
      },
      {
        target: '[data-tour="panel-credits"]',
        title: "Tus créditos",
        description:
          "Cada búsqueda consume créditos. Aquí ves cuántos te quedan y puedes comprar más.",
      },
      {
        target: '[data-tour="extraccion-buscar-leads"]',
        href: Routes.panel,
        title: "Busca nuevos clientes",
        description:
          "Elige giro y radio, y presiona Buscar leads para traer negocios a tu lista.",
        when: ({ user }) => isAdminCompanyUser(user),
      },
      {
        target: '[data-tour="nav-clientes"]',
        href: PANEL_CLIENTES,
        title: "Tus clientes",
        description:
          "Todos tus clientes y su avance en el pipeline están en esta sección.",
        side: "right",
      },
      {
        target: '[data-tour="clientes-add-lead"]',
        title: "Registra un cliente",
        description:
          "¿Ya tienes un cliente? Agrégalo tú mismo con este botón.",
      },
      {
        target: "#add-lead-name",
        href: Routes.panelAddLead,
        title: "Empieza por el nombre",
        description:
          "Con el nombre y la categoría del negocio ya puedes guardarlo; el resto lo completas después.",
      },
      {
        target: "#add-lead-phone",
        title: "Teléfono de contacto",
        description:
          "Con el teléfono podrás contactarlo y dar seguimiento desde Kadesh.",
      },
      {
        target: '[data-tour="nav-cotizaciones"]',
        href: PANEL_INICIO,
        title: "Cotizaciones",
        description: "Crea y comparte cotizaciones con tus clientes.",
        side: "right",
      },
      {
        target: '[data-tour="nav-workspaces"]',
        title: "Espacios de trabajo",
        description: "Organiza a tu equipo y tus clientes por espacio.",
        side: "right",
      },
      {
        target: '[data-tour="nav-ai"]',
        title: KADESH_URIM_AI_NAME,
        description:
          "Tu asistente de ventas: conoce tu negocio y te da un resumen y recomendaciones cada día.",
        side: "right",
      },
      {
        title: "¡Listo para empezar!",
        description:
          "Registra tu primer cliente. Si necesitas repasar algo, usa el botón de ayuda en cada sección.",
      },
    ],
  },
  {
    id: "extraccion",
    title: "Extracción B2B",
    version: 1,
    match: (pathname, tab) => pathname === Routes.panel && !tab,
    steps: [
      {
        target: "#obtener-clientes-category",
        title: "Giro del negocio",
        description: "Elige el tipo de negocio que quieres encontrar.",
      },
      {
        target: "#obtener-clientes-radius",
        title: "Radio de búsqueda",
        description: "Define qué tan lejos de tu ubicación quieres buscar.",
      },
      {
        target: '[data-tour="extraccion-buscar-leads"]',
        title: "Buscar leads",
        description:
          "Lanza la búsqueda. Los resultados llegan a tu lista de clientes y consumen créditos.",
      },
    ],
  },
  {
    id: "clientes",
    title: "Clientes",
    version: 1,
    match: (pathname, tab) => pathname === Routes.panel && tab === "clientes",
    steps: [
      {
        target: '[data-tour="clientes-add-lead"]',
        title: "Agregar cliente",
        description: "Registra manualmente un cliente nuevo.",
      },
      {
        target: ".clientes-band",
        title: "Filtra tu lista",
        description: "Encuentra clientes por estado, giro u otros filtros.",
      },
    ],
  },
  {
    id: "ai",
    title: KADESH_URIM_AI_NAME,
    version: 1,
    match: (pathname, tab) => pathname === Routes.panel && tab === "ai",
    steps: [
      {
        target: '[data-tour="ai-header"]',
        title: `Conoce a ${KADESH_URIM_AI_NAME}`,
        description:
          "Un asistente que ya conoce tu negocio y te ayuda a decidir qué hacer cada día con tus clientes.",
      },
      {
        target: '[data-tour="ai-tab-dashboard"]',
        title: "Dashboard",
        description:
          "Tu resumen del día, recomendaciones y lo que ya sabe de tu negocio.",
      },
      {
        target: '[data-tour="ai-tab-info"]',
        title: "Información",
        description:
          "Cuéntale qué vendes, a quién, cuánto cuesta y cómo trabajas. Mientras más completo, mejores recomendaciones.",
      },
      {
        target: '[data-tour="ai-tab-settings"]',
        title: "Configuración",
        description:
          "Elige cómo usarla: con tus créditos de Kadesh o con tu propia API key, y prueba que todo funcione.",
      },
    ],
  },
  {
    id: "calendar",
    title: "Mi Calendario",
    version: 3,
    match: (pathname, tab) => pathname === Routes.panel && tab === "calendar",
    steps: [
      {
        target: '[data-tour="nav-calendar"]',
        title: "Tu calendario",
        description:
          "Aquí ves tus actividades, seguimientos y propuestas, y los eventos que crees.",
        side: "right",
      },
      {
        target: '[data-tour="calendar-new-event"]',
        title: "Crea un evento",
        description:
          "Agrega reuniones o recordatorios. Se envían a los calendarios de Google que tengas seleccionados.",
      },
      {
        target: '[data-tour="calendar-google-toggle"]',
        title: "Conecta Google Calendar",
        description:
          "Conecta tu cuenta, elige qué calendarios ver y mantén todo sincronizado. Si eres administrador, también puedes conectar una cuenta compartida para todo el equipo.",
      },
      {
        target: '[data-tour="calendar-filters"]',
        title: "Elige qué ver",
        description:
          "Marca o desmarca actividades, propuestas, seguimientos, eventos y cada calendario de Google. Cada uno conserva su color.",
      },
    ],
  },
  {
    id: "agregar-cliente",
    title: "Agregar cliente",
    version: 1,
    match: (pathname) => pathname === Routes.panelAddLead,
    steps: [
      {
        target: "#add-lead-name",
        title: "Nombre del negocio",
        description: "Con el nombre y la categoría ya puedes guardar al cliente.",
      },
      {
        target: "#add-lead-category",
        title: "Categoría",
        description: "Ayuda a clasificar y filtrar tus clientes.",
      },
      {
        target: "#add-lead-phone",
        title: "Teléfono",
        description: "Te permite contactarlo desde Kadesh.",
      },
    ],
  },
];

export function getTour(id: string): TourDefinition | undefined {
  return TOURS.find((tour) => tour.id === id);
}

/** Tour de sección que aplica a la ubicación actual; si no hay, el de bienvenida. */
export function getTourForLocation(
  pathname: string,
  tab: string | null,
): TourDefinition {
  return (
    TOURS.find((tour) => tour.match?.(pathname, tab)) ??
    (getTour(WELCOME_TOUR_ID) as TourDefinition)
  );
}
