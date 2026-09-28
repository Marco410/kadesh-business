"use client";

import type { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/system";

/** HeroUI only — used on /auth without onboarding or workspace weight. */
export default function AuthAppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return <HeroUIProvider locale="es-MX">{children}</HeroUIProvider>;
}
