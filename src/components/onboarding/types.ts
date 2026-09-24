import type { AuthenticatedItem } from "kadesh/utils/types";

export type TourStatus = "completed" | "skipped";

export type TourProgressEntry = {
  status: TourStatus;
  at: string;
  version: number;
};

export type TourProgress = Record<string, TourProgressEntry>;

export type TourContext = {
  user: AuthenticatedItem | undefined;
};

export type TourStep = {
  /** Selector CSS del elemento a resaltar (`[data-tour="..."]` o un `#id`). Sin target = popover centrado. */
  target?: string;
  title: string;
  description: string;
  /** Ruta (con `?tab=`) que debe estar activa antes de mostrar el paso. */
  href?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** Si devuelve false el paso se omite (rol/plan). Los targets ausentes también se omiten. */
  when?: (ctx: TourContext) => boolean;
};

export type TourDefinition = {
  id: string;
  title: string;
  /** Súbela cuando los pasos cambien de forma relevante: el tour vuelve a ofrecerse. */
  version: number;
  steps: TourStep[];
  /** Tours de sección: indica si aplican a la ubicación actual (para el botón de ayuda contextual). */
  match?: (pathname: string, tab: string | null) => boolean;
};
