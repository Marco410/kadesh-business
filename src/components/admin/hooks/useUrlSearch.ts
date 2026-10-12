"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { useAdminNavigation } from "./useAdminNavigation";

/**
 * Buscador cuyo texto vive en la URL (`?q=`), para que al volver de un detalle la lista
 * quede como estaba. Escribe en la URL con debounce y reinicia la página.
 */
export function useUrlSearch(param = "q") {
  const { searchParams, setParams } = useAdminNavigation();
  const fromUrl = searchParams.get(param) ?? "";
  const [value, setValue] = useState(fromUrl);
  const debounced = useDebouncedValue(value);
  const lastWritten = useRef(fromUrl);

  useEffect(() => {
    const next = debounced.trim();
    if (next === lastWritten.current.trim()) return;
    lastWritten.current = next;
    setParams({ [param]: next || null, pagina: null });
  }, [debounced, param, setParams]);

  return { value, setValue, query: fromUrl.trim() };
}
