"use client";

import { useQuery } from '@apollo/client';
import { 
  GET_USER_FAVORITE_POSTS_QUERY,
  GetUserFavoritePostsResponse,
  GetUserFavoritePostsVariables,
} from '../queries';
import { BlogPost } from '../../blog/types';

export function useUserFavoritePosts(userId: string) {
  const { data, loading, error, refetch } = useQuery<
    GetUserFavoritePostsResponse,
    GetUserFavoritePostsVariables
  >(GET_USER_FAVORITE_POSTS_QUERY, {
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
  const posts: BlogPost[] = (data?.postFavorites || []).map((favorite) => ({
    id: favorite.post.id,
    title: favorite.post.title,
    url: favorite.post.url,
    excerpt: favorite.post.excerpt || '',
    image: favorite.post.image || { url: '' },
    author: {
      id: favorite.post.author.id,
      name: favorite.post.author.name,
      lastName: favorite.post.author.lastName || '',
      username: favorite.post.author.username || '',
      verified: favorite.post.author.verified || false,
      profileImage: favorite.post.author.profileImage,
      createdAt: favorite.post.author.createdAt || '',
    },
    category: favorite.post.category || { name: '', url: '' },
    commentsCount: favorite.post.commentsCount || 0,
    content: { document: [] },
    createdAt: favorite.post.createdAt,
    publishedAt: favorite.post.publishedAt,
    post_favoritesCount: favorite.post.post_favoritesCount,
    post_likesCount: favorite.post.post_likesCount,
    post_viewsCount: favorite.post.post_viewsCount,
    tags: favorite.post.tags || [],
  }));

  return {
    posts,
    loading,
    error,
    refetch,
  };
}
