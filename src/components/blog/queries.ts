import { gql } from '@apollo/client';
import { PostsQueryResponse, PostsQueryVariables, CategoriesQueryResponse, PostByUrlQueryResponse, PostByUrlQueryVariables } from './types';

export const GET_POSTS_QUERY = gql`
  query GetPosts($take: Int, $skip: Int!, $where: PostWhereInput!, $orderBy: [PostOrderByInput!]!) {
    posts(take: $take, skip: $skip, where: $where, orderBy: $orderBy) {
      id
      image {
        url
      }
      author {
        name
        profileImage {
          url
        }
      }
      category {
        name
      }
      commentsCount
      content {
        document
      }
      createdAt
      excerpt
      post_favoritesCount
      post_likesCount
      post_viewsCount
      publishedAt
      tags {
        name
      }
      title
      url
    }
    postsCount(where: $where)
  }
`;

export type GetPostsQueryResult = PostsQueryResponse;
export type GetPostsQueryVariables = PostsQueryVariables;

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories(where: { product: { in: ["saas", "all"] } }) {
      id
      url
      image {
        url
      }
      name
      postsCount
    }
  }
`;

export type GetCategoriesQueryResult = CategoriesQueryResponse;

export const GET_POST_BY_URL_QUERY = gql`
  query GetPostByUrl($url: String!) {
    posts(where: { url: { equals: $url }, published: { equals: true }, product: { in: ["saas", "all"] } }, take: 1) {
      id
      title
      url
      excerpt
      content {
        document
      }
      image {
        url
      }
      published
      publishedAt
      createdAt
      updatedAt
      author {
        id
        name
        lastName
        username
        verified
        profileImage {
          url
        }
        createdAt
      }
      category {
        name
        url
      }
      tags {
        name
      }
      commentsCount
      post_likesCount
      post_favoritesCount
      post_viewsCount
    }
  }
`;

export type GetPostByUrlQueryResult = PostByUrlQueryResponse;
export type GetPostByUrlQueryVariables = PostByUrlQueryVariables;

export const CREATE_POST_LIKE_MUTATION = gql`
  mutation CreatePostLike($data: PostLikeCreateInput!) {
    createPostLike(data: $data) {
      id
    }
  }
`;

export interface CreatePostLikeVariables {
  data: {
    post: {
      connect: {
        id: string;
      };
    } | null;
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreatePostLikeResponse {
  createPostLike: {
    id: string;
  };
}

export const GET_POST_LIKES_QUERY = gql`
  query GetPostLikes($where: PostLikeWhereInput!) {
    postLikes(where: $where) {
      id
      user {
        id
        name
      }
      post {
        id
        url
      }
      createdAt
    }
  }
`;

export interface PostLikeUser {
  id: string;
  name: string;
}

export interface PostLikePost {
  id: string;
  url: string;
}

export interface PostLike {
  id: string;
  user: PostLikeUser | null;
  post: PostLikePost;
  createdAt: string;
}

export interface GetPostLikesResponse {
  postLikes: PostLike[];
}

export interface GetPostLikesVariables {
  where: {
    post: {
      id: {
        equals: string;
      };
    };
  };
}

export const DELETE_POST_LIKE_MUTATION = gql`
  mutation DeletePostLike($where: PostLikeWhereUniqueInput!) {
    deletePostLike(where: $where) {
      id
    }
  }
`;

export interface DeletePostLikeVariables {
  where: {
    id: string;
  };
}

export interface DeletePostLikeResponse {
  deletePostLike: {
    id: string;
  };
}

export const CREATE_POST_VIEW_MUTATION = gql`
  mutation CreatePostView($data: PostViewCreateInput!) {
    createPostView(data: $data) {
      id
      post {
        id
      }
      user {
        id
      }
    }
  }
`;

export interface CreatePostViewVariables {
  data: {
    post: {
      connect: {
        id: string;
      };
    };
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreatePostViewResponse {
  createPostView: {
    id: string;
    post: {
      id: string;
    };
    user: {
      id: string;
    } | null;
  };
}

export const CREATE_POST_COMMENT_MUTATION = gql`
  mutation CreatePostComment($data: PostCommentCreateInput!) {
    createPostComment(data: $data) {
      id
      comment
      post {
        id
      }
      user {
        id
      }
    }
  }
`;

export interface CreatePostCommentVariables {
  data: {
    comment: string;
    post: {
      connect: {
        id: string;
      };
    };
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreatePostCommentResponse {
  createPostComment: {
    id: string;
    comment: string;
    post: {
      id: string;
    };
    user: {
      id: string;
    } | null;
  };
}

export const GET_POST_COMMENTS_QUERY = gql`
  query GetPostComments($where: PostCommentWhereInput!, $orderBy: [PostCommentOrderByInput!]) {
    postComments(where: $where, orderBy: $orderBy) {
      id
      comment
      post {
        id
      }
      user {
        id
        name
        lastName
        username
        verified
        profileImage {
          url
        }
      }
      createdAt
    }
  }
`;

export interface PostCommentUser {
  id: string;
  name: string;
  lastName: string;
  username: string;
  verified: boolean;
  profileImage?: {
    url: string;
  } | null;
}

export interface PostCommentPost {
  id: string;
}

export interface PostComment {
  id: string;
  comment: string;
  post: PostCommentPost;
  user: PostCommentUser | null;
  createdAt: string;
}

export interface GetPostCommentsResponse {
  postComments: PostComment[];
}

export interface GetPostCommentsVariables {
  where: {
    post: {
      id: {
        equals: string;
      };
    };
  };
  orderBy?: Array<{
    createdAt?: 'asc' | 'desc';
  }>;
}

export const DELETE_POST_COMMENT_MUTATION = gql`
  mutation DeletePostComment($where: PostCommentWhereUniqueInput!) {
    deletePostComment(where: $where) {
      id
    }
  }
`;

export interface DeletePostCommentVariables {
  where: {
    id: string;
  };
}

export interface DeletePostCommentResponse {
  deletePostComment: {
    id: string;
  };
}

export const CREATE_POST_FAVORITE_MUTATION = gql`
  mutation CreatePostFavorite($data: PostFavoriteCreateInput!) {
    createPostFavorite(data: $data) {
      id
      post {
        id
      }
      user {
        id
      }
    }
  }
`;

export interface CreatePostFavoriteVariables {
  data: {
    post: {
      connect: {
        id: string;
      };
    };
    user: {
      connect: {
        id: string;
      };
    } | null;
  };
}

export interface CreatePostFavoriteResponse {
  createPostFavorite: {
    id: string;
    post: {
      id: string;
    };
    user: {
      id: string;
    } | null;
  };
}

export const GET_POST_FAVORITES_QUERY = gql`
  query GetPostFavorites($where: PostFavoriteWhereInput!) {
    postFavorites(where: $where) {
      id
      post {
        id
      }
      user {
        id
      }
      createdAt
    }
  }
`;

export interface PostFavorite {
  id: string;
  post: {
    id: string;
  };
  user: {
    id: string;
  } | null;
  createdAt: string;
}

export interface GetPostFavoritesResponse {
  postFavorites: PostFavorite[];
}

export interface GetPostFavoritesVariables {
  where: {
    post: {
      id: {
        equals: string;
      };
    };
    user?: {
      id: {
        equals: string;
      };
    };
  };
}

export const DELETE_POST_FAVORITE_MUTATION = gql`
  mutation DeletePostFavorite($where: PostFavoriteWhereUniqueInput!) {
    deletePostFavorite(where: $where) {
      id
    }
  }
`;

export interface DeletePostFavoriteVariables {
  where: {
    id: string;
  };
}

export interface DeletePostFavoriteResponse {
  deletePostFavorite: {
    id: string;
  };
}

