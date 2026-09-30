"use client";

import { useEffect, useState } from "react";

/**
 * URL de preview para un File local. Se revoca al cambiar el archivo o al desmontar.
 * El setState vive en un microtask para no sincronizar estado dentro del effect.
 */
export function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      queueMicrotask(() => setUrl(null));
      return;
    }

    const next = URL.createObjectURL(file);
    queueMicrotask(() => setUrl(next));
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
}
