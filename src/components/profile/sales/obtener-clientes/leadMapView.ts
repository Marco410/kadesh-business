/** Última vista del mapa de extracción, en este navegador. */
const LEAD_MAP_VIEW_KEY = "kadesh.lead-map.view";

export interface LeadMapView {
  lat: number;
  lng: number;
  zoom: number;
  pinLat: number;
  pinLng: number;
}

function isCoord(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function readLeadMapView(): LeadMapView | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEAD_MAP_VIEW_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const view = parsed as Partial<LeadMapView>;
    if (
      !isCoord(view.lat, -90, 90) ||
      !isCoord(view.lng, -180, 180) ||
      !isCoord(view.zoom, 1, 22) ||
      !isCoord(view.pinLat, -90, 90) ||
      !isCoord(view.pinLng, -180, 180)
    ) {
      return null;
    }
    return {
      lat: view.lat,
      lng: view.lng,
      zoom: view.zoom,
      pinLat: view.pinLat,
      pinLng: view.pinLng,
    };
  } catch {
    return null;
  }
}

function writeLeadMapView(view: LeadMapView): void {
  try {
    window.localStorage.setItem(LEAD_MAP_VIEW_KEY, JSON.stringify(view));
  } catch {
    // Modo privado o cuota llena: el mapa sigue usable, solo no recuerda.
  }
}

export { readLeadMapView, writeLeadMapView };
