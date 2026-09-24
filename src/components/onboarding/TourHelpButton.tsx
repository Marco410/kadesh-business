"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "kadesh/utils/cn";
import { useOnboarding } from "./OnboardingProvider";
import { getTour, getTourForLocation } from "./registry";

type TourHelpButtonProps = {
  /** Tour a lanzar. Sin valor, se elige el de la sección actual (o el de bienvenida). */
  tourId?: string;
  className?: string;
};

export function TourHelpButton({ tourId, className }: TourHelpButtonProps) {
  const { startTour, isTourActive } = useOnboarding();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tour =
    (tourId ? getTour(tourId) : undefined) ??
    getTourForLocation(pathname ?? "", searchParams?.get("tab") ?? null);

  return (
    <button
      type="button"
      onClick={() => startTour(tour.id)}
      disabled={isTourActive}
      aria-label={`Ver tutorial: ${tour.title}`}
      title={`Ver tutorial: ${tour.title}`}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#616161] transition-colors hover:bg-[#f5f5f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]",
        className,
      )}
    >
      <HugeiconsIcon icon={HelpCircleIcon} size={16} />
      <span className="hidden sm:inline">Tutorial</span>
    </button>
  );
}
