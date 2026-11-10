"use client";

import { useEffect } from "react";
import { isChunkLoadError, reportClientError, type ClientErrorKind } from "./reportClientError";

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

/** Errores de hidratación de React: #418/#419/#422/#423/#425 minificados, o su texto en dev. */
const HYDRATION_ERROR =
  /Minified React error #(418|419|422|423|425)\b|Hydration failed|while hydrating|didn't match the client/i;

/**
 * La página la tradujo el navegador (Google Translate pone `translated-ltr`/`-rtl` en `<html>` y
 * mete `<font>`; el de Edge, atributos `_msttexthash`). Cambia el texto antes de que React hidrate
 * y la hidratación falla sin que haya un error en el código.
 *
 * La señal se recuerda: al fallar la hidratación React vuelve a pintar en el cliente y borra la
 * clase y los `<font>`, así que al llegar el error ya no están. Se revisa al cargar y se vigila
 * los primeros segundos (cuando se hidrata); después el observador se apaga.
 */
const TRANSLATION_WATCH_MS = 15_000;
let translated = false;

function hasTranslationSignals(): boolean {
  const html = document.documentElement;
  return (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl") ||
    document.querySelector("font, [_msttexthash]") !== null
  );
}

function watchTranslation() {
  if (hasTranslationSignals()) {
    translated = true;
    return;
  }
  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver((records) => {
    const found = records.some((record) =>
      record.type === "attributes"
        ? record.target === document.documentElement && hasTranslationSignals()
        : Array.from(record.addedNodes).some(
            (node) =>
              node.nodeName === "FONT" ||
              (node instanceof Element && node.hasAttribute("_msttexthash")),
          ),
    );
    if (found) {
      translated = true;
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  });
  window.setTimeout(() => observer.disconnect(), TRANSLATION_WATCH_MS);
}

function isMachineTranslated(): boolean {
  if (!translated && hasTranslationSignals()) translated = true;
  return translated;
}

function kindFor(message: string): ClientErrorKind {
  if (isChunkLoadError(message)) return "chunk";
  // Hidratación en una página traducida: aviso de baja prioridad, no "Error de código".
  if (HYDRATION_ERROR.test(message) && isMachineTranslated()) return "warning";
  return "script";
}

function onError(event: ErrorEvent) {
  const message = event.message || (event.error instanceof Error ? event.error.message : "");
  if (isNoise(message) || isNoise(event.filename || "x")) return;
  // Scripts de otros dominios (Google Maps, AdSense, GSI) no son de Kadesh.
  if (event.filename && !event.filename.startsWith(window.location.origin)) return;
  reportClientError({
    kind: kindFor(message),
    message,
    stack: event.error instanceof Error ? event.error.stack : null,
  });
}

function onRejection(event: PromiseRejectionEvent) {
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
}

let installed = false;

/**
 * Escucha `error` y `unhandledrejection` de `window` durante toda la vida de la página. Se instala al
 * cargar este módulo, antes de que React hidrate: los errores de hidratación (#418…) los reporta
 * React en el commit, antes de cualquier `useEffect`, y con el listener en un efecto se perdían.
 */
function installClientErrorListener() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  watchTranslation();
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
}

installClientErrorListener();

/** Asegura el listener (ya se instaló al cargar el módulo; esto cubre que se cargue tarde). */
export function useClientErrorListener() {
  useEffect(() => {
    installClientErrorListener();
  }, []);
}
