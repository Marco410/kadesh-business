"use client";

import { useQuery } from '@apollo/client';
import { GET_CATEGORIES_QUERY, GetCategoriesQueryResult } from '../queries';

export function useCategories() {
  const { data, loading, error, refetch } = useQuery<GetCategoriesQueryResult>(
    GET_CATEGORIES_QUERY,
    {
      fetchPolicy: 'cache-and-network',
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

