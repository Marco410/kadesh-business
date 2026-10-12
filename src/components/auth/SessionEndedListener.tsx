"use client";

import { useEffect, useRef } from "react";
import { Routes } from "kadesh/core/routes";
import { finishImpersonation, isImpersonating } from "kadesh/components/impersonation";
import { SESSION_ENDED_EVENT, type SessionEndNotice } from "kadesh/utils/session-ended";
import { SESSION_ENDED_PARAM } from "./hooks/session";

const SESSION_TOKEN_KEY = "keystonejs-session-token";

function storedToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearLocalSession() {
  try {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = "keystonejs-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

/**
 * Cuando el back avisa que la sesión ya no vale (Kadesh cerró las sesiones del equipo, la cuenta
 * se suspendió o el token venció), borra la sesión del navegador y lleva al login con el motivo.
 * Antes la persona se quedaba en un panel vacío. Si es un admin viendo el panel "como" alguien,
 * en lugar de eso regresa a Operaciones con su propia sesión. No pinta nada.
 */
export default function SessionEndedListener() {
  const handled = useRef(false);

  useEffect(() => {
    const onSessionEnded = (event: Event) => {
      const notice = (event as CustomEvent<SessionEndNotice>).detail;
      // En login y registro un token viejo no importa: el que vale es el que se va a guardar.
      if (handled.current || window.location.pathname.startsWith("/auth")) return;
      if (!storedToken()) {
        // Sin token propio: era una cookie vieja; solo se limpia.
        clearLocalSession();
        return;
      }
      handled.current = true;
      if (isImpersonating()) {
        void finishImpersonation();
        return;
      }
      clearLocalSession();
      const here = `${window.location.pathname}${window.location.search}`;
      const params = new URLSearchParams({ [SESSION_ENDED_PARAM]: notice?.status || "expired" });
      if (here.startsWith("/panel")) params.set("redirect", here);
      // Recarga completa: usuario, workspace y caché de Apollo se arman de cero.
      window.location.assign(`${Routes.auth.login}?${params.toString()}`);
    };
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
  }, []);

  return null;
}
