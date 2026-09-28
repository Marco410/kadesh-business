"use client";

import type { ReactNode } from "react";
import { WorkspaceProvider } from "kadesh/components/profile/sales/workspaces";
import { OnboardingProvider } from "kadesh/components/onboarding";
import { HeroUIProvider } from "@heroui/system";

/**
 * Providers for the authenticated app shell (panel / admin).
 * Kept out of the marketing bundle so landing does not pay for driver.js
 * CSS/JS or workspace state on first paint.
 */
export default function PanelAppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HeroUIProvider locale="es-MX">
      <WorkspaceProvider>
        <OnboardingProvider>{children}</OnboardingProvider>
      </WorkspaceProvider>
    </HeroUIProvider>
  );
}
