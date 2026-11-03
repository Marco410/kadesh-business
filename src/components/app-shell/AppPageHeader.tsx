"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * Encabezado de cada vista: eyebrow (fecha o grupo), título grande, descripción y acciones.
 * El `h1` recibe el foco al cambiar de sección (`data-app-title`).
 */
export default function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Reveal as="header" className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[13px] font-semibold tracking-[0.02em] text-dash-muted">{eyebrow}</p>
        ) : null}
        <h1
          tabIndex={-1}
          data-app-title=""
          className="text-[clamp(2rem,1.4rem+2.4vw,2.85rem)] font-bold leading-[1.05] tracking-[-0.04em] text-dash-ink focus:outline-none"
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-dash-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </Reveal>
  );
}
