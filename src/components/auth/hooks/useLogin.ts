"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import {
  AUTHENTICATE_USER_MUTATION,
  AuthenticateUserVariables,
  AuthenticateUserResponse,
} from "kadesh/utils/queries";
import {
  USER_AUTH_LOG_SOURCE,
  USER_AUTH_LOG_STEP,
} from "kadesh/constants/user-auth-log";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { useTouchUserLastLogin } from "./useTouchUserLastLogin";
import { useLogUserAuth } from "./useLogUserAuth";
import { maskEmailForAuthLog, safeLogMessage } from "kadesh/utils/auth-log-helpers";

interface UseLoginOptions {
  redirectTo?: string | null;
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter();
  const touchUserLastLoginAt = useTouchUserLastLogin();
  const logUserAuth = useLogUserAuth();
  const { refreshUser, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginAttemptStartedAtRef = useRef<number | null>(null);
  const lastLoginEmailRef = useRef("");

  const [authenticateUser, { loading }] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION, {
    onCompleted: async (data) => {
      const durationMs =
        loginAttemptStartedAtRef.current != null
          ? Date.now() - loginAttemptStartedAtRef.current
          : null;

      if (!data.authenticateUserWithPassword) {
        logUserAuth({
          source: USER_AUTH_LOG_SOURCE.CUSTOM_AUTH,
          step: USER_AUTH_LOG_STEP.CUSTOM_AUTH_FAIL,
          success: false,
          message: "Respuesta de autenticación vacía",
          emailMasked: maskEmailForAuthLog(lastLoginEmailRef.current),
          responseSnapshot: { method: "password", reason: "empty_response" },
          durationMs,
        });
        setError("Error al iniciar sesión");
        return;
      }

      if (
        data.authenticateUserWithPassword.__typename ===
        "UserAuthenticationWithPasswordSuccess"
      ) {
        const { sessionToken, item } = data.authenticateUserWithPassword;
        if (sessionToken && typeof window !== "undefined") {
          localStorage.setItem("keystonejs-session-token", sessionToken);
          const expires = new Date();
          expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isSecure = window.location.protocol === "https:";
          document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        }
        logUserAuth({
          user: { connect: { id: item.id } },
          source: USER_AUTH_LOG_SOURCE.CUSTOM_AUTH,
          step: USER_AUTH_LOG_STEP.CUSTOM_AUTH_LOGIN,
          success: true,
          message: "Inicio de sesión con contraseña correcto",
          emailMasked: maskEmailForAuthLog(item.email),
          responseSnapshot: {
            method: "password",
            userId: item.id,
          },
          durationMs,
        });
        await touchUserLastLoginAt(item.id);
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
        const failMsg = safeLogMessage(
          data.authenticateUserWithPassword.message,
        );
        logUserAuth({
          source: USER_AUTH_LOG_SOURCE.CUSTOM_AUTH,
          step: USER_AUTH_LOG_STEP.CUSTOM_AUTH_FAIL,
          success: false,
          message:
            failMsg ||
            "Credenciales no válidas (authenticateUserWithPassword)",
          emailMasked: maskEmailForAuthLog(lastLoginEmailRef.current),
          responseSnapshot: { method: "password", reason: "auth_failure" },
          durationMs,
        });
        setError(
            "El correo electrónico o la contraseña ingresados son incorrectos. Por favor verifica tus datos e intenta nuevamente."
        );
      }
    },
    onError: (error) => {
      const durationMs =
        loginAttemptStartedAtRef.current != null
          ? Date.now() - loginAttemptStartedAtRef.current
          : null;
      logUserAuth({
        source: USER_AUTH_LOG_SOURCE.CUSTOM_AUTH,
        step: USER_AUTH_LOG_STEP.CUSTOM_AUTH_FAIL,
        success: false,
        message: safeLogMessage(error.message || "Error de red o servidor"),
        emailMasked: maskEmailForAuthLog(lastLoginEmailRef.current),
        responseSnapshot: { method: "password", reason: "graphql_error" },
        durationMs,
      });
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

    lastLoginEmailRef.current = emailToUse.trim();
    loginAttemptStartedAtRef.current = Date.now();

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
