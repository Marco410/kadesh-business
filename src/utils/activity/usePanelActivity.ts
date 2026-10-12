"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TRACK_EVENT, trackActivity } from "./track";

/** Cada cuánto se manda el latido con la pestaña visible (el back suma 5 min por latido). */
const HEARTBEAT_MS = 5 * 60 * 1000;

/** Operaciones es de Kadesh: lo que hace el admin ahí se registra aparte (admin.viewed_*). */
const UNTRACKED_PREFIXES = ["/panel/clientes/admin", "/admin"];

/** Ids en la ruta (cuid de Keystone) → ":id", para agrupar "abrió un lead" sin el id. */
function normalizeSegment(segment: string) {
  return /^[a-z0-9]{20,}$/i.test(segment) ? ":id" : segment;
}

/** `/panel?tab=leads` → "leads"; `/panel` → "extraccion"; `/panel/cotizacion/abc…` → "cotizacion/:id". */
export function panelSectionKey(pathname: string, tab: string | null): string | null {
  if (UNTRACKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  if (pathname === "/panel" || pathname === "/panel/") return tab || "extraccion";
  if (!pathname.startsWith("/panel/")) return null;
  return pathname.replace(/^\/panel\//, "").split("/").filter(Boolean).map(normalizeSegment).join("/");
}

/**
 * Uso del panel: qué secciones se abren y cuánto tiempo está abierto (latido cada 5 min con la
 * pestaña visible). Solo con sesión. Va una sola vez en el shell del panel.
 */
export function usePanelActivity(enabled: boolean) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const lastSection = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !pathname) return;
    const section = panelSectionKey(pathname, tab);
    if (!section || section === lastSection.current) return;
    lastSection.current = section;
    trackActivity(TRACK_EVENT.SECTION_VIEWED, { metadata: { section } });
  }, [enabled, pathname, tab]);

  useEffect(() => {
    if (!enabled) return;
    const beat = () => {
      if (document.visibilityState === "visible") trackActivity(TRACK_EVENT.HEARTBEAT);
    };
    beat();
    const interval = window.setInterval(beat, HEARTBEAT_MS);
    // Al volver a la pestaña: el back solo suma minutos si pasaron 4+ desde el último latido.
    document.addEventListener("visibilitychange", beat);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [enabled]);
}
