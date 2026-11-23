import { gql } from "@apollo/client";

/**
 * Coupons of the Kadesh Pet store, through the API Keystone generates for `StoreCoupon` (admin
 * only). The list asks for plain fields only: categories and products of a coupon are to-many
 * relations (one query per row in Keystone), so they are read for the one coupon being edited.
 */

export type AdminStoreCouponRow = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minSubtotalCents: number | null;
  maxDiscountCents: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  firstOrderOnly: boolean | null;
  isActive: boolean | null;
};

export type AdminStoreCouponsResponse = {
  storeCoupons: AdminStoreCouponRow[];
  storeCouponsCount: number;
};

const COUPON_FIELDS = `
  id
  code
  description
  type
  value
  minSubtotalCents
  maxDiscountCents
  startsAt
  endsAt
  usageLimit
  usageLimitPerUser
  usedCount
  firstOrderOnly
  isActive
`;

export const ADMIN_STORE_COUPONS_QUERY = gql`
  query AdminStoreCoupons($take: Int!) {
    storeCoupons(orderBy: [{ createdAt: desc }], take: $take) {
      ${COUPON_FIELDS}
    }
    storeCouponsCount
  }
`;

export type AdminStoreCouponScope = {
  storeCoupon: {
    id: string;
    categories: Array<{ id: string; name: string }>;
    products: Array<{ id: string; name: string }>;
  } | null;
};

/** What one coupon is limited to. Asked only when its form opens. */
export const ADMIN_STORE_COUPON_SCOPE_QUERY = gql`
  query AdminStoreCouponScope($id: ID!, $take: Int!) {
    storeCoupon(where: { id: $id }) {
      id
      categories(take: $take) {
        id
        name
      }
      products(take: $take) {
        id
        name
      }
    }
  }
`;

export type AdminStoreCouponProductOption = { id: string; name: string };

/** Product picker of the coupon form: server search on the normalized name, 20 rows. */
export const ADMIN_STORE_COUPON_PRODUCT_SEARCH_QUERY = gql`
  query AdminStoreCouponProductSearch($search: String!, $take: Int!) {
    storeProducts(
      where: { nameSearch: { contains: $search }, source: { in: ["own", "dropi"] }, status: { notIn: ["archived"] } }
      orderBy: [{ name: asc }]
      take: $take
    ) {
      id
      name
    }
  }
`;

export const CREATE_ADMIN_STORE_COUPON_MUTATION = gql`
  mutation CreateAdminStoreCoupon($data: StoreCouponCreateInput!) {
    createStoreCoupon(data: $data) {
      ${COUPON_FIELDS}
    }
  }
`;

export const UPDATE_ADMIN_STORE_COUPON_MUTATION = gql`
  mutation UpdateAdminStoreCoupon($id: ID!, $data: StoreCouponUpdateInput!) {
    updateStoreCoupon(where: { id: $id }, data: $data) {
      ${COUPON_FIELDS}
    }
  }
`;
