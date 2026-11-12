"use client";

import { useMemo } from "react";
import {
  useQuery,
  type DocumentNode,
  type OperationVariables,
  type QueryHookOptions,
  type QueryResult,
  type TypedDocumentNode,
} from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { STABLE_OPERATIONS, isStableQueryFresh, stableQueryKey } from "./stableQueries";

/**
 * `useQuery` para las consultas estables del panel (ver `stableQueries.ts`): si la misma consulta
 * ya se respondió hace menos de un minuto, se lee de la caché y no sale otra petición; si no, se
 * comporta como siempre (`cache-and-network`). No acepta `fetchPolicy`: lo decide este hook.
 */
export function useStableQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: Omit<QueryHookOptions<TData, TVariables>, "fetchPolicy" | "nextFetchPolicy"> = {},
): QueryResult<TData, TVariables> {
  const name = getOperationName(query) ?? "";
  if (process.env.NODE_ENV !== "production" && !STABLE_OPERATIONS.has(name)) {
    console.warn(`useStableQuery: "${name}" no está en STABLE_OPERATIONS; se pedirá siempre.`);
  }
  const key = stableQueryKey(name, options.variables);
  // Se decide una vez por consulta (nombre + variables), no en cada render: cambiar de política
  // con la consulta ya montada la volvería a lanzar.
  const fetchPolicy = useMemo(
    () => (isStableQueryFresh(key) ? ("cache-first" as const) : ("cache-and-network" as const)),
    [key],
  );
  return useQuery<TData, TVariables>(query, {
    ...options,
    fetchPolicy,
  } as QueryHookOptions<TData, TVariables>);
}
