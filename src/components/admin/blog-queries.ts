import { gql } from "@apollo/client";

export const ADMIN_BLOG_LIST_TAKE = 200;

export const ADMIN_BLOG_POSTS_QUERY = gql`
  query AdminBlogPosts(
    $where: PostWhereInput!
    $take: Int
    $skip: Int!
  ) {
    posts(
      where: $where
      take: $take
      skip: $skip
      orderBy: [{ updatedAt: desc }]
    ) {
      id
      title
      url
      excerpt
      product
      published
      publishedAt
      updatedAt
      image {
        url
      }
      category {
        id
        name
      }
      tags {
        id
        name
      }
    }
    postsCount(where: $where)
  }
`;

export type AdminBlogPostRow = {
  id: string;
  title: string | null;
  url: string | null;
  excerpt: string | null;
  product: string | null;
  published: boolean | null;
  publishedAt: string | null;
  updatedAt: string | null;
  image: { url: string } | null;
  category: { id: string; name: string | null } | null;
  tags: Array<{ id: string; name: string | null }>;
};

export type AdminBlogPostsResponse = {
  posts: AdminBlogPostRow[];
  postsCount: number;
};

export const ADMIN_BLOG_POST_QUERY = gql`
  query AdminBlogPost($id: ID!) {
    post(where: { id: $id }) {
      id
      title
      excerpt
      product
      published
      publishedAt
      content {
        document
      }
      image {
        url
      }
      category {
        id
        name
        product
      }
      tags {
        id
        name
      }
    }
  }
`;

export type AdminBlogPostDetail = {
  id: string;
  title: string | null;
  excerpt: string | null;
  product: string | null;
  published: boolean | null;
  publishedAt: string | null;
  content: { document: unknown } | null;
  image: { url: string } | null;
  category: { id: string; name: string | null; product: string | null } | null;
  tags: Array<{ id: string; name: string | null }>;
};

export type AdminBlogPostResponse = {
  post: AdminBlogPostDetail | null;
};

export const ADMIN_BLOG_CATEGORIES_QUERY = gql`
  query AdminBlogCategories($take: Int!) {
    categories(orderBy: [{ name: asc }], take: $take) {
      id
      name
      url
      product
      postsCount
      image {
        url
      }
    }
  }
`;

export type AdminBlogCategoryRow = {
  id: string;
  name: string | null;
  url: string | null;
  product: string | null;
  postsCount: number | null;
  image: { url: string } | null;
};

export type AdminBlogCategoriesResponse = {
  categories: AdminBlogCategoryRow[];
};

export const ADMIN_BLOG_TAGS_QUERY = gql`
  query AdminBlogTags($take: Int!) {
    tags(orderBy: [{ name: asc }], take: $take) {
      id
      name
      postsCount
    }
  }
`;

export type AdminBlogTagRow = {
  id: string;
  name: string | null;
  postsCount: number | null;
};

export type AdminBlogTagsResponse = {
  tags: AdminBlogTagRow[];
};

export const CREATE_ADMIN_POST_MUTATION = gql`
  mutation CreateAdminPost($data: PostCreateInput!) {
    createPost(data: $data) {
      id
      title
    }
  }
`;

export const UPDATE_ADMIN_POST_MUTATION = gql`
  mutation UpdateAdminPost($id: ID!, $data: PostUpdateInput!) {
    updatePost(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export const CREATE_ADMIN_CATEGORY_MUTATION = gql`
  mutation CreateAdminCategory($data: CategoryCreateInput!) {
    createCategory(data: $data) {
      id
      name
    }
  }
`;

export const UPDATE_ADMIN_CATEGORY_MUTATION = gql`
  mutation UpdateAdminCategory($id: ID!, $data: CategoryUpdateInput!) {
    updateCategory(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export const CREATE_ADMIN_TAG_MUTATION = gql`
  mutation CreateAdminTag($data: TagCreateInput!) {
    createTag(data: $data) {
      id
      name
    }
  }
`;
