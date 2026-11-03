"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "kadesh-sidebar-collapsed";

function read(storageKey: string): boolean {
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Menú lateral colapsado (solo iconos) en escritorio, guardado en el navegador. Sin `storageKey`
 * el menú no se puede colapsar. Si el navegador bloquea storage, el menú sigue usable.
 */
export function useSidebarCollapsed(storageKey?: string): [boolean, (next: boolean) => void] {
  const collapsed = useSyncExternalStore(
    subscribe,
    () => (storageKey ? read(storageKey) : false),
    () => false,
  );
  const setCollapsed = useCallback(
    (next: boolean) => {
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // Preferencia local; sin storage solo no se recuerda.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [storageKey],
  );
  return [collapsed, setCollapsed];
}
