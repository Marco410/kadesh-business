"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/components/profile/sales/constants";
import { useSyncLeadsArea } from "kadesh/components/profile/sales/obtener-clientes/hooks";
import CurrentPlanSection from "../CurrentPlanSection";
import { useUser } from "kadesh/utils/UserContext";
import { sileo } from "sileo";
import { Autocomplete, InfoTooltip, type AutocompleteOption } from "kadesh/components/shared";
import LeadsStatsCards, { type LeadsStatsCardsHandle } from "./LeadsStatsCards";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };
const DEFAULT_ZOOM = 12;
const DEFAULT_RADIUS_KM = 5;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

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
  const { user } = useUser();
  const [category, setCategory] = useState<string>(GOOGLE_PLACE_CATEGORIES[0].value);
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

    const categoryLabel = GOOGLE_PLACE_CATEGORIES.find((c) => c.value === category)?.label ?? category;

    const fetchData = async () => {
      const result = await syncLeadsArea({
        lat: pin.lat,
        lng: pin.lng,
        radiusKm,
        category,
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
              { n: 3, label: "Categoría y buscar" },
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
                    : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white/60 text-[#616161] dark:text-[#b0b0b0]";

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

        <div className="grid grid-cols-2 gap-6">
          <div className="w-full">
            <div className="space-y-4 h-full">
              <div className="mt-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#212121] dark:text-white">Filtros de búsqueda</h3>
                <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                  Afiná la calidad de los negocios antes de importarlos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 items-end">
              <div className="w-full">
                <Autocomplete
                  id="obtener-clientes-category"
                  label="Tipo de negocio"
                  value={category}
                  options={GOOGLE_PLACE_CATEGORIES.map(
                    (opt): AutocompleteOption => ({
                      id: opt.value,
                      label: opt.label,
                    })
                  )}
                  onChange={() => {
                    // El componente maneja internamente el texto de búsqueda
                  }}
                  onSelect={(option) => {
                    setCategory(option.id);
                  }}
                  placeholder="Buscar categoría..."
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                  Radio: {radiusKm} km
                </label>
                <input
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
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-orange-500"
                />
              </div>

      
            </div>

            {!pin && !isLoading && (
              <p className="text-xs mt-2 text-[#616161] dark:text-[#b0b0b0]">
                Selecciona un punto en el mapa (clic) para habilitar la búsqueda.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#1e1e1e] overflow-hidden">
            <div className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className="flex-1 text-left flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-[#f5f5f5] dark:hover:bg-[#252525] transition-colors"
                aria-expanded={showAdvancedFilters}
              >
                <span className="text-sm font-semibold text-[#212121] dark:text-white">
                  Filtros avanzados
                </span>
                <span className="text-[#616161] dark:text-[#b0b0b0] text-xs font-semibold">
                  {showAdvancedFilters ? "—" : "+"}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {minRating > 0 && (
                  <button
                    type="button"
                    onClick={() => setMinRating(0)}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-semibold hover:bg-blue-500/15 transition-colors"
                    aria-label="Eliminar filtro de rating"
                  >
                    Rating: {minRating.toFixed(1)}+ <span aria-hidden="true">×</span>
                  </button>
                )}
                {minReviews > 0 && (
                  <button
                    type="button"
                    onClick={() => setMinReviews(0)}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-semibold hover:bg-blue-500/15 transition-colors"
                    aria-label="Eliminar filtro de reseñas"
                  >
                    Reseñas: {minReviews}+ <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="p-3 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                      Rating mínimo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((opt) => {
                        const selected = minRating === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setMinRating(opt)}
                            disabled={isLoading}
                            className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-colors ${
                              selected
                                ? "border-blue-400 bg-blue-500 text-white"
                                : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white/70 dark:bg-[#121212] text-[#212121] dark:text-white hover:bg-white dark:hover:bg-[#252525]"
                            }`}
                          >
                            {opt === 0 ? "0" : `${opt.toFixed(1)}+`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                      Reseñas mínimas
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={minReviews}
                      onChange={(e) => setMinReviews(Number(e.target.value) || 0)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60 dark:focus:ring-orange-400/60 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="w-full mt-4 p-4">
              <button
                type="button"
                onClick={runSync}
                disabled={isLoading || !pin}
                className="w-full flex items-center justify-center gap-2 px-8 py-2 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <HugeiconsIcon icon={Search01Icon} size={16} className="text-white" /> {isLoading ? "Buscando negocios…" : "Buscar negocios"}
              </button>
              {!pin && !isLoading && (
                <p className="text-xs mt-2 text-[#616161] dark:text-[#b0b0b0]">
                  Selecciona un punto en el mapa (clic) para habilitar la búsqueda.
                </p>
              )}
            </div>
          </div>

          {pin && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Punto seleccionado: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)} — Radio: {radiusKm} km
            </p>
          )}
        </div>
        </div>
          <div className="w-full">
            <div className="relative z-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800/50">
            <div
              ref={mapContainerRef}
              className="w-full h-[550px]"
              style={{ minHeight: 320 }}
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
    </div>
  );
}
