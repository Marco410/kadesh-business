"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  ADMIN_ACTIVITY_FEED_QUERY,
  type AdminActivityFeedInput,
  type AdminActivityFeedResponse,
} from "./activity-queries";

const DEFAULT_TAKE = 30;

/**
 * Feed de actividad con cursor (`before`). "Cargar más" junta las páginas en la misma
 * entrada de caché, igual que Novedades.
 */
export function useActivityFeed(
  input: Omit<AdminActivityFeedInput, "before">,
  options?: { skip?: boolean },
) {
  const variables = useMemo(
    () => ({ input: { ...input, take: input.take ?? DEFAULT_TAKE } }),
    [input],
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, fetchMore, refetch } =
    useQuery<AdminActivityFeedResponse>(ADMIN_ACTIVITY_FEED_QUERY, {
      variables,
      fetchPolicy: "cache-and-network",
      skip: options?.skip,
    });

  const feed = data?.adminActivityFeed;

  const loadMore = useCallback(async () => {
    if (!feed?.nextBefore) return;
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { input: { ...variables.input, before: feed.nextBefore } },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const seen = new Set(prev.adminActivityFeed.items.map((item) => item.id));
          return {
            adminActivityFeed: {
              ...fetchMoreResult.adminActivityFeed,
              items: [
                ...prev.adminActivityFeed.items,
                ...fetchMoreResult.adminActivityFeed.items.filter(
                  (item) => !seen.has(item.id),
                ),
              ],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  }, [feed?.nextBefore, fetchMore, variables.input]);

  return {
    items: feed?.items ?? [],
    hasMore: Boolean(feed?.hasMore),
    loading: loading && !feed,
    error,
    loadMore,
    loadingMore,
    refetch,
  };
}
