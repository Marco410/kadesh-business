"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "kadesh/utils/useIsClient";

/** Renderiza el modal en `document.body` para que `fixed` no lo recorte un padre con overflow o transform. */
export default function ModalPortal({ children }: { children: ReactNode }) {
  const mounted = useIsClient();

  if (!mounted) return null;
  return createPortal(children, document.body);
}
