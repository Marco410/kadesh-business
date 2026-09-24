"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { useUser } from "kadesh/utils/UserContext";
import {
  ONBOARDING_LAUNCH_DATE,
  ONBOARDING_STORAGE_PREFIX,
  TOUR_NAVIGATION_TIMEOUT_MS,
  TOUR_START_DELAY_MS,
  TOUR_TARGET_TIMEOUT_MS,
} from "./constants";
import { UPDATE_ONBOARDING_STATE_MUTATION } from "./mutations";
import { getTour, WELCOME_TOUR_ID } from "./registry";
import type {
  TourDefinition,
  TourProgress,
  TourStatus,
  TourStep,
} from "./types";

type OnboardingContextValue = {
  startTour: (tourId: string) => void;
  hasSeenTour: (tourId: string) => boolean;
  isTourActive: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: () => {},
  hasSeenTour: () => true,
  isTourActive: false,
});

export const useOnboarding = () => useContext(OnboardingContext);

function readLocalProgress(userId: string): TourProgress {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as TourProgress) : {};
  } catch {
    return {};
  }
}

function writeLocalProgress(userId: string, progress: TourProgress) {
  try {
    window.localStorage.setItem(
      ONBOARDING_STORAGE_PREFIX + userId,
      JSON.stringify(progress),
    );
  } catch {
    // localStorage no disponible: el backend sigue siendo la fuente de verdad.
  }
}

function isAtHref(href: string): boolean {
  const target = new URL(href, window.location.origin);
  const current = new URL(window.location.href);
  return (
    target.pathname === current.pathname &&
    target.searchParams.get("tab") === current.searchParams.get("tab")
  );
}

function waitForElement(
  selector: string,
  timeoutMs: number,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - startedAt >= timeoutMs) return resolve(null);
      window.setTimeout(check, 100);
    };
    check();
  });
}

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [updateOnboarding] = useMutation(UPDATE_ONBOARDING_STATE_MUTATION);
  const [savedProgress, setSavedProgress] = useState<{
    userId: string;
    data: TourProgress;
  } | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const runIdRef = useRef(0);
  const autoStartedRef = useRef(false);

  const userId = user?.id;

  // Unión backend + localStorage: si una de las dos fuentes falla no se vuelve a mostrar.
  const readProgress = useCallback((): TourProgress => {
    if (!userId) return {};
    return {
      ...(user?.onboardingState ?? {}),
      ...readLocalProgress(userId),
      ...(savedProgress?.userId === userId ? savedProgress.data : {}),
    };
  }, [userId, user?.onboardingState, savedProgress]);

  const createdAtMs = user?.createdAt ? new Date(user.createdAt).getTime() : null;
  const isLegacyUser =
    createdAtMs !== null &&
    createdAtMs < new Date(ONBOARDING_LAUNCH_DATE).getTime();

  const hasSeenTour = useCallback(
    (tourId: string) => {
      if (tourId === WELCOME_TOUR_ID && isLegacyUser) return true;
      const entry = readProgress()[tourId];
      const tour = getTour(tourId);
      return !!entry && !!tour && entry.version >= tour.version;
    },
    [readProgress, isLegacyUser],
  );

  const persist = useCallback(
    (tour: TourDefinition, status: TourStatus) => {
      if (!userId) return;
      const next: TourProgress = {
        ...readProgress(),
        [tour.id]: {
          status,
          at: new Date().toISOString(),
          version: tour.version,
        },
      };
      setSavedProgress({ userId, data: next });
      writeLocalProgress(userId, next);
      void updateOnboarding({
        variables: { where: { id: userId }, data: { onboardingState: next } },
      }).catch(() => {
        // Se conserva en localStorage; se reintentará con el siguiente tour.
      });
    },
    [userId, readProgress, updateOnboarding],
  );

  const stopTour = useCallback(() => {
    runIdRef.current += 1;
    driverRef.current?.destroy();
    driverRef.current = null;
    setIsTourActive(false);
  }, []);

  const startTour = useCallback(
    (tourId: string) => {
      const tour = getTour(tourId);
      if (!tour) return;

      stopTour();
      const runId = runIdRef.current;
      const steps: TourStep[] = tour.steps.filter(
        (step) => !step.when || step.when({ user }),
      );
      if (steps.length === 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let finished = false;

      const finish = (status: TourStatus) => {
        if (finished || runId !== runIdRef.current) return;
        finished = true;
        persist(tour, status);
        stopTour();
      };

      const d = driver({
        animate: !reduceMotion,
        smoothScroll: !reduceMotion,
        allowClose: true,
        overlayOpacity: 0.6,
        stagePadding: 6,
        popoverClass: "kadesh-tour",
        onDestroyStarted: () => finish("skipped"),
      });
      driverRef.current = d;
      setIsTourActive(true);

      const show = async (index: number, direction: 1 | -1): Promise<void> => {
        if (runId !== runIdRef.current) return;
        if (index >= steps.length) return finish("completed");
        if (index < 0) return show(0, 1);

        const step = steps[index];
        const needsNavigation = !!step.href && !isAtHref(step.href);
        if (needsNavigation && step.href) router.push(step.href);

        let element: Element | null = null;
        if (step.target) {
          element = await waitForElement(
            step.target,
            needsNavigation
              ? TOUR_NAVIGATION_TIMEOUT_MS
              : TOUR_TARGET_TIMEOUT_MS,
          );
          if (runId !== runIdRef.current) return;
          if (!element) return show(index + direction, direction);
        }

        const isLast = index === steps.length - 1;
        d.highlight({
          element: element ?? undefined,
          popover: {
            title: step.title,
            description: `${step.description}<span class="kadesh-tour-progress">Paso ${
              index + 1
            } de ${steps.length}</span>`,
            side: step.side ?? "bottom",
            align: "start",
            showButtons: index === 0 ? ["next", "close"] : ["next", "previous", "close"],
            nextBtnText: isLast ? "Finalizar" : "Siguiente",
            prevBtnText: "Anterior",
            onNextClick: () => void show(index + 1, 1),
            onPrevClick: () => void show(index - 1, -1),
          },
        });
      };

      void show(0, 1);
    },
    [persist, router, stopTour, user],
  );

  // Cerrar el tour si el proveedor se desmonta.
  useEffect(() => stopTour, [stopTour]);

  // Auto-inicio del tutorial de bienvenida para usuarios nuevos dentro del panel.
  useEffect(() => {
    if (autoStartedRef.current || !userId || !pathname?.startsWith("/panel")) {
      return;
    }
    if (hasSeenTour(WELCOME_TOUR_ID)) return;
    const timer = window.setTimeout(() => {
      autoStartedRef.current = true;
      startTour(WELCOME_TOUR_ID);
    }, TOUR_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [userId, pathname, hasSeenTour, startTour]);

  const value = useMemo(
    () => ({ startTour, hasSeenTour, isTourActive }),
    [startTour, hasSeenTour, isTourActive],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
