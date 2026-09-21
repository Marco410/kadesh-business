"use client";

import { useQuery } from '@apollo/client';
import { GET_POST_BY_URL_QUERY, GetPostByUrlQueryResult, GetPostByUrlQueryVariables } from '../queries';

export function usePostByUrl(url: string) {
  const { data, loading, error, refetch } = useQuery<GetPostByUrlQueryResult, GetPostByUrlQueryVariables>(
    GET_POST_BY_URL_QUERY,
    {
      variables: {
        url,
      },
      fetchPolicy: 'cache-and-network',
      skip: !url,
    }
  );

  const post = data?.posts?.[0] || null;

  return {
    post,
    loading,
    error,
    refetch,
  };
}

