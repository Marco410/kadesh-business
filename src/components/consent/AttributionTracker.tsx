"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureFirstTouch, clearAttribution } from "kadesh/utils/attribution";
import { useCookieConsent } from "./CookieConsentContext";

/**
 * Guarda de dónde llegó la persona (primer contacto) para atribuir su registro. No pinta nada.
 * Rechazar cookies borra lo guardado y no se vuelve a guardar. Dentro del panel no se guarda:
 * ya es cliente.
 */
export function AttributionTracker() {
  const { status } = useCookieConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "rejected") {
      clearAttribution();
      return;
    }
    if (pathname?.startsWith("/panel") || pathname?.startsWith("/admin")) return;
    captureFirstTouch();
  }, [status, pathname]);

  return null;
}
