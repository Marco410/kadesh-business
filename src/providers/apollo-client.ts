import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
// @ts-ignore
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { notifySessionEnded, readSessionEndNotice } from "kadesh/utils/session-ended";

const SESSION_TOKEN_KEY = "keystonejs-session-token";

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  const token = window.localStorage?.getItem(SESSION_TOKEN_KEY);
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
    link: ApolloLink.from([authLink, sessionEndedLink, uploadLink]),
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
