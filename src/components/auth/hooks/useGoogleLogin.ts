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
import { trackCompleteRegistration } from "kadesh/utils/facebook-pixel";
import { persistSessionToken } from "./session";

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
  referralCode?: string | null;
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
        const { item, sessionToken, isNewUser } = result;
        // Solo el alta es una conversión: antes se mandaba el evento también
        // en cada inicio de sesión de una cuenta ya existente.
        if (isNewUser) {
          trackCompleteRegistration();
        }
        // Mismo token sellado que devuelve el login con contraseña: se guarda
        // igual. Los roles y la empresa los asigna el backend en el alta.
        if (sessionToken) {
          persistSessionToken(sessionToken);
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
          router.push(Routes.panel);
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
        variables: {
          idToken: response.credential,
          referrerCode: options?.referralCode ?? null,
          product: "saas",
        },
      });
    },
    [authenticateWithGoogle, options?.referralCode],
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
