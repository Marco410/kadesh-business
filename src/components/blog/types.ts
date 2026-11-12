export interface Image {
  url: string;
}

export interface Author {
  /** No viene en el blog público (`authorProfile` no expone el id del usuario). */
  id?: string;
  name: string;
  lastName: string;
  username: string;
  verified: boolean;
  profileImage?: {
    url: string;
  } | null;
  createdAt: string;
}

export interface PostCategory {
  name: string;
  url: string;
}

export interface Tag {
  name: string;
}

export interface Content {
  document: any;
}

export interface BlogPost {
  id: string;
  image: Image;
  author: Author;
  category: PostCategory;
  commentsCount: number;
  content: Content;
  createdAt: string;
  excerpt: string;
  post_favoritesCount: number;
  post_likesCount: number;
  post_viewsCount: number;
  publishedAt: string | null;
  tags: Tag[];
  title: string;
  url: string;
}

/** Un artículo en la columna del blog (lo más leído, relacionados): sin contenido ni autor. */
export type BlogSidebarPost = Pick<
  BlogPost,
  'id' | 'title' | 'url' | 'publishedAt' | 'createdAt' | 'image' | 'category' | 'post_viewsCount'
>;

/** Categoría en la columna del blog, con cuántos artículos publicados tiene en este blog. */
export interface BlogSidebarCategory {
  id: string;
  name: string;
  url: string;
  postsCount: number;
}

/** Categoría del carrusel "Explora por categoría": todas, tengan artículos o no. */
export interface BlogCategoryCard {
  id: string;
  name: string;
  url: string;
  image?: { url: string } | null;
}

/** Relacionados de un artículo; `related: false` si no hubo y son los más recientes. */
export interface RelatedPostsResult {
  posts: BlogSidebarPost[];
  related: boolean;
}

export interface PostWhereInput {
  [key: string]: any;
}

export interface PostOrderByInput {
  updatedAt?: 'asc' | 'desc' | null;
  publishedAt?: 'asc' | 'desc' | null;
  createdAt?: 'asc' | 'desc' | null;
}

export interface PostsQueryVariables {
  take?: number | null;
  skip?: number | null;
  where?: PostWhereInput | null;
  orderBy?: PostOrderByInput[] | null;
}

export interface PostsQueryResponse {
  posts: BlogPost[];
  postsCount: number;
}

export interface Category {
  id: string;
  name: string;
  url: string;
  image?: {
    url: string;
  } | null;
  postsCount: number;
}

export interface CategoriesQueryResponse {
  categories: Category[];
}

export interface BlogPostDetail extends BlogPost {
  published: boolean;
  updatedAt: string;
}

export interface PostByUrlQueryVariables {
  url: string;
}

export interface PostByUrlQueryResponse {
  posts: BlogPostDetail[];
}

