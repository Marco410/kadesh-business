"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import {
  AUTHENTICATE_USER_WITH_GOOGLE_MUTATION,
  type AuthenticateUserWithGoogleResponse,
  type AuthenticateUserWithGoogleVariables,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { loadGoogleGsiScript } from "kadesh/utils/load-google-gsi";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isDisplayed: () => boolean;
            }) => void,
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

interface UseGoogleLoginOptions {
  redirectTo?: string | null;
}

export function useGoogleLogin(options?: UseGoogleLoginOptions) {
  const router = useRouter();
  const { refreshUser, setUser } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const buttonRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedOnContainerRef = useRef<HTMLDivElement | null>(null);

  const [authenticateWithGoogle] = useMutation<
    AuthenticateUserWithGoogleResponse,
    AuthenticateUserWithGoogleVariables
  >(AUTHENTICATE_USER_WITH_GOOGLE_MUTATION, {
    onCompleted: async (data) => {
      const result = data?.authenticateUserWithGoogle;
      if (!result) {
        setError("Error al iniciar sesión con Google");
        setLoading(false);
        return;
      }

      if (result.__typename === "UserAuthenticationWithGoogleSuccess") {
        const { item, sessionToken } = result;
        // En Google login NO guardamos el `sessionToken` custom en localStorage/cookie,
        // porque Keystone autentica `authenticatedItem` con su propia sesión (cookie)
        // iniciada en el backend. Guardar un token distinto rompe la sesión.
        if (typeof window !== "undefined") {
          localStorage.removeItem("keystonejs-session-token");
        }
        console.log("result", result);

        if (sessionToken){
          localStorage.setItem("keystonejs-session-token", sessionToken);
          const expires = new Date();
          expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isSecure = window.location.protocol === "https:";
          document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        }
        const u = item as AuthenticatedItem & {
          roles?: Array<{ name: string; __typename?: string }>;
          __typename?: string;
        };
        const userFromLogin: AuthenticatedItem = {
          id: u.id,
          name: u.name ?? "",
          lastName: u.lastName ?? "",
          secondLastName: u.secondLastName ?? null,
          username: u.username ?? u.email ?? "",
          email: u.email ?? "",
          verified: u.verified ?? false,
          phone: u.phone && u.phone !== "" ? u.phone : null,
          profileImage: u.profileImage ?? null,
          roles: Array.isArray(u.roles)
            ? u.roles.map((r) => ({ name: r.name }))
            : null,
          birthday: u.birthday ?? null,
          age: u.age ?? null,
          createdAt: u.createdAt ?? new Date().toISOString(),
        };
        setUser(userFromLogin);
        await refreshUser();
        setLoading(false);
        if (options?.redirectTo) {
          router.push(options.redirectTo);
        } else {
          router.push(Routes.home);
        }
      } else if (result.__typename === "UserAuthenticationWithGoogleFailure") {
        setError(result.message || "No se pudo iniciar sesión con Google");
        setLoading(false);
      }
    },
    onError: (err) => {
      setError(err.message || "Error al iniciar sesión con Google");
      setLoading(false);
    },
  });

  const handleCredential = useCallback(
    (response: { credential: string }) => {
      setError("");
      setLoading(true);
      authenticateWithGoogle({
        variables: { idToken: response.credential },
      });
    },
    [authenticateWithGoogle],
  );

  const initAndRenderButton = useCallback(() => {
    const container = containerRef.current;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!container || !clientId) return;
    // Re-render if we're on a different container (e.g. switched tab)
    if (buttonRendered.current && renderedOnContainerRef.current === container)
      return;

    loadGoogleGsiScript()
      .then((google) => {
        if (!containerRef.current) return;
        const target = containerRef.current;
        if (buttonRendered.current && renderedOnContainerRef.current === target)
          return;

        if (!initialized.current) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredential,
            auto_select: false,
          });
          initialized.current = true;
        }

        google.accounts.id.renderButton(target, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: Math.max(target.offsetWidth || 0, 320),
          locale: "es",
        });
        buttonRendered.current = true;
        renderedOnContainerRef.current = target;
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Error al cargar Google Sign-In",
        );
      });
  }, [handleCredential]);

  /** Callback ref: pass to the div where the Google button should be rendered. Avoids FedCM. */
  const googleButtonRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (!el) {
        renderedOnContainerRef.current = null;
        return;
      }
      // When switching tabs we get a new container; allow re-render on it
      if (el !== renderedOnContainerRef.current) {
        buttonRendered.current = false;
      }
      initAndRenderButton();
    },
    [initAndRenderButton],
  );

  return {
    googleButtonRef,
    loading,
    error,
    setError,
  };
}
