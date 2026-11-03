"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { revealVariants } from "./motion";

/**
 * Entrada fade-up al montar. `index` escalona (50 ms cada uno, tope 8). Solo anima al montar:
 * un refetch no la repite; cambiar de sección sí, porque la vista se vuelve a montar.
 */
export default function Reveal({
  index = 0,
  className,
  children,
  as = "div",
}: {
  index?: number;
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "li" | "header";
}) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      animate="show"
      custom={index}
      variants={revealVariants}
      className={className}
    >
      {children}
    </Component>
  );
}
