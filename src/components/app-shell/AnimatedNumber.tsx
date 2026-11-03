"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { cn } from "kadesh/utils/cn";
import { DASH_EASE } from "./motion";

const defaultFormat = (value: number) => value.toLocaleString("es-MX");

/**
 * Cifra que cuenta hasta su valor (~0.9 s) al aparecer y al cambiar. El lector de pantalla
 * siempre recibe el valor final; con movimiento reducido se muestra directo.
 */
export default function AnimatedNumber({
  value,
  format = defaultFormat,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: DASH_EASE,
      onUpdate: (latest) => {
        from.current = latest;
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  const shown = reduce ? value : display;
  const text = format(Number.isInteger(value) ? Math.round(shown) : shown);

  return (
    <span className={cn("tabular-nums", className)}>
      <span aria-hidden>{text}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
