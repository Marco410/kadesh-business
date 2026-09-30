"use client";

import { useState } from "react";

const UNSET = Symbol("useApplyOnKeyChange");

/**
 * Ejecuta `apply` durante el render cuando `key` cambia, incluido el primer render.
 * `apply` puede llamar setState del mismo componente. `key` debe ser un primitivo
 * estable: si es un objeto nuevo en cada render, el componente entra en bucle.
 */
export function useApplyOnKeyChange(key: unknown, apply: () => void): void {
  const [prevKey, setPrevKey] = useState<unknown>(UNSET);

  if (!Object.is(prevKey, key)) {
    setPrevKey(key);
    apply();
  }
}
