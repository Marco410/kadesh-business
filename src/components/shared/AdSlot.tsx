"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { cn } from "kadesh/utils/cn";
import AdInfoButton from "./AdInfoButton";
import HouseAd from "./HouseAd";

interface AdSlotProps {
  /**
   * ID del bloque de AdSense (data-ad-slot), para cuando se active en este sitio. Hoy el bloque
   * muestra anuncios propios de KADESH, con o sin él (igual que en kadesh-landing).
   */
  slot?: string;
  /** Solo se monta si coincide; evita pintar dos bloques cuando hay versión móvil y de escritorio. */
  media?: string;
  className?: string;
}

/**
 * ¿Coincide la media query? En el servidor y al hidratar responde `false` (el bloque no entra al
 * HTML del servidor) y después se actualiza solo con los cambios de tamaño.
 */
function useMediaQuery(query: string | undefined) {
  return useSyncExternalStore(
    (onChange) => {
      if (!query) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => (query ? window.matchMedia(query).matches : true),
    () => false,
  );
}

/**
 * Bloque de publicidad discreto, marcado como "Publicidad" y con el "?" que explica por qué hay
 * anuncios. Solo se pinta en el navegador (no entra al HTML del servidor ni a la hidratación).
 * Mismo bloque que el detalle de animal en kadesh-landing, con los colores de este sitio.
 */
export default function AdSlot({ media, className }: AdSlotProps) {
  const pathname = usePathname();
  const matches = useMediaQuery(media);

  if (!matches) return null;

  return (
    <aside
      // La key cambia el anuncio al navegar entre artículos sin recargar.
      key={pathname}
      aria-label="Publicidad"
      className={cn(
        "flex min-h-[284px] min-w-0 flex-col rounded-2xl border border-[#e0e0e0] bg-white p-2 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 pl-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#757575] dark:text-[#9e9e9e]">
          Publicidad
        </span>
        <AdInfoButton />
      </div>
      <HouseAd placement={pathname.split("/")[1] || "inicio"} />
    </aside>
  );
}
