"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useApolloClient } from "@apollo/client";
import {
  AUTHENTICATE_USER_WITH_GOOGLE_MUTATION,
  UPDATE_USER_MUTATION,
  type AuthenticateUserWithGoogleResponse,
  type AuthenticateUserWithGoogleVariables,
  type UpdateUserVariables,
  type UpdateUserResponse,
} from "kadesh/utils/queries";
import {
  ROLES_BY_NAMES_QUERY,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { loadGoogleGsiScript } from "kadesh/utils/load-google-gsi";
import { trackCompleteRegistration } from "kadesh/utils/facebook-pixel";

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

/** Asigna roles Vendedor y Admin Company al usuario si no los tiene (p. ej. tras login con Google). */
async function ensureSalesRoles(
  client: ReturnType<typeof useApolloClient>,
  userId: string,
  currentRoleNames: string[]
): Promise<void> {
  const hasVendedor = currentRoleNames.some(
    (name) => name.toLowerCase() === Role.VENDEDOR.toLowerCase()
  );
  if (hasVendedor) return;

  const { data: rolesData } = await client.query<
    RolesByNamesResponse,
    RolesByNamesVariables
  >({
    query: ROLES_BY_NAMES_QUERY,
    variables: { where: { name: { in: [Role.VENDEDOR] } } },
  });

  const vendedorRoleId = rolesData?.roles?.find((r) => r.name === Role.VENDEDOR)?.id;
  const roleIds = [vendedorRoleId].filter(
    (id): id is string => Boolean(id)
  );
  if (roleIds.length === 0) return;

  await client.mutate<UpdateUserResponse, UpdateUserVariables>({
    mutation: UPDATE_USER_MUTATION,
    variables: {
      where: { id: userId },
      data: { roles: { connect: roleIds.map((id) => ({ id })) } },
    },
  });
}

export function useGoogleLogin(options?: UseGoogleLoginOptions) {
  const router = useRouter();
  const client = useApolloClient();
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
        trackCompleteRegistration();
        const { item, sessionToken } = result;
        // En Google login NO guardamos el `sessionToken` custom en localStorage/cookie,
        // porque Keystone autentica `authenticatedItem` con su propia sesión (cookie)
        // iniciada en el backend. Guardar un token distinto rompe la sesión.
        if (typeof window !== "undefined") {
          localStorage.removeItem("keystonejs-session-token");
        }
        if (sessionToken) {
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
        const roleNames = Array.isArray(u.roles) ? u.roles.map((r) => r.name) : [];
        try {
          await ensureSalesRoles(client, u.id, roleNames);
        } catch {
          // No bloquear el login si falla la asignación de roles
        }
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
