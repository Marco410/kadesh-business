"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { useSyncLeadsArea } from "kadesh/components/profile/sales/obtener-clientes/hooks";
import CurrentPlanSection from "../CurrentPlanSection";
import RoleAccessDeniedSection from "../RoleAccessDeniedSection";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { Autocomplete, InfoTooltip, type AutocompleteOption } from "kadesh/components/shared";
import LeadsStatsCards, { type LeadsStatsCardsHandle } from "./LeadsStatsCards";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };
const DEFAULT_ZOOM = 5;
const DEFAULT_RADIUS_KM = 5;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;
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

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  getZoom(): number;
  fitBounds(bounds: unknown, options?: { padding?: [number, number] }): void;
  on(event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void): void;
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
      tileLayer(url: string, options: { attribution: string }): { addTo(map: LeafletMap): unknown };
    };
  }
}

export default function ObtenerClientesSection() {
  const [searchMode, setSearchMode] = useState<"category" | "custom">("category");
  const [category, setCategory] = useState<string>("");
  const [customSearch, setCustomSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [minRating, setMinRating] = useState<number>(3);
  const [minReviews, setMinReviews] = useState<number>(20);
  const [radiusTouched, setRadiusTouched] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState<{
    created: number;
    alreadyInDb: number;
    skippedLowRating: number;
  } | null>(null);
  const [showZeroResultsHint, setShowZeroResultsHint] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  const { syncLeadsArea, loading: isLoading, error: syncError } = useSyncLeadsArea();
  const { user, loading: userLoading } = useUser();

  const statsRef = useRef<LeadsStatsCardsHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);

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
    if (!leafletReady || !mapContainerRef.current || mapRef.current || !L) return;

    const map = L.map(mapContainerRef.current).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      setPin({ lat, lng });
    });
  }, [leafletReady]);

  useEffect(() => {
    if (pin) updateMapOverlays(pin.lat, pin.lng, radiusKm);
  }, [pin, radiusKm, updateMapOverlays]);

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
        mapRef.current?.setView([latitude, longitude], 15);
        setLocatingUser(false);
      },
      () => {
        sileo.error({ title: "No se pudo obtener tu ubicación. Verifica los permisos del navegador." });
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const runSync = async () => {
    if (!pin) {
      sileo.error({ title: "Haz clic en el mapa para colocar el punto de búsqueda" });
      return;
    }
    setMessage(null);
    setStats(null);
    setShowZeroResultsHint(false);

    const activeSearchTerm =
      searchMode === "custom"
        ? normalizeBusinessSearchTerm(customSearch)
        : category;
    if (!activeSearchTerm) {
      sileo.error({ title: "Selecciona una categoría o escribe una búsqueda válida" });
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

      console.log("result", result);

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

      if (syncedLeadsCount > 0) {
        statsRef.current?.refetch();
      }

      return { syncedLeadsCount, categoryLabel };
    };

    sileo.promise(fetchData(), {
      loading: { title: `Buscando ${categoryLabel.toLowerCase()} en la zona…` },
      success: (data) => {
        const count = data.syncedLeadsCount;
        if (count === 0) {
          return { title: "No se encontraron negocios nuevos en esta zona" };
        }
        const countText = count === 1 ? "1 negocio" : `${count} negocios`;
        return {
          title: `${countText} de ${data.categoryLabel} ${count === 1 ? "agregado" : "agregados"}`,
          description: `Se han agregado ${countText} de ${data.categoryLabel} a la base de datos`,
          
        };
      },
      error: (err) => ({
        title: err instanceof Error ? err.message : "Error al sincronizar",
      }),
    });
  };

  const step1Done = Boolean(pin);
  const step2Done = Boolean(pin);
  const step3Done = hasSearched;
  const radiusPercent =
    ((radiusKm - MIN_RADIUS_KM) / (MAX_RADIUS_KM - MIN_RADIUS_KM)) * 100;

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center py-20">
        <span
          className="size-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!isAdminCompanyUser(user)) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <RoleAccessDeniedSection
          title="No tienes acceso a Obtener clientes"
          description="Esta herramienta está pensada para el equipo comercial. Como vendedor no puedes importar negocios desde el mapa."
          backHref={`${Routes.panel}?tab=ventas`}
          backLabel="Volver a Ventas"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CurrentPlanSection />
      <div className="relative z-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Obtener negocios por zona
        </h2>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Completa el flujo para importar negocios: el mapa muestra en vivo el área según el radio y los filtros
            refinan la búsqueda.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { n: 1, label: "Clic en el mapa" },
              { n: 2, label: "Radio (km)" },
                { n: 3, label: "Filtro y buscar" },
            ].map((s) => {
              const status =
                s.n === 1
                  ? step1Done
                    ? "completed"
                    : "active"
                  : s.n === 2
                    ? step1Done && !step2Done
                      ? "active"
                      : step2Done
                        ? "completed"
                        : "pending"
                    : step3Done
                      ? "completed"
                      : step1Done && step2Done
                        ? "active"
                        : "pending";

              const classes =
                status === "completed"
                  ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : status === "active"
                    ? "border-orange-200 dark:border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400"
                    : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white/10 text-[#616161] dark:text-[#b0b0b0]";

              return (
                <div
                  key={s.n}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}
                >
                  <span className="tabular-nums">{status === "completed" ? "✓" : s.n}</span>
                  <span className="whitespace-nowrap">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/70 dark:bg-[#161616]/70 backdrop-blur-xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
                    Filtros de búsqueda
                  </h3>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                    Afina la calidad de los negocios antes de importarlos.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                  <div className="w-full xl:col-span-5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                      Tipo de búsqueda
                    </label>
                    <div className="inline-flex w-full rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-[#0f0f0f]/70 p-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode("category");
                          setCustomSearch("");
                        }}
                        className={`flex-1 min-h-[52px] rounded-lg px-2 py-2 inline-flex items-center justify-center text-[13px] leading-tight font-semibold text-center whitespace-normal break-words transition-all duration-200 ease-in-out ${
                          searchMode === "category"
                            ? "bg-orange-500 text-white shadow-[0_6px_18px_rgba(249,115,22,0.45)]"
                            : "text-[#616161] dark:text-[#b0b0b0] hover:bg-white/60 dark:hover:bg-white/5"
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
                        className={`flex-1 min-h-[52px] rounded-lg px-2 py-2 inline-flex items-center justify-center text-[13px] leading-tight font-semibold text-center whitespace-normal break-words transition-all duration-200 ease-in-out ${
                          searchMode === "custom"
                            ? "bg-orange-500 text-white shadow-[0_6px_18px_rgba(249,115,22,0.45)]"
                            : "text-[#616161] dark:text-[#b0b0b0] hover:bg-white/60 dark:hover:bg-white/5"
                        }`}
                      >
                        Búsqueda libre
                      </button>
                    </div>
                  </div>

                  <div className="w-full xl:col-span-7">
                    {searchMode === "category" ? (
                      <Autocomplete
                        id="obtener-clientes-category"
                        label="Buscar categoría"
                        value={category}
                        options={GOOGLE_PLACE_CATEGORIES.map(
                          (opt): AutocompleteOption => ({
                            id: opt.value,
                            label: opt.label,
                          })
                        )}
                        onChange={() => {}}
                        onSelect={(option) => {
                          setCategory(option.id);
                        }}
                        placeholder="Buscar categoría..."
                        disabled={isLoading}
                        className="w-full"
                      />
                    ) : (
                      <>
                        <label
                          htmlFor="obtener-clientes-custom-search"
                          className="block text-sm font-medium text-[#212121] dark:text-white mb-2"
                        >
                          Empresa, categoría o negocio
                        </label>
                        <input
                          id="obtener-clientes-custom-search"
                          type="text"
                          value={customSearch}
                          onChange={(e) => setCustomSearch(sanitizeBusinessSearchTerm(e.target.value))}
                          disabled={isLoading}
                          placeholder="Ej. taquería, despacho legal, farmacia guadalajara"
                          className="w-full px-4 py-2.5 rounded-xl border border-white/25 dark:border-white/10 bg-white/65 dark:bg-[#101010]/75 text-[#212121] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ease-in-out"
                          maxLength={CUSTOM_SEARCH_MAX_LENGTH}
                        />
                 
                      </>
                    )}
                  </div>

                  <div className="w-full xl:col-span-12 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
                          Radio de búsqueda
                      </label>
                      <span className="inline-flex items-center rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 px-2.5 py-1 text-xs font-semibold border border-orange-500/25">
                        {radiusKm} km
                      </span>
                    </div>

                    <div className="relative">
                      <div
                        className="absolute -top-8 z-10 rounded-md bg-[#1f1f1f] text-white text-[11px] px-2 py-1 shadow-md pointer-events-none transition-all duration-200 ease-in-out"
                        style={{ left: `calc(${radiusPercent}% - 18px)` }}
                      >
                        {radiusKm}km
                      </div>
                      <input
                        aria-label="Radio de búsqueda en kilómetros"
                        type="range"
                        min={MIN_RADIUS_KM}
                        max={MAX_RADIUS_KM}
                        step={1}
                        value={radiusKm}
                        onChange={(e) => {
                          setRadiusKm(Number(e.target.value));
                          setRadiusTouched(true);
                        }}
                        disabled={isLoading}
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${radiusPercent}%, #d4d4d8 ${radiusPercent}%, #d4d4d8 100%)`,
                        }}
                        className="kadesh-range w-full h-3 appearance-none cursor-pointer rounded-full transition-all duration-200 ease-in-out"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#757575] dark:text-[#9ca3af]">
                      <span>1 km</span>
                      <span>25 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/65 dark:bg-[#141414]/70 backdrop-blur-xl overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters((v) => !v)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 ease-in-out"
                  aria-expanded={showAdvancedFilters}
                >
                  <span className="text-sm font-semibold text-[#212121] dark:text-white">
                    Filtros avanzados
                  </span>
                  <span
                    className={`inline-flex items-center justify-center size-6 rounded-full border border-white/20 dark:border-white/10 text-[#616161] dark:text-[#b0b0b0] transition-transform duration-200 ease-in-out ${
                      showAdvancedFilters ? "rotate-180" : ""
                    }`}
                  >
                    ˅
                  </span>
                </button>

                <div className="px-4 pb-2 flex flex-wrap items-center gap-2">
                  {minRating > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/50 dark:border-blue-400/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 pl-3 pr-1 py-1 text-xs font-semibold">
                      Rating: {minRating.toFixed(1)}+
                      <button
                        type="button"
                        onClick={() => setMinRating(0)}
                        className="inline-flex items-center justify-center size-6 rounded-full hover:bg-blue-500/20 transition-colors duration-200 ease-in-out"
                        aria-label="Quitar filtro de rating"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {minReviews > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/50 dark:border-blue-400/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 pl-3 pr-1 py-1 text-xs font-semibold">
                      Resenas: {minReviews}+
                      <button
                        type="button"
                        onClick={() => setMinReviews(0)}
                        className="inline-flex items-center justify-center size-6 rounded-full hover:bg-blue-500/20 transition-colors duration-200 ease-in-out"
                        aria-label="Quitar filtro de reseñas"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>

                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    showAdvancedFilters
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden mt-2">
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="w-full">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                          Rating minimo
                        </label>
                        <div className="rounded-xl border border-white/25 dark:border-white/10 bg-white/55 dark:bg-[#101010]/65 p-3">
                          <div className="flex flex-col items-start gap-2">
                            <div className="inline-flex flex-wrap items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = star <= minRating;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setMinRating(( star <= minRating && minRating == 1) ? 0 : star)}
                                    disabled={isLoading}
                                    className={`inline-flex items-center justify-center size-8 rounded-lg border transition-all duration-200 ease-in-out ${
                                      isActive
                                        ? "border-amber-300/70 bg-amber-500/15 text-amber-400"
                                        : "border-white/20 dark:border-white/10 bg-transparent text-[#8b8b8b] hover:bg-white/50 dark:hover:bg-white/5"
                                    }`}
                                    aria-label={`Rating mínimo ${star} estrellas`}
                                  >
                                    <HugeiconsIcon icon={StarIcon} size={18} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-[#616161] dark:text-[#9ca3af]">
                            Rating mínimo: solo se incluirán negocios con calificación igual o superior al valor que selecciones.
                          </p>
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                          Reseñas minimas
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={minReviews}
                          onChange={(e) => setMinReviews(Number(e.target.value) || 0)}
                          disabled={isLoading}
                          className="w-full px-4 py-2.5 rounded-xl border border-white/25 dark:border-white/10 bg-white/65 dark:bg-[#101010]/75 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm transition-all duration-200 ease-in-out"
                        />
                        <p className="mt-2 text-[11px] leading-relaxed text-[#616161] dark:text-[#9ca3af]">
                          Reseñas mínimas: descarta negocios con pocas opiniones para priorizar perfiles más confiables.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={runSync}
                    disabled={isLoading || !pin}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-[0_10px_24px_rgba(249,115,22,0.32)]"
                  >
                    <HugeiconsIcon icon={Search01Icon} size={16} className="text-white" />
                    {isLoading ? "Buscando negocios..." : "Buscar negocios"}
                  </button>
                </div>
              </div>

              {!pin && !isLoading && (
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                  Selecciona un punto en el mapa (clic) para habilitar la busqueda.
                </p>
              )}

              {pin && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Punto seleccionado: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)} - Radio: {radiusKm} km
                </p>
              )}
            </div>
          </div>
          <div className="w-full">
            <div className="relative z-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800/50">
            <div
              ref={mapContainerRef}
              className="w-full h-[650px]"
              style={{ minHeight: 350 }}
            />
            <button
              type="button"
              onClick={goToMyLocation}
              disabled={locatingUser || !leafletReady}
              className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-600 shadow-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Usar mi ubicación actual"
            >
              <HugeiconsIcon
                icon={Location01Icon}
                size={16}
                className={locatingUser ? "animate-pulse text-orange-500" : "text-gray-500 dark:text-gray-400"}
              />
              {locatingUser ? "Localizando…" : "Mi ubicación"}
            </button>
          </div>
          
          {!leafletReady && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Cargando mapa…</p>
          )}
           
          </div>
        </div>

        {message && !showZeroResultsHint && (
          <div
            className={`rounded-lg p-4 mt-4 ${
              message.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {showZeroResultsHint && (
          <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-900/20 p-6 mt-4">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-800/40 flex items-center justify-center">
                <HugeiconsIcon icon={Location01Icon} size={24} className="text-purple-600 dark:text-purple-400" />
              </span>
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  No se encontraron negocios en esta zona
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200/90 mb-3">
                  Prueba ajustar los parámetros o buscar en otro punto del mapa para obtener resultados.
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300/90 space-y-1 list-disc list-inside">
                  <li><strong>Amplía o reduce el radio</strong> (por ejemplo, más o menos de {radiusKm} km) para cubrir más área.</li>
                  <li><strong>Elige otro tipo de negocio</strong> en el selector; puede haber más oferta en otra categoría.</li>
                  <li><strong>Haz clic en otra zona del mapa</strong> (centro, otra ciudad o colonia) y vuelve a buscar.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
      <LeadsStatsCards ref={statsRef} />
      <style jsx>{`
        .kadesh-range::-webkit-slider-runnable-track {
          height: 14px;
          border-radius: 9999px;
        }
        .kadesh-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -7px;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          border: 2px solid #f97316;
          background:
            radial-gradient(circle at center, #fff7ed 0 26%, transparent 27%),
            #f97316;
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
          transition: transform 0.15s ease;
        }
        .kadesh-range:hover::-webkit-slider-thumb {
          transform: scale(1.05);
        }
        .kadesh-range:disabled::-webkit-slider-thumb {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .kadesh-range::-moz-range-track {
          height: 14px;
          border-radius: 9999px;
          background: #e5e7eb;
        }
        .kadesh-range::-moz-range-progress {
          height: 14px;
          border-radius: 9999px;
          background: #f97316;
        }
        .kadesh-range::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          border: 2px solid #f97316;
          background:
            radial-gradient(circle at center, #fff7ed 0 26%, transparent 27%),
            #f97316;
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
          transition: transform 0.15s ease;
        }
      `}</style>
    </div>
  );
}
