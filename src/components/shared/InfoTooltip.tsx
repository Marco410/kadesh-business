"use client";

import { useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

interface InfoTooltipProps {
  /** Texto que se muestra en el tooltip al pasar el cursor o enfocar. */
  text: string;
  /** Clases adicionales para el contenedor (p. ej. alinear con texto). */
  className?: string;
}

/**
 * Icono de información que muestra un tooltip con el texto indicado.
 * Accesible: el tooltip aparece también al enfocar el icono (teclado).
 */
export default function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  const id = useId();
  return (
    <span
      className={`group relative inline-flex align-middle z-10000 ${className}`}
    >
      <span
        aria-describedby={id}
        className="inline-flex cursor-help text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white focus-within:text-[#212121] dark:focus-within:text-white outline-none rounded-full focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]"
        tabIndex={0}
      >
        <HugeiconsIcon icon={InformationCircleIcon} size={18} />
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal text-white bg-[#212121] dark:bg-[#333] rounded-lg shadow-lg max-w-[240px] sm:max-w-[320px] whitespace-normal text-left opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-100"
      >
        {text}
      </span>
    </span>
  );
}
