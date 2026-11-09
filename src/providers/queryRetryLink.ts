import type { Operation } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { getMainDefinition } from "@apollo/client/utilities";
import { isOffline, isPageLeaving, isRetryableNetworkError } from "kadesh/utils/network";

function isQuery(operation: Operation): boolean {
  try {
    const definition = getMainDefinition(operation.query);
    return definition.kind === "OperationDefinition" && definition.operation === "query";
  } catch {
    return false;
  }
}

/**
 * Reintenta las consultas (nunca mutaciones: repetirlas podría duplicar lo que hacen) cuando la
 * red falla o el proxy no responde: hasta 3 reintentos con espera exponencial y jitter (~0.5 s,
 * 1 s, 2 s en promedio, máx. 5 s). No reintenta sin red ni con la página yéndose: al volver la red,
 * `ApolloProviderWrapper` vuelve a pedir lo que quedó en error.
 *
 * Va debajo de `requestErrorLink`: el reporte solo ve el error final, y si un reintento sale bien
 * no se reporta nada. Al desmontar la pantalla, Apollo se desuscribe y esto cancela los reintentos
 * pendientes.
 */
export const queryRetryLink = new RetryLink({
  delay: { initial: 500, max: 5000, jitter: true },
  attempts: {
    max: 4,
    retryIf: (error, operation) =>
      isQuery(operation) && isRetryableNetworkError(error) && !isOffline() && !isPageLeaving(),
  },
});
