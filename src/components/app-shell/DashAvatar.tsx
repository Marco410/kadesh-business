"use client";

import Image from "next/image";
import { cn } from "kadesh/utils/cn";

/** Dos iniciales: primera letra de las dos primeras palabras (separa por espacio, @ y punto). */
export function initialsOf(text: string): string {
  const parts = text
    .split(/[\s@.]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
  return letters.join("") || "K";
}

const SIZES = {
  sm: { box: "size-8 text-[12px]", px: 32 },
  md: { box: "size-10 text-[14px]", px: 40 },
  lg: { box: "size-16 text-[22px]", px: 64 },
} as const;

/** Avatar de los paneles: foto si hay, si no iniciales sobre el degradado naranja. */
export function DashAvatar({
  name,
  imageUrl,
  size = "sm",
  tone = "accent",
  className,
}: {
  name: string;
  imageUrl?: string | null;
  size?: keyof typeof SIZES;
  /** `danger` para filas de un fallo (Actividad). */
  tone?: "accent" | "danger" | "neutral";
  className?: string;
}) {
  const { box, px } = SIZES[size];
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 rounded-full object-cover", box, className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold tracking-[-0.02em]",
        tone === "accent" && "dash-grad-accent text-white",
        tone === "danger" && "bg-red-600 text-white",
        tone === "neutral" && "bg-dash-surface-3 text-dash-soft",
        box,
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
