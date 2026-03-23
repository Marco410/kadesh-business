"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import {
  UPDATE_USER_MUTATION,
  type UpdateUserResponse,
  type UpdateUserVariables,
} from "kadesh/utils/queries";

/**
 * Mutación para marcar `lastLoginAt` tras login. Usa `useMutation` como el resto de auth.
 * Llamar después de persistir el session token en localStorage.
 */
export function useTouchUserLastLogin() {
  const [mutate] = useMutation<UpdateUserResponse, UpdateUserVariables>(
    UPDATE_USER_MUTATION,
  );

  return useCallback(
    async (userId: string) => {
      try {
        await mutate({
          variables: {
            where: { id: userId },
            data: { lastLoginAt: new Date().toISOString() },
          },
        });
      } catch {
        // No bloquear login si el backend rechaza o no expone aún el campo
      }
    },
    [mutate],
  );
}
