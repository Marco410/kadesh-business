"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CenterFocusIcon,
  FilterHorizontalIcon,
  Location01Icon,
  MentoringIcon,
  Radar01Icon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { useSyncLeadsArea } from "kadesh/components/profile/sales/obtener-clientes/hooks";
import RoleAccessDeniedSection from "../RoleAccessDeniedSection";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { Autocomplete, type AutocompleteOption } from "kadesh/components/shared";
import LeadsStatsCards, { type LeadsStatsCardsHandle } from "./LeadsStatsCards";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS: AutocompleteOption[] = GOOGLE_PLACE_CATEGORIES.map((opt) => ({
  id: opt.value,
  label: opt.label,
}));

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const LEAD_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const LEAD_MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

function isDarkMapTheme(resolvedTheme: string | undefined): boolean {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return true;
  }
  return resolvedTheme === "dark";
}

function applyLeadMapThemeClass(
  container: HTMLElement | null,
  resolvedTheme: string | undefined
) {
  if (!container) return;
  const isDark = isDarkMapTheme(resolvedTheme);
  container.classList.toggle("lead-exploration-map--night", isDark);
  container.classList.toggle("lead-exploration-map--standard", !isDark);
}

/** Ciudad de México — ubicación por defecto al cargar el mapa */
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };
const DEFAULT_ZOOM = 10;
const DEFAULT_RADIUS_KM = 5;
const RADIUS_OPTIONS_KM = [2, 5, 10, 25, 50] as const;
const CUSTOM_SEARCH_MIN_LENGTH = 2;
const CUSTOM_SEARCH_MAX_LENGTH = 80;

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
  attrs: Record<string, string>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrKey = tag === "link" ? "href" : "src";
    const attrVal = attrs[attrKey];
    const existing = document.querySelector(
      `${tag}[${attrKey}="${attrVal}"]`
    );
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

interface LeafletTileLayer {
  addTo(map: LeafletMap): LeafletTileLayer;
  remove(): void;
}
interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  getZoom(): number;
  fitBounds(bounds: unknown, options?: { padding?: [number, number] }): void;
  on(event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void): void;
  removeLayer(layer: LeafletTileLayer): LeafletMap;
  invalidateSize(): void;
  remove(): void;
}
interface LeafletMarker {
  setLatLng(latlng: [number, number]): LeafletMarker;
  addTo(map: LeafletMap): LeafletMarker;
}
interface LeafletCircle {
  setLatLng(latlng: [number, number]): LeafletCircle;
  setRadius(m: number): LeafletCircle;
  getBounds(): unknown;
  addTo(map: LeafletMap): LeafletCircle;
}
declare global {
  interface Window {
    L?: {
      map(el: HTMLElement): LeafletMap;
      marker(latlng: [number, number]): LeafletMarker;
      circle(
        latlng: [number, number],
        options: {
          radius: number;
          color?: string;
          fillColor?: string;
          fillOpacity?: number;
          weight?: number;
          dashArray?: string;
        }
      ): LeafletCircle;
      tileLayer(
        url: string,
        options: { attribution: string; subdomains?: string; maxZoom?: number }
      ): LeafletTileLayer;
    };
  }
}

export default function ObtenerClientesSection() {
  const [searchMode, setSearchMode] = useState<"category" | "custom">("category");
  const [category, setCategory] = useState("");
  const [customSearch, setCustomSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM);
  const [minRating, setMinRating] = useState<number>(0);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pin, setPin] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState<{
    created: number;
    alreadyInDb: number;
    skippedLowRating: number;
  } | null>(null);
  const [showZeroResultsHint, setShowZeroResultsHint] = useState(false);
  const [hasNewLeadsAdded, setHasNewLeadsAdded] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  const { syncLeadsArea, loading: isLoading, error: syncError } = useSyncLeadsArea();
  const { user, loading: userLoading } = useUser();
  const { resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);

  const statsRef = useRef<LeadsStatsCardsHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const filtersPopoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (!themeMounted || !leafletReady) return;
    applyLeadMapThemeClass(mapContainerRef.current, resolvedTheme);
  }, [themeMounted, leafletReady, resolvedTheme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadExternalResource("link", { rel: "stylesheet", href: LEAFLET_CSS });
        await loadExternalResource("script", { src: LEAFLET_JS });
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
    (lat: number, lng: number, rKm: number) => {
      const L = window.L;
      const map = mapRef.current;
      if (!L || !map) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      const radiusM = rKm * 1000;
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]).setRadius(radiusM);
      } else {
        circleRef.current = L.circle([lat, lng], {
          radius: radiusM,
          color: "#ea580c",
          fillColor: "#ea580c",
          fillOpacity: 0.1,
          weight: 3,
          dashArray: "6, 6",
        }).addTo(map);
      }

      const currentZoom = map.getZoom();
      map.setView([lat, lng], currentZoom);
    },
    []
  );

  useEffect(() => {
    const L = window.L;
    const container = mapContainerRef.current;
    if (!leafletReady || !container || !L) return;

    const map = L.map(container).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    mapRef.current = map;

    tileLayerRef.current = L.tileLayer(LEAD_MAP_TILE_URL, {
      attribution: LEAD_MAP_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    applyLeadMapThemeClass(container, resolvedTheme);

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      setPin({ lat, lng });
    });

    updateMapOverlays(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, radiusKm);

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
  }, [leafletReady, updateMapOverlays]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pin && mapRef.current) {
      updateMapOverlays(pin.lat, pin.lng, radiusKm);
    }
  }, [pin, radiusKm, updateMapOverlays]);

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

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      sileo.error({ title: "Tu navegador no soporta geolocalización" });
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPin({ lat: latitude, lng: longitude });
        mapRef.current?.setView([latitude, longitude], 8);
        setLocatingUser(false);
      },
      () => {
        sileo.error({
          title: "No se pudo obtener tu ubicación. Verifica los permisos del navegador.",
        });
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const centerOnMexicoCity = useCallback(() => {
    setPin(DEFAULT_CENTER);
    mapRef.current?.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);
  }, []);

  const runSync = async () => {
    setMessage(null);
    setStats(null);
    setShowZeroResultsHint(false);

    const activeSearchTerm =
      searchMode === "custom"
        ? normalizeBusinessSearchTerm(customSearch)
        : category;

    if (!activeSearchTerm) {
      sileo.error({
        title:
          searchMode === "category"
            ? "Selecciona una categoría"
            : "Escribe qué tipo de negocio buscas",
      });
      return;
    }
    if (searchMode === "custom" && !isBusinessSearchTermValid(activeSearchTerm)) {
      sileo.error({
        title: "Búsqueda no válida",
        description: `Escribe al menos ${CUSTOM_SEARCH_MIN_LENGTH} caracteres usando letras.`,
      });
      return;
    }

    const categoryLabel =
      searchMode === "custom"
        ? activeSearchTerm
        : GOOGLE_PLACE_CATEGORIES.find((c) => c.value === category)?.label ?? category;

    const fetchData = async () => {
      const result = await syncLeadsArea({
        lat: pin.lat,
        lng: pin.lng,
        radiusKm,
        category: activeSearchTerm,
        maxResults: 60,
        minRating: minRating > 0 ? minRating : null,
        minReviews: minReviews > 0 ? minReviews : null,
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
      setStats({ created, alreadyInDb, skippedLowRating: skipped });
      setHasSearched(true);
      setShowZeroResultsHint(syncedLeadsCount === 0);
      setHasNewLeadsAdded(syncedLeadsCount > 0);

      if (syncedLeadsCount > 0) {
        statsRef.current?.refetch();
      }

      return { syncedLeadsCount, categoryLabel };
    };

    sileo.promise(fetchData(), {
      loading: { title: `Buscando leads de ${categoryLabel.toLowerCase()} en la zona…` },
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
      <div className="flex justify-center py-20">
        <span
          className="size-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
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
      {/* Vista inmersiva: mapa a pantalla completa + controles flotantes */}
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-[calc(100vh-64px)] min-h-[480px] overflow-visible bg-gray-100 dark:bg-gray-900"
        aria-label="Búsqueda de leads en mapa"
      >
        {/* Capa del mapa */}
        <div
          ref={mapContainerRef}
          className={`absolute inset-0 z-0 h-full w-full overflow-hidden ${
            themeMounted && isDarkMapTheme(resolvedTheme)
              ? "lead-exploration-map--night"
              : "lead-exploration-map--standard"
          }`}
          role="application"
          aria-label="Mapa interactivo. Haz clic para mover el punto de búsqueda."
        />
        {!leafletReady && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa…</p>
          </div>
        )}

        {/* Isla flotante de búsqueda */}
        <div className="absolute top-6 left-1/2 z-20 w-full max-w-4xl -translate-x-1/2 px-4 isolate">
          <div className="relative z-30 flex flex-wrap items-start justify-center gap-2 overflow-visible sm:flex-nowrap">
            <div
              className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2 overflow-visible rounded-2xl border border-gray-200 bg-white/90 p-2 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/90 sm:flex-nowrap sm:min-w-[360px] lg:min-w-[520px]"
              role="search"
            >
              {/* Tipo de búsqueda */}
              <div className="w-full shrink-0 px-1 sm:w-auto sm:border-r sm:border-gray-200 sm:pr-2 dark:sm:border-gray-700">
                <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:sr-only">
                  Tipo de búsqueda
                </p>
                <div
                  className="inline-flex w-full rounded-xl border border-gray-200 bg-gray-100/80 p-0.5 dark:border-gray-600 dark:bg-gray-800/80 sm:w-auto"
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
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:flex-none sm:px-3 ${
                      searchMode === "category"
                        ? "bg-orange-600 text-white shadow-[0_4px_14px_rgba(234,88,12,0.45)]"
                        : "text-gray-600 hover:bg-white/60 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    Categoría
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("custom");
                      setCategory("");
                    }}
                    disabled={isLoading}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:flex-none sm:px-3 ${
                      searchMode === "custom"
                        ? "bg-orange-600 text-white shadow-[0_4px_14px_rgba(234,88,12,0.45)]"
                        : "text-gray-600 hover:bg-white/60 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    Búsqueda libre
                  </button>
                </div>
              </div>

              {/* Campo de búsqueda */}
              <div className="relative z-40 flex min-w-0 flex-1 items-center gap-2 overflow-visible border-gray-200 px-2 sm:border-r sm:px-3 dark:sm:border-gray-700">
                {searchMode === "category" ? (
                  <Autocomplete
                    id="obtener-clientes-category"
                    label="Buscar categoría"
                    value={category}
                    options={CATEGORY_OPTIONS}
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
                      className="shrink-0 text-gray-500 dark:text-gray-400"
                      aria-hidden
                    />
                    <input
                      type="text"
                      value={customSearch}
                      onChange={(e) =>
                        setCustomSearch(sanitizeBusinessSearchTerm(e.target.value))
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
                      className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-400"
                      maxLength={CUSTOM_SEARCH_MAX_LENGTH}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void runSync();
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex w-full shrink-0 items-center justify-center px-2 sm:w-auto">
                <label className="sr-only" htmlFor="obtener-clientes-radius">
                  Radio de búsqueda
                </label>
                <select
                  id="obtener-clientes-radius"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  disabled={isLoading}
                  className="cursor-pointer border-0 bg-transparent py-2 pl-1 pr-6 text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 dark:text-gray-200"
                >
                  {RADIUS_OPTIONS_KM.map((km) => (
                    <option key={km} value={km}>
                      A {km} km
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full shrink-0 px-1 sm:w-auto sm:pl-1 sm:pr-1">
                <button
                  type="button"
                  onClick={() => void runSync()}
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  <HugeiconsIcon icon={Radar01Icon} size={16} className="text-white" aria-hidden />
                  <span className="whitespace-nowrap">
                    {isLoading ? "Buscando…" : "Buscar Leads"}
                  </span>
                </button>
              </div>
            </div>

            {/* Filtros avanzados */}
            <div ref={filtersPopoverRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-2xl backdrop-blur-md transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-expanded={showAdvancedFilters}
                aria-controls="obtener-clientes-advanced-filters"
                title="Filtros avanzados"
              >
                <HugeiconsIcon icon={FilterHorizontalIcon} size={20} aria-hidden />
              </button>

              {showAdvancedFilters && (
                <div
                  id="obtener-clientes-advanced-filters"
                  className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  role="dialog"
                  aria-label="Filtros avanzados"
                >
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Filtros Avanzados
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="obtener-clientes-min-rating"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Calificación mínima
                        </label>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {minRating > 0 ? `${minRating}+` : "Sin filtro"}
                        </span>
                      </div>
                      <input
                        id="obtener-clientes-min-rating"
                        type="range"
                        min={0}
                        max={5}
                        step={1}
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        disabled={isLoading}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-orange-600 dark:bg-gray-700"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Sin filtro</span>
                        <span>5 ★</span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = star <= minRating;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setMinRating(star <= minRating && minRating === 1 ? 0 : star)
                              }
                              disabled={isLoading}
                              className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${
                                isActive
                                  ? "border-amber-300/70 bg-amber-500/15 text-amber-500"
                                  : "border-gray-200 bg-transparent text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                              }`}
                              aria-label={`Mínimo ${star} estrellas`}
                            >
                              <HugeiconsIcon icon={StarIcon} size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="obtener-clientes-min-reviews"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Mínimo de reseñas
                      </label>
                      <input
                        id="obtener-clientes-min-reviews"
                        type="number"
                        min={0}
                        step={1}
                        value={minReviews}
                        onChange={(e) => setMinReviews(Number(e.target.value) || 0)}
                        disabled={isLoading}
                        placeholder="Ej. 10, 50, 100"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="relative z-0 mt-2 flex justify-center pointer-events-none">
            <span className="rounded-full border border-gray-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-md backdrop-blur-md dark:border-gray-600/80 dark:bg-gray-900/95 dark:text-gray-200">
              Haz clic en el mapa para mover el centro de búsqueda
            </span>
          </p>
        </div>

        {/* Centrar en mi ubicación */}
        <button
          type="button"
          onClick={goToMyLocation}
          disabled={locatingUser || !leafletReady}
          className="absolute top-8 right-8 z-10 rounded-full border border-gray-200 bg-white/95 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          title="Centrar en mi ubicación"
          aria-label="Centrar en mi ubicación"
        >
          <HugeiconsIcon
            icon={CenterFocusIcon}
            size={22}
            className={locatingUser ? "animate-pulse text-orange-500" : undefined}
          />
        </button>

        {hasNewLeadsAdded && (
          <button
            type="button"
            onClick={() => router.push(`${Routes.panel}?tab=clientes`)}
            className="absolute top-8 right-32 z-20 flex items-center gap-2 rounded-full border border-orange-100 bg-white/95 px-5 py-3 text-sm font-semibold text-orange-600 shadow-xl ring-1 ring-orange-200/40 backdrop-blur-md transition hover:bg-orange-50 hover:text-orange-700 dark:border-orange-900/30 dark:bg-gray-900/80 dark:text-orange-400 dark:hover:bg-gray-800"
            aria-label="Ver mis nuevos clientes"
            title="Ver mis nuevos clientes"
          >
            <HugeiconsIcon
              icon={MentoringIcon}
              size={22}
              className="shrink-0"
              aria-hidden
            />
            <span>Ver mis nuevos clientes</span>
          </button>
        )}

      </div>

      {message && !showZeroResultsHint && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
              : "border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {showZeroResultsHint && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-800/60 dark:bg-purple-900/20">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-800/40">
              <HugeiconsIcon
                icon={Location01Icon}
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </span>
            <div>
              <h3 className="mb-1 font-semibold text-purple-900 dark:text-purple-100">
                No se encontraron negocios en esta zona
              </h3>
              <p className="mb-3 text-sm text-purple-800 dark:text-purple-200/90">
                Prueba ajustar los parámetros o buscar en otro punto del mapa.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-purple-700 dark:text-purple-300/90">
                <li>
                  <strong>Amplía o reduce el radio</strong> (por ejemplo, más o menos de {radiusKm}{" "}
                  km).
                </li>
                <li>
                  <strong>Prueba otro tipo de negocio</strong> en la barra de búsqueda.
                </li>
                <li>
                  <strong>Haz clic en otra zona del mapa</strong> y vuelve a buscar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {stats && hasSearched && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Última búsqueda: {stats.created} nuevos · {stats.alreadyInDb} ya en base ·{" "}
          {stats.skippedLowRating} omitidos por rating
        </p>
      )}

      <LeadsStatsCards ref={statsRef} />
    </div>
  );
}
