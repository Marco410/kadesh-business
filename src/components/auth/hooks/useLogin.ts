"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import {
  AUTHENTICATE_USER_MUTATION,
  AuthenticateUserVariables,
  AuthenticateUserResponse,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";

interface UseLoginOptions {
  redirectTo?: string | null;
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter();
  const { refreshUser, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [authenticateUser, { loading }] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION, {
    onCompleted: async (data) => {
      if (!data.authenticateUserWithPassword) {
        setError("Error al iniciar sesión");
        return;
      }

      if (
        data.authenticateUserWithPassword.__typename ===
        "UserAuthenticationWithPasswordSuccess"
      ) {
        const { sessionToken, item } = data.authenticateUserWithPassword;
        if (sessionToken && typeof window !== "undefined") {
          console.log("sessionToken", sessionToken);
          localStorage.setItem("keystonejs-session-token", sessionToken);
          const expires = new Date();
          expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isSecure = window.location.protocol === "https:";
          document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        }
        const userFromLogin: AuthenticatedItem = {
          ...item,
          roles: item.roles ?? null,
          birthday: (item as { birthday?: string | null }).birthday ?? null,
          age: (item as { age?: string | null }).age ?? null,
          createdAt:
            (item as { createdAt?: string }).createdAt ??
            new Date().toISOString(),
        };
        setUser(userFromLogin);
        await refreshUser();
        if (options?.redirectTo) {
          router.push(options.redirectTo);
        }  else {
          router.push(Routes.panel);
        }
      } else if (
        data.authenticateUserWithPassword.__typename ===
        "UserAuthenticationWithPasswordFailure"
      ) {
        setError(
            "El correo electrónico o la contraseña ingresados son incorrectos. Por favor verifica tus datos e intenta nuevamente."
        );
      }
    },
    onError: (error) => {
      setError(error.message || "Error al iniciar sesión");
    },
  });

  const handleSubmit = async (
    e: React.FormEvent,
    submitEmail?: string,
    submitPassword?: string,
  ) => {
    e.preventDefault();
    setError("");

    const emailToUse = submitEmail ?? email;
    const passwordToUse = submitPassword ?? password;

    if (!emailToUse || !passwordToUse) {
      setError("Por favor completa todos los campos");
      return;
    }

    await authenticateUser({
      variables: {
        email: emailToUse,
        password: passwordToUse,
      },
    });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
  };
}
