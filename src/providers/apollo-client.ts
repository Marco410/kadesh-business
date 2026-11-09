import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
import { clientContextHeaders } from "kadesh/utils/activity/clientContext";
import { requestErrorLink } from "kadesh/utils/activity/requestErrorLink";
// @ts-ignore
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { notifySessionEnded, readSessionEndNotice } from "kadesh/utils/session-ended";
import { watchPageLifecycle } from "kadesh/utils/network";
import { readSessionToken } from "kadesh/utils/sessionToken";
import { queryRetryLink } from "./queryRetryLink";

// Para no reportar las peticiones que el navegador corta al cerrar o salir de la página.
watchPageLifecycle();

/** App y pantalla de cada petición: el back las guarda en Actividad (y en sus errores). */
const clientContextLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  return { headers: { ...headers, ...clientContextHeaders() } };
});

const authLink = setContext((_, { headers }) => {
  const token = readSessionToken();
  if (!token) return { headers };
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

/** Si el back avisa que el token ya no vale, se avisa a la app (la saca al login). */
const sessionEndedLink = new ApolloLink((operation, forward) =>
  forward(operation).map((result) => {
    const notice = readSessionEndNotice(result.extensions);
    if (notice) notifySessionEnded(notice);
    return result;
  }),
);

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

export const createApolloClient = () => {
  return new ApolloClient({
    // El reporte va antes que los reintentos: solo ve el error final.
    link: ApolloLink.from([
      clientContextLink,
      authLink,
      requestErrorLink,
      sessionEndedLink,
      queryRetryLink,
      uploadLink,
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // skip/take no deben fusionarse: cada página de Clientes es una entrada distinta.
            techBusinessLeads: {
              keyArgs: [
                "where",
                "statusWhere",
                "salesPersonWhere2",
                "orderBy",
                "skip",
                "take",
              ],
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
};

const client = createApolloClient();
export default client;
