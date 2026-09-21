"use client";

import { useQuery } from '@apollo/client';
import { GET_POSTS_QUERY, GetPostsQueryResult, GetPostsQueryVariables } from '../queries';
import { PostWhereInput } from '../types';
import { BLOG_PRODUCT_FILTER } from '../constants';

interface UseRelatedPostsProps {
  currentPostId: string;
  tags?: Array<{ name: string }>;
  categoryUrl?: string;
  limit?: number;
}

export function useRelatedPosts({ 
  currentPostId, 
  tags = [], 
  categoryUrl,
  limit = 6 
}: UseRelatedPostsProps) {
  const where: PostWhereInput = {
    published: { equals: true },
    product: BLOG_PRODUCT_FILTER,
    id: {
      not: {
        equals: currentPostId,
      },
    },
    ...(tags && tags.length > 0 && categoryUrl
      ? {
          OR: [
            {
              tags: {
                some: {
                  name: {
                    in: tags.map((tag) => tag.name),
                  },
                },
              },
            },
            {
              category: {
                url: {
                  equals: categoryUrl,
                },
              },
            },
          ],
        }
      : {}),
  };

  const { data, loading, error } = useQuery<GetPostsQueryResult, GetPostsQueryVariables>(
    GET_POSTS_QUERY,
    {
      variables: {
        take: limit,
        skip: 0,
        where,
        orderBy: [{ publishedAt: 'desc' }],
      },
      fetchPolicy: 'cache-and-network',
      skip: !currentPostId,
    }
  );

  const relatedPosts = data?.posts || [];

  return {
    relatedPosts,
    loading,
    error,
  };
}

