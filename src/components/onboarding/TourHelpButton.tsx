"use client";

import { Suspense } from "react";
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

function HelpButton({
  label,
  disabled,
  onClick,
  className,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border border-dash-line bg-dash-surface px-3.5 text-sm font-semibold text-dash-soft transition-colors hover:bg-dash-hover hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-60",
        className,
      )}
    >
      <HugeiconsIcon icon={HelpCircleIcon} size={16} />
      <span className="hidden sm:inline">Tutorial</span>
    </button>
  );
}

function TourHelpButtonInner({ tourId, className }: TourHelpButtonProps) {
  const { startTour, isTourActive } = useOnboarding();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tour =
    (tourId ? getTour(tourId) : undefined) ??
    getTourForLocation(pathname ?? "", searchParams?.get("tab") ?? null);

  return (
    <HelpButton
      label={`Ver tutorial: ${tour.title}`}
      onClick={() => startTour(tour.id)}
      disabled={isTourActive}
      className={className}
    />
  );
}

/**
 * `useSearchParams` exige un límite de Suspense: sin él, el prerender estático de cualquier
 * página que pinte el botón (todas las de `PanelShell`) rompe el build. El fallback es el mismo
 * botón deshabilitado para que la barra no salte al hidratar.
 */
export function TourHelpButton(props: TourHelpButtonProps) {
  return (
    <Suspense fallback={<HelpButton label="Ver tutorial" disabled className={props.className} />}>
      <TourHelpButtonInner {...props} />
    </Suspense>
  );
}
