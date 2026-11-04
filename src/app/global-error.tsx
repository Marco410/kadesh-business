"use client";

import { useEffect } from "react";
import { isChunkLoadError, reportClientError } from "kadesh/utils/activity";

/**
 * Error en el layout raíz: reemplaza toda la página (por eso trae su propio `<html>` y estilos en
 * línea, sin depender del CSS del sitio). Se reporta a Operaciones → Actividad → Errores.
 */
export default function GlobalError({
  error,
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
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fff",
          color: "#212121",
          padding: "16px",
        }}
      >
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ color: "#ea580c", fontWeight: 600, fontSize: 14, margin: 0 }}>Algo salió mal</p>
          <h1 style={{ fontSize: 24, margin: "8px 0 12px" }}>No pudimos cargar Kadesh</h1>
          <p style={{ fontSize: 14, color: "#4b5563", margin: 0 }}>
            Ya nos llegó el aviso del error. Recarga la página; si sigue pasando, escríbenos.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              height: 44,
              padding: "0 24px",
              borderRadius: 999,
              border: "none",
              background: "#f97316",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </main>
      </body>
    </html>
  );
}
