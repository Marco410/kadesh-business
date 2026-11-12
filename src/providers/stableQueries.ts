import { ApolloLink, type Operation } from "@apollo/client";
import { canonicalStringify, getMainDefinition } from "@apollo/client/utilities";
import { readSessionToken } from "kadesh/utils/sessionToken";

/**
 * Consultas "estables" del panel: datos que casi no cambian (empresa del usuario, suscripción,
 * planes, si la IA está activa) y que piden muchas pantallas a la vez.
 *
 * El cliente usa `cache-and-network` por defecto, así que cada componente que se monta las volvía
 * a pedir: de 3 a 5 peticiones idénticas en cada cambio de sección o al abrir un modal. Con
 * `useStableQuery`, si la misma consulta ya se respondió hace menos de `STABLE_QUERY_TTL_MS`, se
 * lee de la caché de Apollo y no sale petición.
 *
 * Qué mantiene los datos al día:
 * - pasado el TTL, el siguiente montaje vuelve a pedir;
 * - cualquier mutación borra el registro: lo que se monte después vuelve a pedir;
 * - el registro es de una sola sesión: si el token cambia (iniciar o cerrar sesión, empezar o
 *   terminar "entrar como", otra pestaña que cambió de cuenta) se borra entero, así que nunca se
 *   da por reciente algo que respondió la sesión de otra persona;
 * - `refetch()`, `refetchQueries` y las consultas `network-only` siguen yendo a la red y
 *   actualizan la caché para todos.
 *
 * Para agregar una consulta: su nombre de operación aquí y `useStableQuery` donde se usa.
 */
export const STABLE_OPERATIONS: ReadonlySet<string> = new Set([
  "UserCompanyCategories",
  "SubscriptionStatus",
  "SaasPlans",
  "CompanyAiLiveStatus",
]);

export const STABLE_QUERY_TTL_MS = 60_000;

/**
 * Mutaciones que no cambian nada de lo anterior y se disparan solas al montar pantallas. Si
 * borraran el registro, nunca habría nada "reciente". `RemainingCredits` es una lectura hecha
 * mutación (`useRemainingCredits`).
 */
const READ_ONLY_MUTATIONS: ReadonlySet<string> = new Set(["RemainingCredits"]);

const answeredAt = new Map<string, number>();

/** Token de la sesión a la que pertenece el registro (`null` = sin sesión). */
let registrySession: string | null = null;

/**
 * Borra el registro si la sesión ya no es la que lo llenó y devuelve el token actual. Se llama
 * antes de leer o escribir, así cubre cualquier forma de cambiar de sesión sin depender de que
 * cada flujo (login, logout, "entrar como", sesión vencida) se acuerde de avisar.
 */
function syncRegistrySession(): string | null {
  const token = readSessionToken();
  if (token !== registrySession) {
    answeredAt.clear();
    registrySession = token;
  }
  return token;
}

export function stableQueryKey(operationName: string, variables: unknown): string {
  return `${operationName}:${canonicalStringify(variables ?? {})}`;
}

/** ¿Esta consulta ya se respondió desde la red hace poco? */
export function isStableQueryFresh(key: string): boolean {
  syncRegistrySession();
  const at = answeredAt.get(key);
  return at !== undefined && Date.now() - at < STABLE_QUERY_TTL_MS;
}

function operationKind(operation: Operation): string | null {
  try {
    const definition = getMainDefinition(operation.query);
    return definition.kind === "OperationDefinition" ? definition.operation : null;
  } catch {
    return null;
  }
}

/** Anota cuándo respondió la red cada consulta estable y olvida todo al pasar una mutación. */
export const stableQueriesLink = new ApolloLink((operation, forward) => {
  const kind = operationKind(operation);
  const name = operation.operationName;

  if (kind === "mutation" && !READ_ONLY_MUTATIONS.has(name)) {
    // Antes y después: lo que se monte mientras la mutación está en vuelo tampoco usa lo viejo.
    answeredAt.clear();
    return forward(operation).map((result) => {
      answeredAt.clear();
      return result;
    });
  }

  if (kind === "query" && STABLE_OPERATIONS.has(name)) {
    const key = stableQueryKey(name, operation.variables);
    const sentWith = syncRegistrySession();
    return forward(operation).map((result) => {
      // Si la sesión cambió mientras la petición iba en camino, esa respuesta no se anota.
      if (!result.errors?.length && syncRegistrySession() === sentWith) {
        answeredAt.set(key, Date.now());
      }
      return result;
    });
  }

  return forward(operation);
});
