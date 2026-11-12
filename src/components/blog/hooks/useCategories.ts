"use client";

import { useQuery } from '@apollo/client';
import { GET_CATEGORIES_QUERY, GetCategoriesQueryResult } from '../queries';

export function useCategories({ skip = false }: { skip?: boolean } = {}) {
  const { data, loading, error, refetch } = useQuery<GetCategoriesQueryResult>(
    GET_CATEGORIES_QUERY,
    {
      fetchPolicy: 'cache-and-network',
      skip,
    }
  );

  const categories = data?.categories || [];

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

