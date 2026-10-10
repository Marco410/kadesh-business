"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "kadesh/core/routes";
import { ADMIN_TABS, CLIENT_SECTIONS, type AdminTab } from "../constants";

type ParamPatch = Record<string, string | null | undefined>;

/**
 * Navegación de Operaciones por query params (todo vive en `Routes.panelAdmin`).
 * - `setParams`: cambia filtros/vistas de la sección actual (replace, sin ensuciar el historial).
 * - `goTo` / `openCompany` / `openPerson`: entran a otra sección o a un detalle (push, para que
 *   "atrás" regrese a la lista con sus filtros).
 */
export function useAdminNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (params: URLSearchParams, mode: "replace" | "push") => {
      const qs = params.toString();
      const href = qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin;
      if (mode === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [router],
  );

  const setParams = useCallback(
    (patch: ParamPatch, mode: "replace" | "push" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      navigate(next, mode);
    },
    [navigate, searchParams],
  );

  const goTo = useCallback(
    (tab: AdminTab, params: ParamPatch = {}, mode: "replace" | "push" = "push") => {
      const next = new URLSearchParams();
      if (tab !== ADMIN_TABS.OVERVIEW) next.set("tab", tab);
      for (const [key, value] of Object.entries(params)) {
        if (value) next.set(key, value);
      }
      navigate(next, mode);
    },
    [navigate],
  );

  const openCompany = useCallback(
    (
      companyId: string,
      options?: { detalle?: string | null; sub?: string | null; persona?: string | null },
    ) => {
      goTo(ADMIN_TABS.CLIENTS, {
        empresa: companyId,
        detalle:
          options?.detalle && options.detalle !== CLIENT_SECTIONS.SUMMARY
            ? options.detalle
            : null,
        sub: options?.sub ?? null,
        persona: options?.persona ?? null,
      });
    },
    [goTo],
  );

  /** Persona con empresa → 360 de su empresa con ella en foco; sin empresa → su ficha. */
  const openPerson = useCallback(
    (userId: string, companyId?: string | null) => {
      if (companyId) openCompany(companyId, { persona: userId });
      else goTo(ADMIN_TABS.CLIENTS, { usuario: userId });
    },
    [goTo, openCompany],
  );

  return { searchParams, setParams, goTo, openCompany, openPerson };
}
