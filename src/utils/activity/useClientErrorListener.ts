"use client";

import { useEffect } from "react";
import { isChunkLoadError, reportClientError } from "./reportClientError";

/**
 * Errores de código que nadie atrapó (`window.onerror` y promesas rechazadas): se reportan a
 * Actividad como `app.client_error`. Las pantallas caídas las reporta `error.tsx`; las peticiones
 * fallidas, el interceptor de Apollo.
 *
 * Descarta el ruido que no es de Kadesh: extensiones del navegador, scripts de terceros (Maps,
 * AdSense, Google), `ResizeObserver loop` y "Script error." (error de otro dominio sin detalle).
 * Los bots los descarta `reportClientError` para todos los reportes.
 */

const NOISE: RegExp[] = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /(chrome|moz|safari(-web)?)-extension:\/\//i,
  /Non-Error promise rejection captured/i,
  /AbortError|The user aborted a request|signal is aborted/i,
];

/** Fallas de red: ya las reporta el interceptor de Apollo (o son de terceros). */
const NETWORK = /Failed to fetch|NetworkError|Load failed|Network request failed/i;

function isNoise(text: string | null | undefined): boolean {
  return !text || NOISE.some((pattern) => pattern.test(text));
}

function kindFor(message: string) {
  return isChunkLoadError(message) ? "chunk" : "script";
}

export function useClientErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.message || (event.error instanceof Error ? event.error.message : "");
      if (isNoise(message) || isNoise(event.filename || "x")) return;
      // Scripts de otros dominios (Google Maps, AdSense, GSI) no son de Kadesh.
      if (event.filename && !event.filename.startsWith(window.location.origin)) return;
      reportClientError({
        kind: kindFor(message),
        message,
        stack: event.error instanceof Error ? event.error.stack : null,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { name?: string; message?: string; stack?: string } | string | null;
      const message =
        typeof reason === "string" ? reason : typeof reason?.message === "string" ? reason.message : "";
      if (isNoise(message) || NETWORK.test(message)) return;
      if (typeof reason === "object" && reason?.name === "ApolloError") return;
      reportClientError({
        kind: kindFor(message),
        message,
        stack: typeof reason === "object" ? reason?.stack ?? null : null,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
}
