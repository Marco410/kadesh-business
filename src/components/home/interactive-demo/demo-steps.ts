export type CursorPosition = { x: number; y: number };

export type DemoStep = {
  id: string;
  image: string;
  title: string;
  description: string;
  duration: number;
  cursor?: {
    from?: CursorPosition;
    to: CursorPosition;
    clickAtEnd?: boolean;
  };
};

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "init",
    image: "/images/demo/01-init.png",
    title: "Extracción B2B",
    description:
      "Abre la herramienta de extracción, elige categoría, radio y punto en el mapa.",
    duration: 2800,
    cursor: { from: { x: 88, y: 75 }, to: { x: 38, y: 24 } },
  },
  {
    id: "category",
    image: "/images/demo/02-category.png",
    title: "Elige la categoría",
    description:
      "Busca y selecciona el tipo de negocio que quieres prospectar, como Restaurantes.",
    duration: 3200,
    cursor: { from: { x: 38, y: 24 }, to: { x: 36, y: 32 }, clickAtEnd: true },
  },
  {
    id: "radius",
    image: "/images/demo/03-radius.png",
    title: "Define el radio",
    description:
      "Ajusta el rango en kilómetros y haz clic en el mapa para mover el centro de búsqueda.",
    duration: 3200,
    cursor: { from: { x: 36, y: 32 }, to: { x: 52, y: 55 }, clickAtEnd: true },
  },
  {
    id: "searching",
    image: "/images/demo/04-searching.png",
    title: "Busca leads",
    description:
      "Pulsa «Buscar Leads» y Kadesh extrae negocios reales desde Google Maps en segundos.",
    duration: 3500,
    cursor: { from: { x: 52, y: 55 }, to: { x: 72, y: 24 }, clickAtEnd: true },
  },
  {
    id: "results",
    image: "/images/demo/05-results.png",
    title: "Leads encontrados",
    description:
      "Recibe una notificación con los nuevos clientes y accede a ellos con un clic.",
    duration: 3200,
    cursor: { from: { x: 72, y: 24 }, to: { x: 82, y: 14 }, clickAtEnd: true },
  },
  {
    id: "clients-table",
    image: "/images/demo/06-clients-table.png",
    title: "Tabla de clientes",
    description:
      "Todos los leads quedan en tu CRM con teléfono, rating, pipeline y filtros listos.",
    duration: 3500,
    cursor: { from: { x: 82, y: 14 }, to: { x: 28, y: 58 }, clickAtEnd: true },
  },
  {
    id: "lead-detail",
    image: "/images/demo/07-lead-detail.png",
    title: "Detalle del lead",
    description:
      "Abre cualquier registro para ver datos de Google, redes sociales y comenzar la venta.",
    duration: 4000,
  },
];
