"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Bone01Icon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";

/** Anuncios propios de KADESH que rotan en el bloque de publicidad (adaptado de kadesh-landing). */
const HOUSE_ADS = [
  {
    id: "pet",
    brand: "KADESH Pet",
    title: "¿Se perdió tu mascota? Repórtala gratis",
    body: "Publica el reporte en el mapa para que la gente de tu zona lo vea, y encuentra veterinarias cerca de ti.",
    cta: "Conocer Kadesh Pet",
    href: "https://pet.kadesh.com.mx/",
    icon: Bone01Icon,
    // Azul de marca de Kadesh Pet (--color-kadesh en su globals.css).
    tone: "bg-[#eaf1ff] text-[#1a56c8] dark:bg-[#216BFA]/15 dark:text-[#8db4ff]",
    button: "bg-[#216BFA] text-white hover:bg-[#1a56c8]",
  },
  {
    id: "food",
    brand: "KADESH Food",
    title: "El software para tu restaurante",
    body: "Punto de venta, cocina en tiempo real, menú QR, inventario y facturas en un solo lugar.",
    cta: "Conocer Kadesh Food",
    href: "https://food.kadesh.com.mx/",
    icon: Restaurant01Icon,
    // Verde de marca de Kadesh Food (--restro-green / --restro-green-button-hover).
    tone: "bg-[#ECF1EB] text-[#387F39] dark:bg-[#70B56A]/15 dark:text-[#8fcb8a]",
    button: "bg-[#70B56A] text-[#121212] hover:bg-[#629c5d]",
  },
] as const;

/** Cada cuánto cambia el anuncio propio. */
const ROTATE_MS = 10000;

function withUtm(href: string, placement: string, adId: string) {
  const url = new URL(href);
  url.searchParams.set("utm_source", "kadesh_business");
  url.searchParams.set("utm_medium", "house_ad");
  url.searchParams.set("utm_campaign", placement);
  url.searchParams.set("utm_content", adId);
  return url.toString();
}

export default function HouseAd({
  placement,
  className,
}: {
  /** Dónde aparece (p. ej. "animales"), para medirlo con las UTM. */
  placement: string;
  className?: string;
}) {
  // Empieza en uno al azar para que ambos se vean; solo se renderiza en el cliente.
  const [active, setActive] = useState(() =>
    Math.floor(Math.random() * HOUSE_ADS.length),
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || HOUSE_ADS.length < 2) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % HOUSE_ADS.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, active]);

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Anuncios de KADESH"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={cn("relative grid min-h-0 flex-1", className)}
    >
      {HOUSE_ADS.map((ad, index) => {
        const isActive = index === active;
        return (
          <a
            key={ad.id}
            href={withUtm(ad.href, placement, ad.id)}
            target="_blank"
            rel="noopener"
            aria-hidden={!isActive}
            tabIndex={isActive ? undefined : -1}
            className={cn(
              // Todas las diapositivas ocupan la misma celda: el alto es el de la más alta y no hay saltos.
              "col-start-1 row-start-1 flex min-h-0 flex-col rounded-xl p-4 transition-opacity duration-500 motion-reduce:transition-none",
              ad.tone,
              isActive ? "opacity-100" : "pointer-events-none invisible opacity-0",
            )}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <HugeiconsIcon icon={ad.icon} size={16} strokeWidth={1.75} />
              {ad.brand}
            </span>
            <span className="mt-3 text-lg font-black leading-tight tracking-[-0.02em] text-[#121212] dark:text-white">
              {ad.title}
            </span>
            <span className="mb-3 mt-2 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#b0b0b0]">
              {ad.body}
            </span>
            <span
              className={cn(
                "mt-auto inline-flex h-8 items-center justify-center gap-1 self-start rounded-md px-3 text-xs font-semibold transition-colors",
                ad.button,
              )}
            >
              {ad.cta}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
            </span>
          </a>
        );
      })}

      {HOUSE_ADS.length > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
          {HOUSE_ADS.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver anuncio de ${ad.brand}`}
              aria-current={index === active}
              className={cn(
                "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
                // Mismo color de texto (claro y oscuro) que la marca activa.
                HOUSE_ADS[active].tone
                  .split(" ")
                  .filter((c) => c.startsWith("text-") || c.startsWith("dark:text-"))
                  .join(" "),
                index === active ? "w-5 bg-current" : "w-2 bg-current opacity-35 hover:opacity-70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
