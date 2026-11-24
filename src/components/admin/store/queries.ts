import { gql } from "@apollo/client";

/**
 * Operaciones → Kadesh Pet → Tienda. The product list uses the custom `adminStoreProducts`
 * (cover and variant count of every row in two batched queries); the detail and every write use
 * the API Keystone generates for the `Store*` lists, which is admin only.
 */

// ─── Products ───────────────────────────────────────────────────────────────────────────────

export type AdminStoreProductRow = {
  id: string;
  name: string;
  slug: string | null;
  source: string;
  status: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  inventoryPolicy: string;
  stockTotal: number;
  variantsCount: number;
  ratingAverage: number;
  ratingCount: number;
  salesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  externalId: string | null;
  category: string | null;
  brand: string | null;
  coverUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminStoreProductsResponse = {
  adminStoreProducts: {
    total: number;
    items: AdminStoreProductRow[];
    statusCounts: Array<{ key: string; count: number }>;
  };
};

export const ADMIN_STORE_PRODUCTS_QUERY = gql`
  query AdminStoreProducts(
    $search: String
    $source: String
    $status: String
    $categoryId: ID
    $outOfStock: Boolean
    $take: Int
    $skip: Int
  ) {
    adminStoreProducts(
      search: $search
      source: $source
      status: $status
      categoryId: $categoryId
      outOfStock: $outOfStock
      take: $take
      skip: $skip
    ) {
      total
      statusCounts {
        key
        count
      }
      items {
        id
        name
        slug
        source
        status
        priceCents
        compareAtPriceCents
        inventoryPolicy
        stockTotal
        variantsCount
        ratingAverage
        ratingCount
        salesCount
        viewsCount
        isFeatured
        externalId
        category
        brand
        coverUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export type AdminStoreVariant = {
  id: string;
  title: string | null;
  sku: string | null;
  priceCents: number | null;
  compareAtPriceCents: number | null;
  costCents: number | null;
  stock: number | null;
  order: number | null;
  isActive: boolean | null;
};

export type AdminStoreImage = {
  id: string;
  image: { url: string } | null;
  externalUrl: string | null;
  alt: string | null;
  order: number | null;
};

export type AdminStoreProductDetail = {
  id: string;
  name: string;
  slug: string | null;
  shortDescription: string | null;
  description: string | null;
  source: string;
  status: string;
  isFeatured: boolean | null;
  inventoryPolicy: string;
  externalId: string | null;
  externalUrl: string | null;
  affiliateUrl: string | null;
  suggestedPriceCents: number | null;
  externalSyncedAt: string | null;
  ratingAverage: number | null;
  ratingCount: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string } | null;
  brand: { id: string } | null;
  animalTypes: Array<{ id: string }>;
  variants: AdminStoreVariant[];
  images: AdminStoreImage[];
};

export const ADMIN_STORE_PRODUCT_QUERY = gql`
  query AdminStoreProduct($id: ID!) {
    storeProduct(where: { id: $id }) {
      id
      name
      slug
      shortDescription
      description
      source
      status
      isFeatured
      inventoryPolicy
      externalId
      externalUrl
      affiliateUrl
      suggestedPriceCents
      externalSyncedAt
      ratingAverage
      ratingCount
      metaTitle
      metaDescription
      category {
        id
      }
      brand {
        id
      }
      animalTypes {
        id
      }
      variants(orderBy: [{ order: asc }, { createdAt: asc }], take: 100) {
        id
        title
        sku
        priceCents
        compareAtPriceCents
        costCents
        stock
        order
        isActive
      }
      images(orderBy: [{ order: asc }, { createdAt: asc }], take: 50) {
        id
        image {
          url
        }
        externalUrl
        alt
        order
      }
    }
  }
`;

export type AdminStoreOptionsResponse = {
  storeCategories: Array<{ id: string; name: string; parent: { id: string; name: string } | null }>;
  storeBrands: Array<{ id: string; name: string }>;
  animalTypes: Array<{ id: string; name: string }>;
};

/** Everything the product form and the list filters pick from, in one request. */
export const ADMIN_STORE_OPTIONS_QUERY = gql`
  query AdminStoreOptions($take: Int!) {
    storeCategories(orderBy: [{ order: asc }, { name: asc }], take: $take) {
      id
      name
      parent {
        id
        name
      }
    }
    storeBrands(orderBy: [{ name: asc }], take: $take) {
      id
      name
    }
    animalTypes(orderBy: [{ order: asc }]) {
      id
      name
    }
  }
`;

export const CREATE_ADMIN_STORE_PRODUCT_MUTATION = gql`
  mutation CreateAdminStoreProduct($data: StoreProductCreateInput!) {
    createStoreProduct(data: $data) {
      id
      slug
    }
  }
`;

/**
 * One request per save: edited and removed variants and images go as batches, new ones are
 * created inline with the product. The product goes last so its totals are computed at the end.
 */
export const SAVE_ADMIN_STORE_PRODUCT_MUTATION = gql`
  mutation SaveAdminStoreProduct(
    $id: ID!
    $data: StoreProductUpdateInput!
    $variantUpdates: [StoreProductVariantUpdateArgs!]!
    $variantDeletes: [StoreProductVariantWhereUniqueInput!]!
    $imageUpdates: [StoreProductImageUpdateArgs!]!
    $imageDeletes: [StoreProductImageWhereUniqueInput!]!
  ) {
    updateStoreProductVariants(data: $variantUpdates) {
      id
    }
    deleteStoreProductVariants(where: $variantDeletes) {
      id
    }
    updateStoreProductImages(data: $imageUpdates) {
      id
    }
    deleteStoreProductImages(where: $imageDeletes) {
      id
    }
    updateStoreProduct(where: { id: $id }, data: $data) {
      id
      slug
    }
  }
`;

export const UPDATE_ADMIN_STORE_PRODUCT_MUTATION = gql`
  mutation UpdateAdminStoreProduct($id: ID!, $data: StoreProductUpdateInput!) {
    updateStoreProduct(where: { id: $id }, data: $data) {
      id
      status
      isFeatured
    }
  }
`;

export const DELETE_ADMIN_STORE_PRODUCT_MUTATION = gql`
  mutation DeleteAdminStoreProduct($id: ID!) {
    deleteStoreProduct(where: { id: $id }) {
      id
    }
  }
`;

// ─── Categories and brands ──────────────────────────────────────────────────────────────────

export type AdminStoreCategoryRow = {
  id: string;
  name: string;
  slug: string | null;
  order: number | null;
  isActive: boolean | null;
  parent: { id: string; name: string } | null;
  image: { url: string } | null;
};

export const ADMIN_STORE_CATEGORIES_QUERY = gql`
  query AdminStoreCategories($take: Int!) {
    storeCategories(orderBy: [{ order: asc }, { name: asc }], take: $take) {
      id
      name
      slug
      order
      isActive
      parent {
        id
        name
      }
      image {
        url
      }
    }
  }
`;

export const CREATE_ADMIN_STORE_CATEGORY_MUTATION = gql`
  mutation CreateAdminStoreCategory($data: StoreCategoryCreateInput!) {
    createStoreCategory(data: $data) {
      id
    }
  }
`;

export const UPDATE_ADMIN_STORE_CATEGORY_MUTATION = gql`
  mutation UpdateAdminStoreCategory($id: ID!, $data: StoreCategoryUpdateInput!) {
    updateStoreCategory(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export type AdminStoreBrandRow = {
  id: string;
  name: string;
  slug: string | null;
  isActive: boolean | null;
  logo: { url: string } | null;
};

export const ADMIN_STORE_BRANDS_QUERY = gql`
  query AdminStoreBrands($take: Int!) {
    storeBrands(orderBy: [{ name: asc }], take: $take) {
      id
      name
      slug
      isActive
      logo {
        url
      }
    }
  }
`;

export const CREATE_ADMIN_STORE_BRAND_MUTATION = gql`
  mutation CreateAdminStoreBrand($data: StoreBrandCreateInput!) {
    createStoreBrand(data: $data) {
      id
    }
  }
`;

export const UPDATE_ADMIN_STORE_BRAND_MUTATION = gql`
  mutation UpdateAdminStoreBrand($id: ID!, $data: StoreBrandUpdateInput!) {
    updateStoreBrand(where: { id: $id }, data: $data) {
      id
    }
  }
`;

// ─── Reviews ────────────────────────────────────────────────────────────────────────────────

export type AdminStoreReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  verifiedPurchase: boolean | null;
  adminReply: string | null;
  createdAt: string | null;
  user: { id: string; name: string | null; lastName: string | null; email: string | null } | null;
  product: { id: string; name: string; slug: string | null } | null;
};

export type AdminStoreReviewsResponse = {
  storeProductReviews: AdminStoreReviewRow[];
  storeProductReviewsCount: number;
};

export const ADMIN_STORE_REVIEWS_QUERY = gql`
  query AdminStoreReviews($where: StoreProductReviewWhereInput!, $take: Int!, $skip: Int!) {
    storeProductReviews(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      rating
      title
      body
      status
      verifiedPurchase
      adminReply
      createdAt
      user {
        id
        name
        lastName
        email
      }
      product {
        id
        name
        slug
      }
    }
    storeProductReviewsCount(where: $where)
  }
`;

export const UPDATE_ADMIN_STORE_REVIEW_MUTATION = gql`
  mutation UpdateAdminStoreReview($id: ID!, $data: StoreProductReviewUpdateInput!) {
    updateStoreProductReview(where: { id: $id }, data: $data) {
      id
      status
      adminReply
    }
  }
`;

export const DELETE_ADMIN_STORE_REVIEW_MUTATION = gql`
  mutation DeleteAdminStoreReview($id: ID!) {
    deleteStoreProductReview(where: { id: $id }) {
      id
    }
  }
`;
