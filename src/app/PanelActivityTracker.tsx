"use client";

import { Suspense } from "react";
import { usePanelActivity } from "kadesh/utils/activity";
import { useUser } from "kadesh/utils/UserContext";

function Tracker() {
  const { user } = useUser();
  usePanelActivity(Boolean(user?.id));
  return null;
}

/** Registro de uso del panel (secciones y tiempo activo). No pinta nada. */
export default function PanelActivityTracker() {
  // useSearchParams necesita Suspense para no sacar la página del render estático.
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
