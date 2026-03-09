"use client";

import { useQuery } from '@apollo/client';
import { 
  GET_USER_LIKED_POSTS_QUERY,
  GetUserLikedPostsResponse,
  GetUserLikedPostsVariables,
} from '../queries';
import { BlogPost } from '../../blog/types';

export function useUserLikedPosts(userId: string) {
  const { data, loading, error, refetch } = useQuery<
    GetUserLikedPostsResponse,
    GetUserLikedPostsVariables
  >(GET_USER_LIKED_POSTS_QUERY, {
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
  });

  // Transformar los datos para que coincidan con BlogPost
  const posts: BlogPost[] = (data?.postLikes || []).map((like) => ({
    id: like.post.id,
    title: like.post.title,
    url: like.post.url,
    excerpt: like.post.excerpt || '',
    image: like.post.image || { url: '' },
    author: {
      id: like.post.author.id,
      name: like.post.author.name,
      lastName: like.post.author.lastName || '',
      username: like.post.author.username || '',
      verified: like.post.author.verified || false,
      profileImage: like.post.author.profileImage,
      createdAt: like.post.author.createdAt || '',
    },
    category: like.post.category || { name: '', url: '' },
    commentsCount: like.post.commentsCount || 0,
    content: { document: [] },
    createdAt: like.post.createdAt,
    publishedAt: like.post.publishedAt,
    post_favoritesCount: like.post.post_favoritesCount,
    post_likesCount: like.post.post_likesCount,
    post_viewsCount: like.post.post_viewsCount,
    tags: like.post.tags || [],
  }));

  return {
    posts,
    loading,
    error,
    refetch,
  };
}
