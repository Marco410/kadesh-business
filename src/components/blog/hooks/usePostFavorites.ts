"use client";

import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_POST_FAVORITE_MUTATION, 
  CreatePostFavoriteVariables, 
  CreatePostFavoriteResponse,
  GET_POST_FAVORITES_QUERY,
  GetPostFavoritesResponse,
  GetPostFavoritesVariables,
  DELETE_POST_FAVORITE_MUTATION,
  DeletePostFavoriteVariables,
  DeletePostFavoriteResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function usePostFavorites(postId: string) {
  const { user } = useUser();

  const { data: favoritesData, loading: favoritesLoading, refetch: refetchFavorites } = useQuery<
    GetPostFavoritesResponse,
    GetPostFavoritesVariables
  >(GET_POST_FAVORITES_QUERY, {
    variables: {
      where: {
        post: {
          id: {
            equals: postId,
          },
        },
        ...(user?.id && {
          user: {
            id: {
              equals: user.id,
            },
          },
        }),
      },
    },
    skip: !postId,
  });

  const favorites = favoritesData?.postFavorites || [];

  const userFavorite = user?.id
    ? favorites.find((favorite) => favorite.user?.id === user.id) || null
    : null;

  const isFavorited = !!userFavorite;
  const postFavorite = userFavorite;

  const [createPostFavorite, { loading: isCreatingFavorite }] = useMutation<
    CreatePostFavoriteResponse,
    CreatePostFavoriteVariables
  >(CREATE_POST_FAVORITE_MUTATION, {
    onCompleted: () => {
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Error al guardar en favoritos:', error);
    },
  });

  const [deletePostFavorite, { loading: isDeletingFavorite }] = useMutation<
    DeletePostFavoriteResponse,
    DeletePostFavoriteVariables
  >(DELETE_POST_FAVORITE_MUTATION, {
    onCompleted: () => {
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Error al eliminar de favoritos:', error);
    },
  });

  const handleFavorite = async () => {
    if (isCreatingFavorite || isDeletingFavorite || !postId || !user?.id) return;

    try {
      if (isFavorited && postFavorite) {
        await deletePostFavorite({
          variables: {
            where: {
              id: postFavorite.id,
            },
          },
        });
      } else {
        await createPostFavorite({
          variables: {
            data: {
              post: {
                connect: {
                  id: postId,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error);
    }
  };

  return {
    postFavorite,
    isFavorited,
    loading: favoritesLoading,
    isCreatingFavorite,
    isDeletingFavorite,
    handleFavorite,
    refetchFavorites,
  };
}
