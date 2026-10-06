"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CenterFocusIcon,
  CheckmarkCircle02Icon,
  FilterHorizontalIcon,
  Location01Icon,
  MentoringIcon,
  Radar01Icon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import {
  GOOGLE_PLACE_CATEGORIES,
  INEGI_DENUE_CATEGORIES,
  getInegiDenueKeyword,
  toInegiDenueKeyword,
} from "kadesh/constants/constans";
import {
  useSyncLeadsArea,
  type LeadSyncSource,
} from "kadesh/components/profile/sales/obtener-clientes/hooks";
import RoleAccessDeniedSection from "../RoleAccessDeniedSection";
import { useIsClient } from "kadesh/utils/useIsClient";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import {
  Autocomplete,
  type AutocompleteOption,
} from "kadesh/components/shared";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import LeadsStatsCards, { type LeadsStatsCardsHandle } from "./LeadsStatsCards";
import LeadMapCategoryPanel from "./LeadMapCategoryPanel";
import { GoogleMapsMark, InegiMark } from "./SourceMarks";
import { useCompanyLeadLocations } from "./hooks/useCompanyLeadLocations";
import {
  UNCATEGORIZED_LEAD_CATEGORY,
  buildLeadCategoryStats,
  clientDotRadius,
  readLeadCoordinate,
} from "./leadCategoryColors";
import { readLeadMapView, writeLeadMapView } from "./leadMapView";
import { useFitLeadMapStage } from "./useFitLeadMapStage";

const GOOGLE_CATEGORY_OPTIONS: AutocompleteOption[] =
  GOOGLE_PLACE_CATEGORIES.map((opt) => ({
    id: opt.value,
    label: opt.label,
  }));

const INEGI_CATEGORY_OPTIONS: AutocompleteOption[] = INEGI_DENUE_CATEGORIES.map(
  (opt) => ({
    id: opt.id,
    label: opt.label,
  }),
);

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
const MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js";
const MAPLIBRE_LEAFLET_JS =
  "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js";

/** Liberty en ambos modos; el aspecto dark se logra con filtros CSS (estilo Google dark). */
const LEAD_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function getLeadMapStyle(): string {
  return LEAD_MAP_STYLE;
}

const LEAD_MAP_PIN_SIZE = { width: 36, height: 44 } as const;

function createLeadMapPinIcon(L: NonNullable<Window["L"]>) {
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44" aria-hidden="true">
      <path
        fill="#e07c3a"
        stroke="#ffffff"
        stroke-width="2"
        d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
      />
      <circle cx="18" cy="15" r="5.5" fill="#ffffff" />
      <circle cx="18" cy="15" r="3" fill="#f7945e" />
    </svg>
  `.trim();

  return L.divIcon({
    className: "lead-map-pin-icon",
    html: pinSvg,
    iconSize: [LEAD_MAP_PIN_SIZE.width, LEAD_MAP_PIN_SIZE.height],
    iconAnchor: [LEAD_MAP_PIN_SIZE.width / 2, LEAD_MAP_PIN_SIZE.height],
  });
}

function raiseLeadMapOverlays(
  marker: LeafletMarker | null,
  circle: LeafletCircle | null,
) {
  circle?.bringToFront?.();
  marker?.bringToFront?.();
}

function sortPointsFromCenter<T extends { lat: number; lng: number }>(
  points: readonly T[],
  center: { lat: number; lng: number },
): T[] {
  return [...points].sort((a, b) => {
    const da = (a.lat - center.lat) ** 2 + (a.lng - center.lng) ** 2;
    const db = (b.lat - center.lat) ** 2 + (b.lng - center.lng) ** 2;
    return da - db;
  });
}

/** El velo sigue hasta que las calles están pintadas, no solo hasta que carga el script. */
function watchLeadMapFirstPaint(
  getLayer: () => LeafletTileLayer | null,
  onPainted: () => void,
): () => void {
  let disposed = false;
  let painted = false;
  let pollId = 0;
  let timeoutId = 0;
  let bound: MapLibreMapHandle | null = null;
  let onSignal: (() => void) | null = null;

  const finish = () => {
    if (disposed || painted) return;
    painted = true;
    window.clearTimeout(timeoutId);
    window.clearInterval(pollId);
    if (bound && onSignal) {
      try {
        bound.off("idle", onSignal);
        bound.off("load", onSignal);
      } catch {
        // El mapa ya no está; igual hay que quitar el velo.
      }
    }
    onPainted();
  };

  const bind = () => {
    if (disposed || bound) return;
    const gl = getLayer()?.getMaplibreMap?.();
    if (!gl || typeof gl.loaded !== "function" || typeof gl.on !== "function") {
      return;
    }
    bound = gl;
    onSignal = () => {
      try {
        if (!gl.loaded()) return;
      } catch {
        return;
      }
      finish();
    };
    try {
      gl.on("load", onSignal);
      gl.on("idle", onSignal);
      onSignal();
    } catch {
      bound = null;
      onSignal = null;
    }
  };

  timeoutId = window.setTimeout(finish, MAP_PAINT_TIMEOUT_MS);
  bind();
  if (!bound) {
    pollId = window.setInterval(() => {
      bind();
      if (bound) window.clearInterval(pollId);
    }, 50);
  }

  return () => {
    disposed = true;
    window.clearTimeout(timeoutId);
    window.clearInterval(pollId);
    if (bound && onSignal) {
      bound.off("idle", onSignal);
      bound.off("load", onSignal);
    }
  };
}

function isDarkMapTheme(resolvedTheme: string | undefined): boolean {
  if (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  ) {
    return true;
  }
  return resolvedTheme === "dark";
}

function applyLeadMapThemeClass(
  container: HTMLElement | null,
  resolvedTheme: string | undefined,
) {
  if (!container) return;
  const isDark = isDarkMapTheme(resolvedTheme);
  container.classList.toggle("lead-exploration-map--night", isDark);
  container.classList.toggle("lead-exploration-map--standard", !isDark);
}

/** Ciudad de México — ubicación por defecto al cargar el mapa */
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };
const DEFAULT_ZOOM = 10;
/** Si las calles no avisan, el velo no se queda para siempre. */
const MAP_PAINT_TIMEOUT_MS = 8000;
/** Si el velo sigue, el usuario puede recargar la página. */
const MAP_RELOAD_BUTTON_DELAY_MS = 5000;
/** El mapa se lee primero; los puntos entran cuando el velo ya se está yendo. */
const CLIENT_DOTS_REVEAL_DELAY_MS = 420;
const CLIENT_DOTS_INTRO_MS = 680;
/** Tras una búsqueda, cada cliente nuevo se pinta desde el centro, no todos a la vez. */
const SEARCH_DOT_STAGGER_MS = 48;
const SEARCH_DOTS_MAX_MS = 2600;
/** Un anillo llega al borde del radio y el siguiente ya salió. */
const SEARCH_RADAR_RING_COUNT = 3;
const DEFAULT_RADIUS_KM = 5;
const RADIUS_OPTIONS_KM = [2, 5, 10, 25, 50] as const;
/** DENUE en vivo no pasa de 5 km; el catálogo en BD sí admite radios mayores, pero aquí solo ofrecemos 2 y 5. */
const INEGI_RADIUS_OPTIONS_KM = [2, 5] as const;

const LEAD_SOURCE_TOGGLE = [
  { id: "google" as const, label: "Google Maps", Mark: GoogleMapsMark },
  { id: "inegi" as const, label: "INEGI", Mark: InegiMark },
];
const CUSTOM_SEARCH_MIN_LENGTH = 2;
const CUSTOM_SEARCH_MAX_LENGTH = 80;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]";

const MOTION_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

function segmentClass(isActive: boolean) {
  return `relative inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING} ${
    isActive
      ? "text-orange-700 dark:text-orange-300"
      : "text-[#424242] hover:bg-[#f8f8f8] dark:text-[#e0e0e0] dark:hover:bg-white/5"
  }`;
}

function getWiderRadius(
  current: number,
  options: readonly number[],
): number | null {
  return options.find((km) => km > current) ?? null;
}

function formatSecondarySearchStats(
  stats: {
    alreadyInDb: number;
    skippedLowRating: number;
    source: LeadSyncSource;
  } | null,
): string | null {
  if (!stats) return null;
  const parts: string[] = [];
  if (stats.alreadyInDb > 0) {
    parts.push(`${stats.alreadyInDb} ya en base`);
  }
  if (stats.source === "google" && stats.skippedLowRating > 0) {
    parts.push(`${stats.skippedLowRating} omitidos por rating`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function sanitizeBusinessSearchTerm(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s&.,\-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, CUSTOM_SEARCH_MAX_LENGTH);
}

function normalizeBusinessSearchTerm(value: string): string {
  return sanitizeBusinessSearchTerm(value).trim();
}

function isBusinessSearchTermValid(value: string): boolean {
  if (value.length < CUSTOM_SEARCH_MIN_LENGTH) return false;
  return /[\p{L}\p{N}]/u.test(value);
}

function loadExternalResource(
  tag: "link" | "script",
  attrs: Record<string, string>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrKey = tag === "link" ? "href" : "src";
    const attrVal = attrs[attrKey];
    const existing = document.querySelector(`${tag}[${attrKey}="${attrVal}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${tag}`));
    document.head.appendChild(el);
  });
}

interface LeafletDivIcon {
  options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  };
}
interface LeafletLayer {
  addTo(map: LeafletMap): void;
  remove(): void;
  bringToBack?(): LeafletLayer;
  bringToFront?(): LeafletLayer;
}
interface LeafletTileLayer extends LeafletLayer {
  getMaplibreMap?: () => MapLibreMapHandle | undefined;
}
interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  getZoom(): number;
  fitBounds(bounds: unknown, options?: { padding?: [number, number] }): void;
  on(
    event: string,
    fn: (e: { latlng: { lat: number; lng: number } }) => void,
  ): void;
  off(
    event: string,
    fn: (e: { latlng: { lat: number; lng: number } }) => void,
  ): void;
  getCenter(): { lat: number; lng: number };
  removeLayer(layer: LeafletTileLayer): LeafletMap;
  invalidateSize(): void;
  remove(): void;
  createPane(name: string): void;
  getPane(name: string): HTMLElement | undefined;
}
interface MapLibreMapHandle {
  loaded(): boolean;
  on(event: string, fn: () => void): void;
  off(event: string, fn: () => void): void;
}
interface LeafletCircleMarker {
  setRadius(radius: number): void;
  setStyle(style: { fillColor?: string; radius?: number }): void;
  addTo(layer: LeafletLayerGroup): LeafletCircleMarker;
}
interface LeafletLayerGroup {
  addTo(map: LeafletMap): LeafletLayerGroup;
  clearLayers(): void;
  removeLayer(layer: LeafletCircleMarker): void;
}
interface LeafletMarker {
  setLatLng(latlng: [number, number]): LeafletMarker;
  addTo(map: LeafletMap): LeafletMarker;
  bringToFront?(): LeafletMarker;
  remove(): void;
}
interface LeafletSvgRenderer {
  readonly kind?: "svg";
}
interface LeafletCircle {
  setLatLng(latlng: [number, number]): LeafletCircle;
  setRadius(m: number): LeafletCircle;
  getBounds(): unknown;
  addTo(map: LeafletMap): LeafletCircle;
  bringToFront?(): LeafletCircle;
  remove(): void;
}
declare global {
  interface Window {
    L?: {
      map(el: HTMLElement, options?: { preferCanvas?: boolean }): LeafletMap;
      divIcon(options: {
        className: string;
        html: string;
        iconSize: [number, number];
        iconAnchor: [number, number];
      }): LeafletDivIcon;
      marker(
        latlng: [number, number],
        options?: { icon: LeafletDivIcon },
      ): LeafletMarker;
      svg(): LeafletSvgRenderer;
      circle(
        latlng: [number, number],
        options: {
          radius: number;
          color?: string;
          fillColor?: string;
          fillOpacity?: number;
          opacity?: number;
          weight?: number;
          dashArray?: string;
          className?: string;
          interactive?: boolean;
          renderer?: LeafletSvgRenderer;
        },
      ): LeafletCircle;
      circleMarker(
        latlng: [number, number],
        options: {
          pane?: string;
          radius: number;
          color?: string;
          opacity?: number;
          fillColor?: string;
          fillOpacity?: number;
          weight?: number;
          interactive?: boolean;
        },
      ): LeafletCircleMarker;
      layerGroup(): LeafletLayerGroup;
      tileLayer(
        url: string,
        options: { attribution: string; subdomains?: string; maxZoom?: number },
      ): LeafletTileLayer;
      maplibreGL(options: { style: string; pane?: string }): LeafletTileLayer;
    };
  }
}

export default function ObtenerClientesSection({
  onLeadsSyncSuccess,
}: {
  onLeadsSyncSuccess?: () => void | Promise<void>;
} = {}) {
  const [searchMode, setSearchMode] = useState<"category" | "custom">(
    "category",
  );
  const [leadSource, setLeadSource] = useState<LeadSyncSource>("google");
  const [category, setCategory] = useState("");
  const [customSearch, setCustomSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM);
  const [minRating, setMinRating] = useState<number>(0);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pin, setPin] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [stats, setStats] = useState<{
    created: number;
    alreadyInDb: number;
    skippedLowRating: number;
    source: LeadSyncSource;
  } | null>(null);
  const [showZeroResultsHint, setShowZeroResultsHint] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapVisualReady, setMapVisualReady] = useState(false);
  const [pinIntro, setPinIntro] = useState(false);
  const [showMapReload, setShowMapReload] = useState(false);
  const [clientDotsReady, setClientDotsReady] = useState(false);
  const [mapEpoch, setMapEpoch] = useState(0);
  const [locatingUser, setLocatingUser] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const {
    syncLeadsArea,
    loading: isLoading,
    error: syncError,
  } = useSyncLeadsArea();
  const { user, loading: userLoading } = useUser();
  const canExtractLeads = isAdminCompanyUser(user);
  const { leads: companyLeads, refetch: refetchMapLeads } =
    useCompanyLeadLocations(canExtractLeads && !userLoading);
  const { resolvedTheme } = useTheme();
  const themeMounted = useIsClient();
  const reduceMotion = useReducedMotion();
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: MOTION_EASE };

  const statsRef = useRef<LeadsStatsCardsHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const invalidateMapSize = useCallback(() => {
    mapRef.current?.invalidateSize();
  }, []);
  const setMapStage = useFitLeadMapStage(invalidateMapSize);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const radiusRendererRef = useRef<LeafletSvgRenderer | null>(null);
  const clientDotsRef = useRef<LeafletLayerGroup | null>(null);
  const dotsIntroPlayedRef = useRef(false);
  const paintIncomingRef = useRef(false);
  const markersByIdRef = useRef<Map<string, LeafletCircleMarker>>(new Map());
  const pinRef = useRef(pin);
  pinRef.current = pin;
  /** El pin restaurado no debe volver a centrar el mapa encima de la última vista. */
  const restoredPinRef = useRef<{ lat: number; lng: number } | null>(null);
  const filtersPopoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const applyLeadMapBaseLayer = useCallback(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L?.maplibreGL || !map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const baseLayer = L.maplibreGL({
      style: getLeadMapStyle(),
      pane: "leadMapBase",
    });
    baseLayer.addTo(map);
    baseLayer.bringToBack?.();
    tileLayerRef.current = baseLayer;

    raiseLeadMapOverlays(markerRef.current, circleRef.current);
  }, []);

  useEffect(() => {
    if (!themeMounted || !leafletReady || !mapRef.current) return;
    applyLeadMapThemeClass(mapContainerRef.current, resolvedTheme);
    raiseLeadMapOverlays(markerRef.current, circleRef.current);
  }, [themeMounted, leafletReady, resolvedTheme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadExternalResource("link", {
          rel: "stylesheet",
          href: LEAFLET_CSS,
        });
        await loadExternalResource("link", {
          rel: "stylesheet",
          href: MAPLIBRE_CSS,
        });
        await loadExternalResource("script", { src: LEAFLET_JS });
        await loadExternalResource("script", { src: MAPLIBRE_JS });
        await loadExternalResource("script", { src: MAPLIBRE_LEAFLET_JS });
        if (!cancelled) setLeafletReady(true);
      } catch (e) {
        console.error("Leaflet load error", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateMapOverlays = useCallback(
    (lat: number, lng: number, rKm: number, recenter = true) => {
      const L = window.L;
      const map = mapRef.current;
      if (!L || !map) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: createLeadMapPinIcon(L),
        }).addTo(map);
      }

      if (!radiusRendererRef.current && L.svg) {
        radiusRendererRef.current = L.svg();
      }

      const radiusM = rKm * 1000;
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]).setRadius(radiusM);
      } else {
        circleRef.current = L.circle([lat, lng], {
          radius: radiusM,
          renderer: radiusRendererRef.current ?? undefined,
          className: "lead-map-radius",
          color: "#e07c3a",
          fillColor: "#f7945e",
          fillOpacity: 0.14,
          weight: 3,
          dashArray: "6, 6",
        }).addTo(map);
      }

      raiseLeadMapOverlays(markerRef.current, circleRef.current);

      if (!recenter) return;

      const currentZoom = map.getZoom();
      map.setView([lat, lng], currentZoom);
    },
    [],
  );

  useEffect(() => {
    const L = window.L;
    const container = mapContainerRef.current;
    if (!leafletReady || !container || !L) return;

    const storedView = readLeadMapView();
    const cameraLat = storedView?.lat ?? DEFAULT_CENTER.lat;
    const cameraLng = storedView?.lng ?? DEFAULT_CENTER.lng;
    const cameraZoom = storedView?.zoom ?? DEFAULT_ZOOM;
    const pinLat = storedView?.pinLat ?? DEFAULT_CENTER.lat;
    const pinLng = storedView?.pinLng ?? DEFAULT_CENTER.lng;
    const restoredPin = { lat: pinLat, lng: pinLng };

    const map = L.map(container, { preferCanvas: true }).setView(
      [cameraLat, cameraLng],
      cameraZoom,
    );
    mapRef.current = map;
    pinRef.current = restoredPin;
    restoredPinRef.current = restoredPin;
    setPin(restoredPin);

    map.createPane("leadMapBase");
    const basePane = map.getPane("leadMapBase");
    if (basePane) {
      basePane.style.zIndex = "200";
    }

    map.createPane("leadClients");
    const clientsPane = map.getPane("leadClients");
    if (clientsPane) {
      clientsPane.style.zIndex = "400";
      clientsPane.style.pointerEvents = "none";
    }
    clientDotsRef.current = L.layerGroup().addTo(map);
    setMapEpoch((epoch) => epoch + 1);

    applyLeadMapBaseLayer();
    applyLeadMapThemeClass(container, resolvedTheme);
    setMapVisualReady(false);

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      pinRef.current = { lat, lng };
      setPin({ lat, lng });
    });

    updateMapOverlays(pinLat, pinLng, radiusKm, false);

    const persistView = () => {
      const center = map.getCenter();
      const currentPin = pinRef.current;
      writeLeadMapView({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom(),
        pinLat: currentPin.lat,
        pinLng: currentPin.lng,
      });
    };
    map.on("moveend", persistView);

    const stopWatchingPaint = watchLeadMapFirstPaint(
      () => tileLayerRef.current,
      () => setMapVisualReady(true),
    );

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      stopWatchingPaint();
      map.off("moveend", persistView);
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      radiusRendererRef.current = null;
      clientDotsRef.current = null;
      markersByIdRef.current.clear();
    };
  }, [leafletReady, updateMapOverlays, applyLeadMapBaseLayer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mapVisualReady) {
      setShowMapReload(false);
      return;
    }
    const reloadId = window.setTimeout(
      () => setShowMapReload(true),
      MAP_RELOAD_BUTTON_DELAY_MS,
    );
    return () => window.clearTimeout(reloadId);
  }, [mapVisualReady]);

  useEffect(() => {
    if (!mapVisualReady) {
      setClientDotsReady(false);
      return;
    }
    if (reduceMotion) {
      setClientDotsReady(true);
      return;
    }
    const revealId = window.setTimeout(
      () => setClientDotsReady(true),
      CLIENT_DOTS_REVEAL_DELAY_MS,
    );
    return () => window.clearTimeout(revealId);
  }, [mapVisualReady, reduceMotion]);

  useEffect(() => {
    if (!pin || !mapRef.current) return;
    const restored = restoredPinRef.current;
    if (restored) {
      if (restored.lat === pin.lat && restored.lng === pin.lng) {
        restoredPinRef.current = null;
        updateMapOverlays(pin.lat, pin.lng, radiusKm, false);
      }
      return;
    }
    updateMapOverlays(pin.lat, pin.lng, radiusKm);
  }, [pin, radiusKm, updateMapOverlays]);

  useEffect(() => {
    if (!mapVisualReady || reduceMotion) {
      setPinIntro(false);
      return;
    }
    setPinIntro(true);
    const introId = window.setTimeout(() => setPinIntro(false), 560);
    return () => window.clearTimeout(introId);
  }, [mapVisualReady, reduceMotion]);

  useEffect(() => {
    if (!isLoading || reduceMotion || mapEpoch === 0) return;
    const L = window.L;
    const map = mapRef.current;
    const renderer = radiusRendererRef.current;
    if (!L || !map || !renderer) return;

    const { lat, lng } = pinRef.current;
    const radiusM = radiusKm * 1000;
    const rings = Array.from({ length: SEARCH_RADAR_RING_COUNT }, (_, index) =>
      L.circle([lat, lng], {
        radius: radiusM,
        renderer,
        className: `lead-map-search-ring lead-map-search-ring--${index}`,
        color: "#e07c3a",
        fillColor: "#f7945e",
        fillOpacity: 0.08,
        opacity: 1,
        weight: 2,
        interactive: false,
      }).addTo(map),
    );

    return () => {
      rings.forEach((ring) => ring.remove());
    };
  }, [isLoading, reduceMotion, radiusKm, pin, mapEpoch]);

  const categoryStats = useMemo(
    () => buildLeadCategoryStats(companyLeads),
    [companyLeads],
  );

  const mapPoints = useMemo(() => {
    const colorByCategory = new Map(
      categoryStats.categories.map((item) => [item.category, item.hex]),
    );
    const points: { id: string; lat: number; lng: number; color: string }[] =
      [];
    for (const lead of companyLeads) {
      const key = lead.category ?? UNCATEGORIZED_LEAD_CATEGORY;
      if (hiddenCategories.has(key)) continue;
      const coord = readLeadCoordinate(lead.lat, lead.lng);
      if (!coord) continue;
      points.push({
        id: lead.id,
        lat: coord.lat,
        lng: coord.lng,
        color: colorByCategory.get(key) ?? "#9e9e9e",
      });
    }
    return points;
  }, [companyLeads, categoryStats.categories, hiddenCategories]);

  useEffect(() => {
    if (!clientDotsReady) return;
    const L = window.L;
    const map = mapRef.current;
    const group = clientDotsRef.current;
    if (!L?.circleMarker || !map || !group || mapEpoch === 0) return;

    const markers = markersByIdRef.current;
    const radiusNow = () => clientDotRadius(map.getZoom());
    const visibleIds = new Set(mapPoints.map((point) => point.id));

    for (const [id, marker] of markers) {
      if (visibleIds.has(id)) continue;
      group.removeLayer(marker);
      markers.delete(id);
    }

    for (const point of mapPoints) {
      const marker = markers.get(point.id);
      if (!marker) continue;
      marker.setStyle({ fillColor: point.color, radius: radiusNow() });
    }

    const fresh = mapPoints.filter((point) => !markers.has(point.id));
    const paintSearch =
      paintIncomingRef.current && fresh.length > 0 && !reduceMotion;
    const paintIntro =
      !paintSearch &&
      !dotsIntroPlayedRef.current &&
      fresh.length > 0 &&
      !reduceMotion;

    const addPoint = (point: (typeof mapPoints)[number]) => {
      if (markers.has(point.id)) return;
      markers.set(
        point.id,
        L.circleMarker([point.lat, point.lng], {
          pane: "leadClients",
          radius: radiusNow(),
          weight: 1,
          color: "#ffffff",
          opacity: 0.85,
          fillColor: point.color,
          fillOpacity: 0.7,
          interactive: false,
        }).addTo(group),
      );
    };

    const onZoom = () => {
      const nextRadius = clientDotRadius(map.getZoom());
      for (const marker of markers.values()) marker.setRadius(nextRadius);
    };
    map.on("zoomend", onZoom);

    let cancelled = false;
    let raf = 0;

    if (!paintSearch && !paintIntro) {
      for (const point of fresh) addPoint(point);
      raiseLeadMapOverlays(markerRef.current, circleRef.current);
    } else {
      const ordered = sortPointsFromCenter(
        fresh,
        paintSearch ? pinRef.current : map.getCenter(),
      );
      const duration = paintSearch
        ? Math.min(
            SEARCH_DOTS_MAX_MS,
            Math.max(640, ordered.length * SEARCH_DOT_STAGGER_MS),
          )
        : CLIENT_DOTS_INTRO_MS;
      let cursor = 0;

      const step = (now: number, startedAt: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = paintSearch ? progress : 1 - (1 - progress) ** 3;
        const targetCount =
          progress >= 1
            ? ordered.length
            : Math.max(1, Math.ceil(ordered.length * eased));
        while (cursor < targetCount) {
          const point = ordered[cursor];
          cursor += 1;
          if (point) addPoint(point);
        }
        if (cursor < ordered.length) {
          raf = requestAnimationFrame((next) => step(next, startedAt));
          return;
        }
        raiseLeadMapOverlays(markerRef.current, circleRef.current);
      };

      raf = requestAnimationFrame((now) => {
        if (cancelled) return;
        if (paintSearch) paintIncomingRef.current = false;
        if (paintIntro || paintSearch) dotsIntroPlayedRef.current = true;
        step(now, now);
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      map.off("zoomend", onZoom);
    };
  }, [mapEpoch, mapPoints, clientDotsReady, reduceMotion]);

  const toggleMapCategory = useCallback((category: string) => {
    setHiddenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const showAllMapCategories = useCallback(() => {
    setHiddenCategories(new Set());
  }, []);

  const hideAllMapCategories = useCallback(() => {
    setHiddenCategories(
      new Set(categoryStats.categories.map((item) => item.category)),
    );
  }, [categoryStats.categories]);

  useEffect(() => {
    if (!showAdvancedFilters) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        filtersPopoverRef.current &&
        !filtersPopoverRef.current.contains(event.target as Node)
      ) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showAdvancedFilters]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showAdvancedFilters) {
        setShowAdvancedFilters(false);
        return;
      }
      if (hasSearched && !resultDismissed) {
        setResultDismissed(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showAdvancedFilters, hasSearched, resultDismissed]);

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      sileo.error({ title: "Tu navegador no soporta geolocalización" });
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nextPin = { lat: latitude, lng: longitude };
        pinRef.current = nextPin;
        setPin(nextPin);
        mapRef.current?.setView([latitude, longitude], 8);
        setLocatingUser(false);
      },
      () => {
        sileo.error({
          title:
            "No se pudo obtener tu ubicación. Verifica los permisos del navegador.",
        });
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const centerOnMexicoCity = useCallback(() => {
    pinRef.current = DEFAULT_CENTER;
    setPin(DEFAULT_CENTER);
    mapRef.current?.setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM,
    );
  }, []);

  const radiusOptions =
    leadSource === "inegi" ? INEGI_RADIUS_OPTIONS_KM : RADIUS_OPTIONS_KM;
  const showRatingFilters = leadSource === "google";
  const categoryOptions =
    leadSource === "inegi" ? INEGI_CATEGORY_OPTIONS : GOOGLE_CATEGORY_OPTIONS;
  const filtersActive = showRatingFilters && (minRating > 0 || minReviews > 0);
  const widerRadiusKm = getWiderRadius(radiusKm, radiusOptions);
  const activeSearchLabel =
    searchMode === "custom"
      ? normalizeBusinessSearchTerm(customSearch)
      : leadSource === "inegi"
        ? (INEGI_DENUE_CATEGORIES.find((c) => c.id === category)?.label ??
          category)
        : (GOOGLE_PLACE_CATEGORIES.find((c) => c.value === category)?.label ??
          category);
  const showResultPanel =
    hasSearched &&
    !resultDismissed &&
    Boolean(stats || showZeroResultsHint || message);
  const secondarySearchStats = formatSecondarySearchStats(stats);
  const createdCount = stats?.created ?? 0;

  const selectLeadSource = (next: LeadSyncSource) => {
    setLeadSource(next);
    setCategory("");
    setShowAdvancedFilters(false);
    if (
      next === "inegi" &&
      !(INEGI_RADIUS_OPTIONS_KM as readonly number[]).includes(radiusKm)
    ) {
      setRadiusKm(DEFAULT_RADIUS_KM);
    }
  };

  const runSync = async () => {
    setMessage(null);
    setStats(null);
    setShowZeroResultsHint(false);
    setResultDismissed(false);

    const rawSearchTerm =
      searchMode === "custom"
        ? normalizeBusinessSearchTerm(customSearch)
        : category;

    if (!rawSearchTerm) {
      sileo.error({
        title:
          searchMode === "category"
            ? "Selecciona una categoría"
            : "Escribe qué tipo de negocio buscas",
      });
      return;
    }
    if (searchMode === "custom" && !isBusinessSearchTermValid(rawSearchTerm)) {
      sileo.error({
        title: "Búsqueda no válida",
        description: `Escribe al menos ${CUSTOM_SEARCH_MIN_LENGTH} caracteres usando letras.`,
      });
      return;
    }

    const categoryForApi =
      leadSource === "inegi"
        ? searchMode === "custom"
          ? toInegiDenueKeyword(rawSearchTerm)
          : getInegiDenueKeyword(rawSearchTerm)
        : rawSearchTerm;

    const categoryLabel =
      searchMode === "custom"
        ? rawSearchTerm
        : leadSource === "inegi"
          ? (INEGI_DENUE_CATEGORIES.find((c) => c.id === category)?.label ??
            category)
          : (GOOGLE_PLACE_CATEGORIES.find((c) => c.value === category)?.label ??
            category);

    const fetchData = async () => {
      const result = await syncLeadsArea({
        source: leadSource,
        lat: pin.lat,
        lng: pin.lng,
        radiusKm,
        category: categoryForApi,
        maxResults: 60,
        ...(leadSource === "google"
          ? {
              minRating: minRating > 0 ? minRating : null,
              minReviews: minReviews > 0 ? minReviews : null,
            }
          : {}),
      });

      if (!result) {
        throw new Error(syncError?.message ?? "Error al sincronizar");
      }

      if (!result.success) {
        throw new Error(result.message ?? "Error al sincronizar");
      }

      const created = result.created ?? 0;
      const alreadyInDb = result.alreadyInDb ?? 0;
      const skipped = result.skippedLowRating ?? 0;
      const syncedLeadsCount = result.syncedLeadsCount ?? 0;

      setMessage({
        type: "ok",
        text: result.message ?? "Sincronización completada",
      });
      setStats({
        created,
        alreadyInDb,
        skippedLowRating: skipped,
        source: leadSource,
      });
      setHasSearched(true);
      setShowZeroResultsHint(syncedLeadsCount === 0);

      if (syncedLeadsCount > 0) {
        paintIncomingRef.current = true;
        void refetchMapLeads();
        statsRef.current?.refetch();
      }

      void onLeadsSyncSuccess?.();

      return { syncedLeadsCount, categoryLabel };
    };

    sileo.promise(fetchData(), {
      loading: {
        title: `Buscando leads de ${categoryLabel.toLowerCase()} en la zona…`,
      },
      success: (data) => {
        const count = data.syncedLeadsCount;
        if (count === 0) {
          return { title: "No se encontraron leads nuevos en esta zona" };
        }
        const countText = count === 1 ? "1 lead" : `${count} leads`;
        return {
          title: `${countText} de ${data.categoryLabel} ${count === 1 ? "agregado" : "agregados"}`,
          description: `Se han agregado ${countText} de ${data.categoryLabel} a tu base de datos`,
        };
      },
      error: (err) => ({
        title: err instanceof Error ? err.message : "Error al sincronizar",
      }),
    });
  };

  if (userLoading) {
    return (
      <div className="flex justify-center py-20" role="status">
        <span
          className="size-10 rounded-full border-2 border-orange-500 border-t-transparent motion-safe:animate-spin"
          aria-hidden
        />
        <span className="sr-only">Cargando</span>
      </div>
    );
  }

  if (!isAdminCompanyUser(user)) {
    return (
      <div className="space-y-6">
        <RoleAccessDeniedSection
          title="No tienes acceso a Obtener clientes"
          description="Esta herramienta está pensada para el equipo comercial. Como vendedor no puedes importar negocios desde el mapa."
          backHref={`${Routes.panel}?tab=clientes`}
          backLabel="Volver a Clientes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        ref={setMapStage}
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[calc(100dvh-7.75rem)] w-screen overflow-visible bg-[#eef3f8] dark:bg-[#1e2a3a]"
        aria-label="Búsqueda de leads en mapa"
      >
        <div
          ref={mapContainerRef}
          className={`lead-exploration-map absolute inset-0 z-0 h-full w-full overflow-hidden ${
            themeMounted && isDarkMapTheme(resolvedTheme)
              ? "lead-exploration-map--night"
              : "lead-exploration-map--standard"
          } ${mapVisualReady ? "lead-exploration-map--ready" : ""} ${
            pinIntro ? "lead-exploration-map--pin-intro" : ""
          } ${isLoading && !reduceMotion ? "lead-exploration-map--searching" : ""}`}
          role="application"
          aria-busy={!mapVisualReady || isLoading}
          aria-label="Mapa interactivo. Los clientes obtenidos se ven como puntos de color. Haz clic para mover el punto de búsqueda."
        />
        <AnimatePresence>
          {!mapVisualReady && (
            <motion.div
              key="lead-map-loading"
              className="absolute inset-0 z-[1] flex items-center justify-center overflow-hidden bg-[#e8eef4] dark:bg-[#1e2a3a]"
              role="status"
              aria-live="polite"
              aria-busy="true"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.45, ease: MOTION_EASE }
              }
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,148,94,0.18),transparent_58%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(224,124,58,0.16),transparent_55%)]"
                aria-hidden
              />
              <div className="relative flex flex-col items-center gap-4 px-6 text-center">
                <div className="relative flex size-36 items-center justify-center" aria-hidden>
                  <span className="lead-map-loading-ring absolute size-32 rounded-full border-2 border-dashed border-[#e07c3a]/55" />
                  <span className="lead-map-loading-ring lead-map-loading-ring--inner absolute size-[4.5rem] rounded-full border border-dashed border-[#f7945e]/70" />
                  <svg
                    className="lead-map-loading-pin relative"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 36 44"
                    width="36"
                    height="44"
                  >
                    <path
                      fill="#e07c3a"
                      stroke="#ffffff"
                      strokeWidth="2"
                      d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
                    />
                    <circle cx="18" cy="15" r="5.5" fill="#ffffff" />
                    <circle cx="18" cy="15" r="3" fill="#f7945e" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#424242] dark:text-[#e0e0e0]">
                  Cargando mapa…
                </p>
                <AnimatePresence>
                  {showMapReload && (
                    <motion.button
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={motionTransition}
                      onClick={() => window.location.reload()}
                      className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 ${FOCUS_RING}`}
                    >
                      Recargar
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:pt-6">
          <motion.div
            className="pointer-events-auto relative isolate mx-auto w-full max-w-6xl"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition}
          >
            <div
              className="overflow-visible rounded-2xl border border-[#e0e0e0] bg-white/95 p-2 shadow-sm backdrop-blur-md dark:border-[#3a3a3a] dark:bg-[#1e1e1e]/95"
              role="search"
              aria-busy={isLoading}
            >
              <div className="flex min-w-0 flex-col gap-2 overflow-visible sm:flex-row sm:items-center">
                <div
                  className="relative inline-flex w-full rounded-xl bg-[#f8f8f8] p-0.5 dark:bg-[#121212] sm:w-auto sm:shrink-0"
                  role="group"
                  aria-label="Fuente de búsqueda"
                >
                  {LEAD_SOURCE_TOGGLE.map((option) => {
                    const isActive = leadSource === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectLeadSource(option.id)}
                        disabled={isLoading}
                        aria-pressed={isActive}
                        className={`flex-1 sm:flex-none ${segmentClass(isActive)}`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="lead-source-pill"
                            className="absolute inset-0 z-0 rounded-lg bg-orange-50 dark:bg-orange-500/15"
                            transition={motionTransition}
                          />
                        )}
                        <span className="relative z-10 inline-flex items-center gap-1.5">
                          <option.Mark size={16} />
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="relative inline-flex w-full rounded-xl border border-[#e0e0e0] bg-[#f8f8f8] p-0.5 dark:border-[#3a3a3a] dark:bg-[#121212] sm:w-auto sm:shrink-0"
                  role="group"
                  aria-label="Tipo de búsqueda"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("category");
                      setCustomSearch("");
                    }}
                    disabled={isLoading}
                    aria-pressed={searchMode === "category"}
                    className={`flex-1 sm:flex-none ${segmentClass(searchMode === "category")}`}
                  >
                    {searchMode === "category" && (
                      <motion.span
                        layoutId="search-mode-pill"
                        className="absolute inset-0 z-0 rounded-lg bg-orange-50 dark:bg-orange-500/15"
                        transition={motionTransition}
                      />
                    )}
                    <span className="relative z-10">Categoría</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("custom");
                      setCategory("");
                    }}
                    disabled={isLoading}
                    aria-pressed={searchMode === "custom"}
                    className={`flex-1 sm:flex-none ${segmentClass(searchMode === "custom")}`}
                  >
                    {searchMode === "custom" && (
                      <motion.span
                        layoutId="search-mode-pill"
                        className="absolute inset-0 z-0 rounded-lg bg-orange-50 dark:bg-orange-500/15"
                        transition={motionTransition}
                      />
                    )}
                    <span className="relative z-10">Búsqueda libre</span>
                  </button>
                </div>

                <div className="relative z-40 flex min-w-0 flex-1 items-center gap-2 overflow-visible rounded-xl px-2 focus-within:bg-orange-50/60 dark:focus-within:bg-orange-500/10 sm:px-3">
                  {searchMode === "category" ? (
                    <Autocomplete
                      id="obtener-clientes-category"
                      label="Buscar categoría"
                      value={category}
                      options={categoryOptions}
                      onChange={() => {}}
                      onSelect={(option) => setCategory(option.id)}
                      placeholder="Buscar categoría..."
                      disabled={isLoading}
                      disableBrowserAutocomplete
                      className="min-w-0 flex-1 overflow-visible [&>label]:sr-only [&>label]:mb-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:py-2 [&_input]:text-sm [&_input]:shadow-none [&_input]:focus:ring-0 dark:[&_input]:bg-transparent"
                    />
                  ) : (
                    <label className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="sr-only">Búsqueda libre</span>
                      <HugeiconsIcon
                        icon={Search01Icon}
                        size={18}
                        className="shrink-0 text-[#616161] dark:text-[#b0b0b0]"
                        aria-hidden
                      />
                      <input
                        type="text"
                        value={customSearch}
                        onChange={(e) =>
                          setCustomSearch(
                            sanitizeBusinessSearchTerm(e.target.value),
                          )
                        }
                        disabled={isLoading}
                        placeholder="Ej. Constructoras, Clínicas..."
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        name="kadesh-lead-free-search"
                        data-lpignore="true"
                        data-1p-ignore
                        data-form-type="other"
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#212121] placeholder:text-[#616161] focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-[#b0b0b0]"
                        maxLength={CUSTOM_SEARCH_MAX_LENGTH}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void runSync();
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <label className="sr-only" htmlFor="obtener-clientes-radius">
                    Radio de búsqueda
                  </label>
                  <select
                    id="obtener-clientes-radius"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    disabled={isLoading}
                    className={`cursor-pointer rounded-xl border-0 bg-transparent py-2 pl-2 pr-6 text-sm font-semibold text-[#212121] dark:text-white ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {radiusOptions.map((km) => (
                      <option key={km} value={km}>
                        A {km} km
                      </option>
                    ))}
                  </select>

                  {showRatingFilters && (
                    <div ref={filtersPopoverRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedFilters((v) => !v)}
                        className={`relative flex size-11 cursor-pointer items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-[#212121] transition-colors duration-150 hover:bg-orange-50 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
                        aria-expanded={showAdvancedFilters}
                        aria-controls="obtener-clientes-advanced-filters"
                        aria-label={
                          filtersActive
                            ? "Filtros de calificación, hay filtros activos"
                            : "Filtros de calificación"
                        }
                      >
                        <HugeiconsIcon
                          icon={FilterHorizontalIcon}
                          size={20}
                          aria-hidden
                        />
                        {filtersActive && (
                          <span
                            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500"
                            aria-hidden
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {showAdvancedFilters && (
                          <motion.div
                            id="obtener-clientes-advanced-filters"
                            initial={
                              reduceMotion ? false : { opacity: 0, y: -8 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={motionTransition}
                            className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
                          >
                            <h3 className="mb-4 text-sm font-semibold text-[#212121] dark:text-white">
                              Calificación y reseñas
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <label
                                    htmlFor="obtener-clientes-min-rating"
                                    className="text-sm font-semibold text-[#212121] dark:text-white"
                                  >
                                    Calificación mínima
                                  </label>
                                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    {minRating > 0
                                      ? `${minRating}+`
                                      : "Sin filtro"}
                                  </span>
                                </div>
                                <input
                                  id="obtener-clientes-min-rating"
                                  type="range"
                                  min={0}
                                  max={5}
                                  step={1}
                                  value={minRating}
                                  onChange={(e) =>
                                    setMinRating(Number(e.target.value))
                                  }
                                  disabled={isLoading}
                                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e0e0e0] accent-orange-500 dark:bg-[#3a3a3a]"
                                />
                                <div className="mt-2 flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = star <= minRating;
                                    return (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                          setMinRating(
                                            star <= minRating && minRating === 1
                                              ? 0
                                              : star,
                                          )
                                        }
                                        disabled={isLoading}
                                        aria-pressed={isActive}
                                        aria-label={`Mínimo ${star} estrellas`}
                                        className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING} ${
                                          isActive
                                            ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/40 dark:bg-orange-500/15 dark:text-orange-400"
                                            : "border-[#e0e0e0] bg-transparent text-[#616161] hover:bg-[#f8f8f8] dark:border-[#3a3a3a] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
                                        }`}
                                      >
                                        <HugeiconsIcon
                                          icon={StarIcon}
                                          size={16}
                                          aria-hidden
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="obtener-clientes-min-reviews"
                                  className="mb-2 block text-sm font-semibold text-[#212121] dark:text-white"
                                >
                                  Mínimo de reseñas
                                </label>
                                <input
                                  id="obtener-clientes-min-reviews"
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={minReviews}
                                  onChange={(e) =>
                                    setMinReviews(Number(e.target.value) || 0)
                                  }
                                  disabled={isLoading}
                                  placeholder="Ej. 10, 50, 100"
                                  className={`w-full rounded-xl border border-[#e0e0e0] bg-[#f8f8f8] px-3 py-2 text-sm text-[#212121] dark:border-[#3a3a3a] dark:bg-[#121212] dark:text-white ${FOCUS_RING}`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <motion.button
                    type="button"
                    onClick={() => void runSync()}
                    disabled={isLoading}
                    data-tour="extraccion-buscar-leads"
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none ${FOCUS_RING}`}
                  >
                    <motion.span
                      animate={
                        isLoading && !reduceMotion
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={
                        isLoading && !reduceMotion
                          ? { duration: 0.9, repeat: Infinity, ease: "linear" }
                          : { duration: 0 }
                      }
                      className="inline-flex"
                    >
                      <HugeiconsIcon
                        icon={Radar01Icon}
                        size={16}
                        className="text-white"
                        aria-hidden
                      />
                    </motion.span>
                    <span className="whitespace-nowrap">
                      {isLoading ? "Buscando…" : "Buscar leads"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>

            <p className="pointer-events-none mt-2 text-center text-sm font-medium text-[#424242] dark:text-[#e0e0e0]">
              {leadSource === "inegi"
                ? "Haz clic en el mapa para mover el centro. En INEGI el radio es 2 o 5 km; no hay calificación ni reseñas."
                : "Haz clic en el mapa para mover el centro de búsqueda."}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-28 right-4 z-20 flex flex-col gap-2 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2"
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...motionTransition, delay: reduceMotion ? 0 : 0.08 }}
        >
          <motion.button
            type="button"
            onClick={goToMyLocation}
            disabled={locatingUser || !leafletReady}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className={`flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#212121] shadow-sm transition-colors duration-150 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
            title="Centrar en mi ubicación"
            aria-label="Centrar en mi ubicación"
          >
            <HugeiconsIcon
              icon={CenterFocusIcon}
              size={22}
              className={
                locatingUser
                  ? "text-orange-500 motion-safe:animate-pulse"
                  : undefined
              }
              aria-hidden
            />
          </motion.button>
          <motion.button
            type="button"
            onClick={centerOnMexicoCity}
            disabled={!leafletReady}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className={`flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-sm font-semibold text-[#212121] shadow-sm transition-colors duration-150 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
            title="Centrar en Ciudad de México"
            aria-label="Centrar en Ciudad de México"
          >
            CDMX
          </motion.button>
        </motion.div>

        <LeadMapCategoryPanel
          categories={categoryStats.categories}
          hiddenCategories={hiddenCategories}
          onToggle={toggleMapCategory}
          onShowAll={showAllMapCategories}
          onHideAll={hideAllMapCategories}
        />

        <AnimatePresence>
          {showResultPanel && (
            <motion.div
              key="lead-search-result"
              className="absolute left-4 top-1/2 z-20 w-[min(22rem,calc(100%-5.5rem))] max-h-[calc(100%-8rem)] overflow-y-auto sm:left-6"
              initial={reduceMotion ? false : { opacity: 0, x: -20, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={
                reduceMotion ? undefined : { opacity: 0, x: -12, y: "-50%" }
              }
              transition={motionTransition}
              role="status"
              aria-live="polite"
            >
              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      showZeroResultsHint
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                        : "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={
                        showZeroResultsHint
                          ? Location01Icon
                          : CheckmarkCircle02Icon
                      }
                      size={22}
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold tracking-tight text-[#212121] dark:text-white">
                        {showZeroResultsHint
                          ? "No se encontraron negocios nuevos en esta zona"
                          : createdCount > 0
                            ? `${createdCount === 1 ? "1 lead" : `${createdCount} leads`} de ${activeSearchLabel} ${createdCount === 1 ? "agregado" : "agregados"}`
                            : "No hay leads nuevos en esta búsqueda"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setResultDismissed(true)}
                        className={`-mr-1 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#616161] transition-colors duration-150 hover:bg-[#f8f8f8] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
                        aria-label="Cerrar resultado"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={18}
                          aria-hidden
                        />
                      </button>
                    </div>

                    {secondarySearchStats && !showZeroResultsHint && (
                      <p className="mt-1 text-sm text-[#424242] dark:text-[#e0e0e0]">
                        {secondarySearchStats}
                      </p>
                    )}

                    {showZeroResultsHint && (
                      <p className="mt-1 text-sm text-[#424242] dark:text-[#e0e0e0]">
                        Prueba otro giro o haz clic en otra zona del mapa.
                      </p>
                    )}

                    {(showZeroResultsHint &&
                      (widerRadiusKm != null || filtersActive)) ||
                    createdCount > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {showZeroResultsHint && widerRadiusKm != null && (
                          <button
                            type="button"
                            onClick={() => setRadiusKm(widerRadiusKm)}
                            className={`cursor-pointer rounded-xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm font-semibold text-[#212121] transition-colors duration-150 hover:bg-[#f8f8f8] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
                          >
                            Ampliar a {widerRadiusKm} km
                          </button>
                        )}
                        {showZeroResultsHint && filtersActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setMinRating(0);
                              setMinReviews(0);
                            }}
                            className={`cursor-pointer rounded-xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm font-semibold text-[#212121] transition-colors duration-150 hover:bg-[#f8f8f8] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white dark:hover:bg-[#2a2a2a] ${FOCUS_RING}`}
                          >
                            Quitar filtros
                          </button>
                        )}
                        {createdCount > 0 && (
                          <motion.button
                            type="button"
                            onClick={() =>
                              router.push(`${Routes.panel}?tab=clientes`)
                            }
                            whileHover={
                              reduceMotion ? undefined : { scale: 1.03 }
                            }
                            whileTap={
                              reduceMotion ? undefined : { scale: 0.97 }
                            }
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-600 ${FOCUS_RING}`}
                          >
                            <HugeiconsIcon
                              icon={MentoringIcon}
                              size={16}
                              aria-hidden
                            />
                            Ver en Clientes
                          </motion.button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stats && hasSearched && (
        <p className="text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
          Última búsqueda: {stats.created}{" "}
          {stats.created === 1 ? "nuevo" : "nuevos"}
          {secondarySearchStats ? ` · ${secondarySearchStats}` : ""}
        </p>
      )}

      <LeadsStatsCards ref={statsRef} />
    </div>
  );
}
