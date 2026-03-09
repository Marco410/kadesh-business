"use client";

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_USER_COMMENTS_QUERY,
  GetUserCommentsResponse,
  GetUserCommentsVariables,
  DELETE_POST_COMMENT_MUTATION,
  DeletePostCommentVariables,
  DeletePostCommentResponse,
} from '../queries';

export function useUserComments(userId: string) {
  const { data, loading, error, refetch } = useQuery<
    GetUserCommentsResponse,
    GetUserCommentsVariables
  >(GET_USER_COMMENTS_QUERY, {
    variables: {
      where: {
        user: {
          id: {
            equals: userId,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const [deletePostComment, { loading: isDeletingComment }] = useMutation<
    DeletePostCommentResponse,
    DeletePostCommentVariables
  >(DELETE_POST_COMMENT_MUTATION, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error al eliminar comentario:', error);
    },
  });

  const handleDelete = async (commentId: string) => {
    if (isDeletingComment || !commentId) return;

    try {
      await deletePostComment({
        variables: {
          where: {
            id: commentId,
          },
        },
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  const comments = data?.postComments || [];

  return {
    comments,
    loading,
    error,
    refetch,
    handleDelete,
    isDeletingComment,
  };
}
