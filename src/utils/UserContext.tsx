"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { fetchSessionUser } from "./getAuthUser";
import { hasSessionToken } from "./sessionToken";
import { AuthenticatedItem } from "./types";

interface UserContextType {
  user: AuthenticatedItem | undefined;
  loading: boolean;
  /**
   * Hay token pero no se pudo confirmar la sesión (sin red, back caído). Mientras tanto la página
   * se ve como invitado (o con el usuario que ya había) y se reintenta sola. Las pantallas que
   * piden sesión deben esperar, no mandar al login: `loading || sessionPending`.
   */
  sessionPending: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthenticatedItem | undefined>>;
}

const UserContext = createContext<UserContextType>({
  user: undefined,
  loading: true,
  sessionPending: false,
  refreshUser: async () => {},
  setUser: async () => {},
});

/** Reintentos con la página visible y en línea, además de al volver la red o la pestaña. */
const RETRY_DELAYS_MS = [15_000, 30_000, 60_000];

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [sessionPending, setSessionPending] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  /** `silent`: reintento de fondo, sin volver a `loading` (no parpadea la UI). */
  const checkSession = useCallback(async (silent: boolean) => {
    requestRef.current?.abort();
    requestRef.current = null;

    // Sin token no hay sesión que preguntar: ni `AuthenticatedItem` ni las consultas que cuelgan
    // del usuario (campana, contadores del menú). Así los bots y los visitantes no piden nada.
    if (!hasSessionToken()) {
      setUser(undefined);
      setSessionPending(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    if (!silent) setLoading(true);
    const result = await fetchSessionUser(controller.signal);
    // La reemplazó otra más nueva o se desmontó.
    if (controller.signal.aborted) return;
    requestRef.current = null;

    if (result.status === "unreachable") {
      // "Sin sesión por ahora": no se toca el usuario y se reintenta en silencio.
      setSessionPending(true);
    } else {
      setSessionPending(false);
      if (result.user) {
        setUser(result.user);
      } else if (!hasSessionToken()) {
        setUser(undefined);
      }
      // Si hay token pero devolvió null (ej. sesión Google que el backend aún no refleja), no
      // pisamos el user actual.
    }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(() => checkSession(false), [checkSession]);

  useEffect(() => {
    // En un callback de promesa: el estado cambia después del render, no dentro del efecto.
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void checkSession(false);
    });
    return () => {
      active = false;
      requestRef.current?.abort();
    };
  }, [checkSession]);

  // Sesión sin confirmar: reintenta al volver la red o la pestaña, y cada 15 s, 30 s, 60 s…
  useEffect(() => {
    if (!sessionPending) return;
    let attempt = 0;
    let timer: number | undefined;

    const retry = () => {
      if (document.visibilityState !== "visible" || navigator.onLine === false) return;
      void checkSession(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") retry();
    };
    const schedule = () => {
      const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
      timer = window.setTimeout(() => {
        attempt += 1;
        retry();
        schedule();
      }, delay);
    };

    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionPending, checkSession]);

  return (
    <UserContext.Provider value={{ user, loading, sessionPending, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
