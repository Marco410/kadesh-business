"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_USER_AUTH_LOG_MUTATION,
  type CreateUserAuthLogResponse,
  type CreateUserAuthLogVariables,
  type UserAuthLogCreateInput,
} from "kadesh/utils/queries";

/**
 * Persiste un registro en `UserAuthLog` (Keystone). No debe bloquear flujos de auth.
 */
export function useLogUserAuth() {
  const [mutate] = useMutation<
    CreateUserAuthLogResponse,
    CreateUserAuthLogVariables
  >(CREATE_USER_AUTH_LOG_MUTATION);

  return useCallback(
    (data: UserAuthLogCreateInput) => {
      void mutate({ variables: { data } }).catch(() => {
        // Ignorar: permisos GraphQL o lista no desplegada no deben afectar login
      });
    },
    [mutate],
  );
}
