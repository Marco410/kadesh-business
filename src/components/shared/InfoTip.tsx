"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import ModalPortal from "./ModalPortal";

const INFO_TIP_WIDTH = 288;
const INFO_TIP_MARGIN = 8;

/**
 * Ícono ⓘ que explica qué es un número o una columna. Se abre al tocarlo (sirve en teléfono, a
 * diferencia de un `title`) y se cierra al tocar fuera, con Escape o al hacer scroll. La burbuja va
 * en un portal con posición fija para que no la corte una tabla con scroll.
 */
export default function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setPosition(null), []);

  const toggle = (event: React.MouseEvent) => {
    // Puede estar dentro de una fila o tarjeta clicable: no abrir lo de abajo.
    event.stopPropagation();
    event.preventDefault();
    if (position) return close();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(INFO_TIP_WIDTH, window.innerWidth - INFO_TIP_MARGIN * 2);
    const left = Math.min(
      Math.max(rect.left - 12, INFO_TIP_MARGIN),
      window.innerWidth - width - INFO_TIP_MARGIN,
    );
    setPosition({ top: rect.bottom + 6, left, width });
  };

  useEffect(() => {
    if (!position) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (bubbleRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={`¿Qué es ${label}?`}
        aria-expanded={Boolean(position)}
        aria-controls={position ? id : undefined}
        className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full align-middle text-[#9e9e9e] normal-case tracking-normal transition-colors hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:hover:text-orange-400 cursor-pointer before:absolute before:-inset-2.5 before:content-['']"
      >
        <HugeiconsIcon icon={InformationCircleIcon} size={14} aria-hidden />
      </button>
      {position ? (
        <ModalPortal>
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={{ top: position.top, left: position.left, width: position.width }}
            className="fixed z-[70] rounded-xl border border-[#e0e0e0] bg-white p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-[#424242] shadow-lg dark:border-[#3a3a3a] dark:bg-[#262626] dark:text-[#e0e0e0]"
          >
            <p className="mb-1 font-semibold text-[#212121] dark:text-white">{label}</p>
            {children}
          </div>
        </ModalPortal>
      ) : null}
    </>
  );
}

