"use client";

import { useCallback } from "react";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import {
  canAccessNavTab,
  type NavAccessContext,
} from "kadesh/components/profile/usuarios/can";
import { AI_ACTION_KINDS, type AiActionKind } from "./actionKinds";

export type AiActionLink = {
  label: string;
  href?: string;
  onClick?: () => void;
};

/**
 * A dónde lleva cada tipo de acción. Sin `navCtx` no hay enlaces al panel
 * (no sabemos qué pantallas puede abrir la persona); sin permiso, tampoco.
 */
export function useAiActionLinks({
  navCtx,
  onOpenCompanyInfo,
}: {
  navCtx?: NavAccessContext;
  onOpenCompanyInfo?: () => void;
}) {
  const { user } = useUser();

  return useCallback(
    (kind: AiActionKind): AiActionLink | null => {
      const { target, cta } = AI_ACTION_KINDS[kind];
      if (!target || !cta) return null;
      if (target === "info") {
        return onOpenCompanyInfo
          ? { label: cta, onClick: onOpenCompanyInfo }
          : null;
      }
      if (!navCtx) return null;
      if (target === "extraccion") return { label: cta, href: Routes.panel };
      if (!canAccessNavTab(user, target, navCtx)) return null;
      return { label: cta, href: `${Routes.panel}?tab=${target}` };
    },
    [navCtx, onOpenCompanyInfo, user],
  );
}
