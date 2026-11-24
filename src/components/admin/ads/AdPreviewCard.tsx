"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { AD_KIND_ICON, adTone, type AdKind } from "./constants";

/**
 * The ad as Kadesh Pet shows it: same frame ("Publicidad"), sizes and colors as the card of
 * kadesh-landing (`AdSlot` + `HouseAd`). Only for the editor's preview.
 */
export default function AdPreviewCard({
  kind,
  tone,
  brandLabel,
  title,
  body,
  ctaLabel,
  imageUrl,
  width,
}: {
  kind: string;
  tone: string;
  brandLabel: string;
  title: string;
  body: string;
  ctaLabel: string;
  imageUrl: string | null;
  /** `side`: the 316 px column of the web; `full`: full width (phone, tablet). */
  width: "side" | "full";
}) {
  const colors = adTone(tone);
  const icon = AD_KIND_ICON[kind as AdKind] ?? AD_KIND_ICON.brand;

  return (
    <aside
      aria-label="Vista previa del anuncio"
      className={cn(
        "flex min-h-[284px] min-w-0 flex-col rounded-2xl border border-[#ececec] bg-white p-2 dark:border-white/10 dark:bg-[#1b2230]",
        width === "side" ? "w-[316px] max-w-full" : "w-full",
      )}
    >
      <span className="mb-1 pl-1 text-[10px] font-medium uppercase tracking-wider text-[#9aa3b2]">Publicidad</span>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl", colors.card)} style={colors.vars}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-28 w-full shrink-0 object-cover" />
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col p-4">
          {brandLabel ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <HugeiconsIcon icon={icon} size={16} strokeWidth={1.75} />
              {brandLabel}
            </span>
          ) : null}
          <span className="mt-3 text-lg font-black leading-tight tracking-[-0.02em] text-[#121212] [overflow-wrap:anywhere] dark:text-white">
            {title || "Título del anuncio"}
          </span>
          {body ? (
            <span className="mb-3 mt-2 text-sm leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#c5ccd8]">
              {body}
            </span>
          ) : null}
          <span
            className={cn(
              "mt-auto inline-flex h-8 items-center justify-center gap-1 self-start rounded-md px-3 text-xs font-semibold",
              colors.button,
            )}
            style={colors.buttonStyle}
          >
            {ctaLabel || "Ver más"}
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
          </span>
        </div>
      </div>
    </aside>
  );
}
