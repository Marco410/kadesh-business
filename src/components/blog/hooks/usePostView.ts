"use client";

import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { 
  CREATE_POST_VIEW_MUTATION, 
  CreatePostViewVariables, 
  CreatePostViewResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function usePostView(postId: string) {
  const { user } = useUser();
  const hasViewed = useRef<string | null>(null);

  const [createPostView, { loading: isCreatingView }] = useMutation<
    CreatePostViewResponse,
    CreatePostViewVariables
  >(CREATE_POST_VIEW_MUTATION, {
    onError: (error) => {
      console.error('Error al registrar vista:', error);
    },
  });

  useEffect(() => {
    if (!postId || hasViewed.current === postId) return;

    const registerView = async () => {
      try {
        await createPostView({
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
        hasViewed.current = postId;
      } catch (error) {
        console.error('Error al crear vista:', error);
      }
    };

    registerView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user?.id]);

  return {
    isCreatingView,
  };
}

