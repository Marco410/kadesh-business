"use client";

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_POST_FAVORITES_QUERY,
  type GetPostFavoritesResponse,
  type GetPostFavoritesVariables,
  type PostFavorite,
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

type PostFavoritesBatch = {
  /** Mi favorito de cada artículo de la lista (los que no tengo guardados no aparecen). */
  byPostId: Map<string, PostFavorite>;
  loading: boolean;
  refetch: () => Promise<unknown>;
};

const PostFavoritesBatchContext = createContext<PostFavoritesBatch | null>(null);

/**
 * Mis favoritos de toda una lista de artículos en una sola consulta. Sin esto cada tarjeta pedía
 * los suyos: 12 peticiones por página del blog. Sin sesión no se pide nada (un visitante no tiene
 * favoritos). `usePostFavorites` lo usa solo cuando la tarjeta está dentro de este proveedor.
 */
export function PostFavoritesBatchProvider({
  postIds,
  children,
}: {
  postIds: string[];
  children: ReactNode;
}) {
  const { user } = useUser();
  const userId = user?.id ?? null;
  // Mismo conjunto de artículos = mismas variables, aunque el arreglo sea otro en cada render.
  const idsKey = [...postIds].sort().join(',');

  const { data, loading, refetch } = useQuery<GetPostFavoritesResponse, GetPostFavoritesVariables>(
    GET_POST_FAVORITES_QUERY,
    {
      variables: {
        where: {
          post: { id: { in: idsKey ? idsKey.split(',') : [] } },
          user: { id: { equals: userId ?? '' } },
        },
      },
      skip: !userId || !idsKey,
    },
  );

  const value = useMemo<PostFavoritesBatch>(() => {
    const byPostId = new Map<string, PostFavorite>();
    for (const favorite of data?.postFavorites ?? []) {
      byPostId.set(favorite.post.id, favorite);
    }
    return { byPostId, loading, refetch };
  }, [data, loading, refetch]);

  return (
    <PostFavoritesBatchContext.Provider value={value}>{children}</PostFavoritesBatchContext.Provider>
  );
}

export function usePostFavoritesBatch(): PostFavoritesBatch | null {
  return useContext(PostFavoritesBatchContext);
}
