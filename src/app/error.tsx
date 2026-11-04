"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { isChunkLoadError, reportClientError } from "kadesh/utils/activity";

/**
 * Pantalla caída (error de render). Se reporta a Operaciones → Actividad → Errores con la
 * pantalla en la que pasó, y la persona puede reintentar sin perder el resto del sitio.
 * Si no cargó el código (suele pasar justo después de desplegar), "Reintentar" recarga la página.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunk = isChunkLoadError(error.message);

  useEffect(() => {
    reportClientError({
      kind: chunk ? "chunk" : "crash",
      message: error.message,
      digest: error.digest ?? null,
      stack: error.stack ?? null,
    });
  }, [error, chunk]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          Algo salió mal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#212121] dark:text-white">
          {chunk ? "Hay una versión nueva" : "No pudimos mostrar esta pantalla"}
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {chunk
            ? "Recarga la página para usar la versión más reciente de Kadesh."
            : "Ya nos llegó el aviso del error. Intenta de nuevo; si sigue pasando, escríbenos."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => (chunk ? window.location.reload() : reset())}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            {chunk ? "Recargar" : "Reintentar"}
          </button>
          <Link
            href={Routes.home}
            className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-[#212121] transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
