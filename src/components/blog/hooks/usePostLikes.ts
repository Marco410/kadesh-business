"use client";

import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_POST_LIKE_MUTATION, 
  CreatePostLikeVariables, 
  CreatePostLikeResponse,
  GET_POST_LIKES_QUERY,
  GetPostLikesResponse,
  GetPostLikesVariables,
  DELETE_POST_LIKE_MUTATION,
  DeletePostLikeVariables,
  DeletePostLikeResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function usePostLikes(postId: string) {
  const { user } = useUser();

  const { data: likesData, loading: likesLoading, refetch: refetchLikes } = useQuery<
    GetPostLikesResponse,
    GetPostLikesVariables
  >(GET_POST_LIKES_QUERY, {
    variables: {
      where: {
        post: {
          id: {
            equals: postId,
          },
        },
      },
    },
    skip: !postId,
  });

  const likes = likesData?.postLikes || [];
  const likesCount = likes.length;

  const userLike = user?.id
    ? likes.find((like) => like.user?.id === user.id) || null
    : null;

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
    likes,
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

