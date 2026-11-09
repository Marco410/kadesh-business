import { createApolloClient } from "kadesh/providers/apollo-client";
import { AUTHENTICATED_ITEM_QUERY } from "./queries";
import type { AuthenticatedItem } from "./types";

/**
 * - `ok`: el back respondió; `user` es `null` si el token ya no vale.
 * - `unreachable`: no se pudo preguntar (sin red, back caído, ya con reintentos) o se canceló.
 *   No dice nada de la sesión: no hay que sacar a nadie por esto.
 */
export type SessionUserResult =
  | { status: "ok"; user: AuthenticatedItem | null }
  | { status: "unreachable" };

/** Cliente aparte (sin la caché de la app), creado una vez en lugar de uno por consulta. */
let sessionClient: ReturnType<typeof createApolloClient> | null = null;

/** `AuthenticatedItem` (pasa por los reintentos de `queryRetryLink`). `signal` la cancela. */
export async function fetchSessionUser(signal?: AbortSignal): Promise<SessionUserResult> {
  sessionClient ??= createApolloClient();
  try {
    const { data } = await sessionClient.query<{ authenticatedItem: AuthenticatedItem | null }>({
      query: AUTHENTICATED_ITEM_QUERY,
      fetchPolicy: "network-only",
      // Sin deduplicar: cancelar una consulta no debe cancelar otra igual que la reemplazó.
      context: { queryDeduplication: false, ...(signal ? { fetchOptions: { signal } } : {}) },
    });
    return { status: "ok", user: data?.authenticatedItem ?? null };
  } catch (error) {
    const networkError = (error as { networkError?: unknown } | null)?.networkError;
    if (networkError) return { status: "unreachable" };
    // Respondió con error de GraphQL: el back sí contestó y no hay usuario.
    return { status: "ok", user: null };
  }
}
