import { createApolloClient } from "kadesh/providers/apollo-client";
import { AUTHENTICATED_ITEM_QUERY } from "./queries";

export async function getAuthenticatedUser(): Promise<any | null> {
  try {
    const client = createApolloClient();

    const { data } = await client.query({
      query: AUTHENTICATED_ITEM_QUERY,
      fetchPolicy: "network-only",
    });
    return data?.authenticatedItem ?? null;
  } catch (error) {
    return null;
  }
}
