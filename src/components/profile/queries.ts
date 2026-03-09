import { gql } from "@apollo/client";

// User Profile Queries
export const GET_USER_FAVORITE_POSTS_QUERY = gql`
  query GetUserFavoritePosts($where: PostFavoriteWhereInput!, $orderBy: [PostFavoriteOrderByInput!]) {
    postFavorites(where: $where, orderBy: $orderBy) {
      id
      createdAt
      post {
        id
        title
        url
        excerpt
        image {
          url
        }
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
        commentsCount
        post_likesCount
        post_favoritesCount
        post_viewsCount
        publishedAt
        createdAt
        tags {
          name
        }
      }
    }
  }
`;

export interface UserFavoritePost {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    url: string;
    excerpt: string | null;
    image: {
      url: string;
    } | null;
    author: {
      id: string;
      name: string;
      lastName: string | null;
      username: string;
      verified: boolean;
      profileImage: {
        url: string;
      } | null;
      createdAt: string;
    };
    category: {
      name: string;
      url: string;
    } | null;
    commentsCount: number;
    post_likesCount: number;
    post_favoritesCount: number;
    post_viewsCount: number;
    publishedAt: string | null;
    createdAt: string;
    tags: Array<{
      name: string;
    }>;
  };
}

export interface GetUserFavoritePostsResponse {
  postFavorites: UserFavoritePost[];
}

export interface GetUserFavoritePostsVariables {
  where: {
    user: {
      id: {
        equals: string;
      };
    };
  };
  orderBy?: Array<{
    createdAt?: 'asc' | 'desc';
  }>;
}

export const GET_USER_LIKED_POSTS_QUERY = gql`
  query GetUserLikedPosts($where: PostLikeWhereInput!, $orderBy: [PostLikeOrderByInput!]) {
    postLikes(where: $where, orderBy: $orderBy) {
      id
      createdAt
      post {
        id
        title
        url
        excerpt
        image {
          url
        }
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
        commentsCount
        post_likesCount
        post_favoritesCount
        post_viewsCount
        publishedAt
        createdAt
        tags {
          name
        }
      }
    }
  }
`;

export interface UserLikedPost {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    url: string;
    excerpt: string | null;
    image: {
      url: string;
    } | null;
    author: {
      id: string;
      name: string;
      lastName: string | null;
      username: string;
      verified: boolean;
      profileImage: {
        url: string;
      } | null;
      createdAt: string;
    };
    category: {
      name: string;
      url: string;
    } | null;
    commentsCount: number;
    post_likesCount: number;
    post_favoritesCount: number;
    post_viewsCount: number;
    publishedAt: string | null;
    createdAt: string;
    tags: Array<{
      name: string;
    }>;
  };
}

export interface GetUserLikedPostsResponse {
  postLikes: UserLikedPost[];
}

export interface GetUserLikedPostsVariables {
  where: {
    user: {
      id: {
        equals: string;
      };
    };
  };
  orderBy?: Array<{
    createdAt?: 'asc' | 'desc';
  }>;
}

export const GET_USER_COMMENTS_QUERY = gql`
  query GetUserComments($where: PostCommentWhereInput!, $orderBy: [PostCommentOrderByInput!]) {
    postComments(where: $where, orderBy: $orderBy) {
      id
      comment
      createdAt
      post {
        id
        title
        url
        image {
          url
        }
      }
    }
  }
`;

export interface UserComment {
  id: string;
  comment: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    url: string;
    image: {
      url: string;
    } | null;
  };
}

export interface GetUserCommentsResponse {
  postComments: UserComment[];
}

export interface GetUserCommentsVariables {
  where: {
    user: {
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

