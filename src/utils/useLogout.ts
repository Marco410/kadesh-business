"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";
import { trackLogout } from "kadesh/utils/activity";
import { useUser } from "kadesh/utils/UserContext";

const SESSION_TOKEN_KEY = "keystonejs-session-token";

/**
 * Cerrar sesión: registra la salida (antes de borrar el token, la petición lo necesita), borra el
 * token y las cookies, limpia el usuario y manda a la home. Lo usan la barra del sitio y la de
 * los paneles.
 */
export function useLogout() {
  const router = useRouter();
  const { setUser } = useUser();

  return useCallback(() => {
    try {
      trackLogout();
      localStorage.removeItem(SESSION_TOKEN_KEY);
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      setUser(undefined);
      router.push(Routes.home);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [router, setUser]);
}
