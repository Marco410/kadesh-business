"use client";

import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GET_POSTS_QUERY, GetPostsQueryResult, GetPostsQueryVariables } from '../queries';
import { BlogPost, PostOrderByInput, PostWhereInput } from '../types';
import { BLOG_PRODUCT_FILTER } from '../constants';

const DEFAULT_POSTS_PER_PAGE = 12;
const DEFAULT_ORDER_BY: PostOrderByInput[] = [{ publishedAt: 'desc' }];

function buildWhereClause(baseWhere: PostWhereInput | null): PostWhereInput {
  return {
    ...(baseWhere || {}),
    published: {
      equals: true,
    },
    product: BLOG_PRODUCT_FILTER,
  };
}

type UseBlogPostsOptions = {
  where?: PostWhereInput | null;
  orderBy?: PostOrderByInput[] | null;
  postsPerPage?: number;
  initialPosts?: BlogPost[];
  initialCount?: number;
};

export function useBlogPosts({
  where = null,
  orderBy = DEFAULT_ORDER_BY,
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
  initialPosts = [],
  initialCount = 0,
}: UseBlogPostsOptions = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const resolvedOrderBy = orderBy ?? DEFAULT_ORDER_BY;
  const whereClause = useMemo(() => buildWhereClause(where), [where]);
  const skip = (currentPage - 1) * postsPerPage;

  const filterKey = JSON.stringify({ where: whereClause, orderBy: resolvedOrderBy });
  const previousFilterKey = useRef(filterKey);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) {
      return;
    }
    previousFilterKey.current = filterKey;
    setCurrentPage(1);
  }, [filterKey]);

  const { data, loading, error } = useQuery<
    GetPostsQueryResult,
    GetPostsQueryVariables
  >(GET_POSTS_QUERY, {
    variables: {
      take: postsPerPage,
      skip,
      where: whereClause,
      orderBy: resolvedOrderBy,
    },
    notifyOnNetworkStatusChange: true,
  });

  const canUseInitial = currentPage === 1 && initialPosts.length > 0;
  const posts = data?.posts ?? (canUseInitial ? initialPosts : []);
  const totalPosts = data?.postsCount ?? initialCount;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const isLoading = loading && posts.length === 0;

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || (totalPages > 0 && page > totalPages) || page === currentPage) {
        return;
      }
      setCurrentPage(page);
    },
    [currentPage, totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((page) => {
      if (totalPages > 0 && page >= totalPages) {
        return page;
      }
      return page + 1;
    });
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage((page) => (page > 1 ? page - 1 : page));
  }, []);

  return {
    posts,
    loading: isLoading,
    isPageLoading: loading && !isLoading,
    error,
    currentPage,
    totalPages,
    totalPosts,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
