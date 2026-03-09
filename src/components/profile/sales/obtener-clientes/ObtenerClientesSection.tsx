"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GOOGLE_PLACE_CATEGORIES } from "kadesh/components/profile/sales/constants";
import { useSyncLeadsArea } from "kadesh/components/profile/sales/obtener-clientes/hooks";
import CurrentPlanSection from "../CurrentPlanSection";
import { useUser } from "kadesh/utils/UserContext";

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

// Leaflet loaded from CDN
interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
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
        options: { radius: number; color?: string; fillColor?: string; fillOpacity?: number; weight?: number }
      ): LeafletCircle;
      tileLayer(url: string, options: { attribution: string }): { addTo(map: LeafletMap): unknown };
    };
  }
}

export default function ObtenerClientesSection() {
  const { user } = useUser();
  const [category, setCategory] = useState<string>(GOOGLE_PLACE_CATEGORIES[0].value);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState<{
    created: number;
    alreadyInDb: number;
    skippedLowRating: number;
  } | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const { syncLeadsArea, loading: isLoading, error: syncError } = useSyncLeadsArea();

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
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(map);
      }

      const circle = circleRef.current;
      if (circle) map.fitBounds(circle.getBounds(), { padding: [20, 20] });
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

  const runSync = async () => {
    if (!pin) {
      setMessage({
        type: "error",
        text: "Haz clic en el mapa para colocar el punto de búsqueda",
      });
      return;
    }
    setMessage(null);
    setStats(null);

    try {
      const result = await syncLeadsArea({
        lat: pin.lat,
        lng: pin.lng,
        radiusKm,
        category,
        maxResults: 60,
      });

      if (!result) {
        setMessage({ type: "error", text: syncError?.message ?? "Error al sincronizar" });
        return;
      }

      if (result.success) {
        const created = result.created ?? 0;
        const alreadyInDb = result.alreadyInDb ?? 0;
        const skipped = result.skippedLowRating ?? 0;
        const baseMessage = result.message ?? "Sincronización completada";
        setMessage({
          type: "ok",
          text: baseMessage,
        });
        setStats({
          created,
          alreadyInDb,
          skippedLowRating: skipped,
        });
      } else {
        setMessage({ type: "error", text: result.message ?? "Error al sincronizar" });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Error de red",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CurrentPlanSection />
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Obtener negocios por zona
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          <strong>1.</strong> Haz clic en el mapa para colocar el punto de búsqueda.{" "} <br />
          <strong>2.</strong> Ajusta el radio (km). <br /><strong>3.</strong> Elige el tipo de negocio y
          pulsa <em>Buscar negocios</em>. Se importarán negocios de la zona; los que ya existan se
          omitirán.
        </p>

        <div className="flex flex-row sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de negocio
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
            >
              {GOOGLE_PLACE_CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Radio: {radiusKm} km
            </label>
            <input
              type="range"
              min={MIN_RADIUS_KM}
              max={MAX_RADIUS_KM}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-600 accent-orange-500"
            />
          </div>
          <div className="w-auto">
            <button
              type="button"
              onClick={runSync}
              disabled={isLoading || !pin}
              className="w-full sm:w-auto px-10 py-2 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Buscando negocios…" : "Buscar negocios"}
            </button>
          </div>
        </div>

        {pin && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Punto seleccionado: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)} — Radio: {radiusKm} km
          </p>
        )}
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "error"
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800/50">
        <div
          ref={mapContainerRef}
          className="w-full h-[500px]"
          style={{ minHeight: 320 }}
        />
      </div>
      {!leafletReady && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Cargando mapa…</p>
      )}
    </div>
  );
}
