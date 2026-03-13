"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];
const DEFAULT_ZOOM = 12;
const PIN_ZOOM = 15;

function loadExternalResource(
  tag: "link" | "script",
  attrs: Record<string, string>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrKey = tag === "link" ? "href" : "src";
    const attrVal = attrs[attrKey];
    if (document.querySelector(`${tag}[${attrKey}="${attrVal}"]`)) {
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

interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  getZoom(): number;
  on(
    event: string,
    fn: (e: { latlng: { lat: number; lng: number } }) => void,
  ): void;
}
interface LMarker {
  setLatLng(latlng: [number, number]): LMarker;
  addTo(map: LMap): LMarker;
}

interface LeafletLib {
  map(el: HTMLElement): LMap;
  marker(latlng: [number, number]): LMarker;
  tileLayer(
    url: string,
    options: { attribution: string },
  ): { addTo(map: LMap): unknown };
}

interface NominatimResult {
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  display_name: string;
}

interface LocationPickerProps {
  lat: string;
  lng: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onLocationChange: (lat: string, lng: string) => void;
  onAddressChange?: (
    address: string,
    city: string,
    state: string,
    country: string,
  ) => void;
  className?: string;
  isVisible?: boolean;
}

async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number,
): Promise<{
  address: string;
  city: string;
  state: string;
  country: string;
} | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "es" } },
    );
    if (!res.ok) return null;
    const data: NominatimResult = await res.json();
    const a = data.address;
    const streetAddress = [a.road, a.house_number].filter(Boolean).join(" ") || data.display_name;
    const city = a.city || a.town || a.village || a.municipality || "";
    return {
      address: streetAddress,
      city,
      state: a.state || "",
      country: a.country || "",
    };
  } catch {
    return null;
  }
}

export default function LocationPicker({
  lat,
  lng,
  address = "",
  city = "",
  state = "",
  country = "",
  onLocationChange,
  onAddressChange,
  className = "",
  isVisible = true,
}: LocationPickerProps) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localCountry, setLocalCountry] = useState(country);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const markerRef = useRef<LMarker | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalAddress(address);
    setLocalCity(city);
    setLocalState(state);
    setLocalCountry(country);
  }, [address, city, state, country]);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    (async () => {
      try {
        await loadExternalResource("link", {
          rel: "stylesheet",
          href: LEAFLET_CSS,
        });
        await loadExternalResource("script", { src: LEAFLET_JS });
        if (!cancelled) setLeafletReady(true);
      } catch (e) {
        console.error("Leaflet load error", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isVisible]);

  const doReverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      setIsGeocoding(true);
      const result = await reverseGeocodeNominatim(latitude, longitude);
      setIsGeocoding(false);
      if (result) {
        setLocalAddress(result.address);
        setLocalCity(result.city);
        setLocalState(result.state);
        setLocalCountry(result.country);
        onAddressChange?.(result.address, result.city, result.state, result.country);
      }
    },
    [onAddressChange],
  );

  const getL = useCallback((): LeafletLib | null => {
    return (window as unknown as { L?: LeafletLib }).L ?? null;
  }, []);

  const updateMarker = useCallback(
    (latitude: number, longitude: number) => {
      const L = getL();
      const map = mapRef.current;
      if (!L || !map) return;
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
      }
    },
    [getL],
  );

  const handleMapClick = useCallback(
    (e: { latlng: { lat: number; lng: number } }) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      onLocationChange(clickLat.toString(), clickLng.toString());
      updateMarker(clickLat, clickLng);

      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => {
        doReverseGeocode(clickLat, clickLng);
      }, 300);
    },
    [onLocationChange, updateMarker, doReverseGeocode],
  );

  useEffect(() => {
    const L = getL();
    if (!leafletReady || !mapContainerRef.current || mapRef.current || !L)
      return;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

    const center: [number, number] = hasCoords
      ? [latNum, lngNum]
      : DEFAULT_CENTER;
    const zoom = hasCoords ? PIN_ZOOM : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    if (hasCoords) {
      markerRef.current = L.marker([latNum, lngNum]).addTo(map);
    }

    map.on("click", handleMapClick);
  }, [leafletReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum) && mapRef.current) {
      updateMarker(latNum, lngNum);
      mapRef.current.setView([latNum, lngNum], mapRef.current.getZoom());
    }
  }, [lat, lng, updateMarker]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        onLocationChange(newLat.toString(), newLng.toString());
        updateMarker(newLat, newLng);
        mapRef.current?.setView([newLat, newLng], PIN_ZOOM);
        doReverseGeocode(newLat, newLng);
        setIsLoadingLocation(false);
      },
      () => {
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onLocationChange, updateMarker, doReverseGeocode]);

  const inputClassName =
    "w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]">
            Ubicación
          </label>
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
            Da clic en el mapa para seleccionar una ubicación.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLoadingLocation || !leafletReady}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HugeiconsIcon
            icon={Location01Icon}
            size={15}
            className={isLoadingLocation ? "animate-pulse" : "text-white"}
            strokeWidth={1.5}
          />
          {isLoadingLocation ? "Obteniendo..." : "Mi ubicación"}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden shadow-md border border-[#e0e0e0] dark:border-[#3a3a3a] relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[400px]"
          style={{ minHeight: 300 }}
        />
        {!leafletReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5] dark:bg-[#1e1e1e]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3" />
              <p className="text-[#616161] dark:text-[#b0b0b0] text-sm">
                Cargando mapa...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lp-lat"
            className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
          >
            Latitud
          </label>
          <input
            id="lp-lat"
            type="text"
            value={lat}
            disabled
            className={inputClassName}
            placeholder="Ej: 19.4326"
          />
        </div>
        <div>
          <label
            htmlFor="lp-lng"
            className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
          >
            Longitud
          </label>
          <input
            id="lp-lng"
            type="text"
            value={lng}
            disabled
            className={inputClassName}
            placeholder="Ej: -99.1332"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="lp-address"
            className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
          >
            Dirección{" "}
            {isGeocoding && (
              <span className="text-orange-500 text-xs">(Obteniendo...)</span>
            )}
          </label>
          <input
            id="lp-address"
            type="text"
            value={localAddress}
            onChange={(e) => {
              setLocalAddress(e.target.value);
              onAddressChange?.(
                e.target.value,
                localCity,
                localState,
                localCountry,
              );
            }}
            className={inputClassName}
            placeholder="Dirección"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="lp-city"
              className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
            >
              Ciudad
            </label>
            <input
              id="lp-city"
              type="text"
              value={localCity}
              onChange={(e) => {
                setLocalCity(e.target.value);
                onAddressChange?.(
                  localAddress,
                  e.target.value,
                  localState,
                  localCountry,
                );
              }}
              className={inputClassName}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <label
              htmlFor="lp-state"
              className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
            >
              Estado/Provincia
            </label>
            <input
              id="lp-state"
              type="text"
              value={localState}
              onChange={(e) => {
                setLocalState(e.target.value);
                onAddressChange?.(
                  localAddress,
                  localCity,
                  e.target.value,
                  localCountry,
                );
              }}
              className={inputClassName}
              placeholder="Estado/Provincia"
            />
          </div>
          <div>
            <label
              htmlFor="lp-country"
              className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1"
            >
              País
            </label>
            <input
              id="lp-country"
              type="text"
              value={localCountry}
              onChange={(e) => {
                setLocalCountry(e.target.value);
                onAddressChange?.(
                  localAddress,
                  localCity,
                  localState,
                  e.target.value,
                );
              }}
              className={inputClassName}
              placeholder="País"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
        Haz click en el mapa para seleccionar la ubicación
      </p>
    </div>
  );
}
