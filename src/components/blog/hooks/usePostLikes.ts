"use client";

import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_POST_LIKE_MUTATION, 
  CreatePostLikeVariables, 
  CreatePostLikeResponse,
  GET_POST_LIKES_SUMMARY_QUERY,
  GetPostLikesSummaryResponse,
  GetPostLikesSummaryVariables,
  DELETE_POST_LIKE_MUTATION,
  DeletePostLikeVariables,
  DeletePostLikeResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function usePostLikes(postId: string) {
  const { user } = useUser();

  // El total lo cuenta el back; de las filas solo se trae mi like (si hay sesión).
  const postWhere = { post: { id: { equals: postId } } };
  const { data: likesData, loading: likesLoading, refetch: refetchLikes } = useQuery<
    GetPostLikesSummaryResponse,
    GetPostLikesSummaryVariables
  >(GET_POST_LIKES_SUMMARY_QUERY, {
    variables: {
      where: postWhere,
      mineWhere: user?.id ? { ...postWhere, user: { id: { equals: user.id } } } : postWhere,
      withMine: Boolean(user?.id),
    },
    skip: !postId,
  });

  const likesCount = likesData?.postLikesCount ?? 0;

  const userLike = user?.id ? likesData?.myLikes?.[0] ?? null : null;

  const isLiked = !!userLike;

  const [createPostLike, { loading: isCreatingLike }] = useMutation<
    CreatePostLikeResponse,
    CreatePostLikeVariables
  >(CREATE_POST_LIKE_MUTATION, {
    onCompleted: () => {
      refetchLikes();
    },
    onError: (error) => {
      console.error('Error al dar like:', error);
    },
  });

  const [deletePostLike, { loading: isDeletingLike }] = useMutation<
    DeletePostLikeResponse,
    DeletePostLikeVariables
  >(DELETE_POST_LIKE_MUTATION, {
    onCompleted: () => {
      refetchLikes();
    },
    onError: (error) => {
      console.error('Error al eliminar like:', error);
    },
  });

  const handleLike = async () => {
    if (isCreatingLike || isDeletingLike || !postId || !user?.id) return;

    try {
      if (isLiked && userLike) {
        await deletePostLike({
          variables: {
            where: {
              id: userLike.id,
            },
          },
        });
      } else {
        await createPostLike({
          variables: {
            data: {
              post: {
                connect: {
                  id: postId,
                },
              },
              user: user?.id
                ? {
                    connect: {
                      id: user.id,
                    },
                  }
                : null,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error al manejar like:', error);
    }
  };

  return {
    likesCount,
    isLiked,
    userLike,
    loading: likesLoading,
    isCreatingLike,
    isDeletingLike,
    handleLike,
    refetchLikes,
  };
}

