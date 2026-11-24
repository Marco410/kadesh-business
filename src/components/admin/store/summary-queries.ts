import { gql } from "@apollo/client";

/** Sales report of the store (`adminStoreSummary` in kadesh-back): one request, cached 5 min there. */

export type AdminStoreSummary = {
  days: number;
  from: string;
  to: string;
  generatedAt: string;
  orders: number;
  previousOrders: number;
  revenueCents: number;
  previousRevenueCents: number;
  units: number;
  buyers: number;
  averageOrderCents: number;
  discountCents: number;
  shippingChargedCents: number;
  productCostCents: number;
  shippingCostCents: number;
  marginCents: number;
  refundedOrders: number;
  refundedCents: number;
  seriesUnit: "day" | "month";
  series: Array<{ key: string; revenueCents: number; orders: number }>;
  byPaymentMethod: Array<{ key: string; count: number; amount: number }>;
  bySource: Array<{ key: string; units: number; revenueCents: number; costCents: number }>;
  topProducts: Array<{ productId: string | null; name: string; units: number; revenueCents: number }>;
  topCoupons: Array<{ code: string; uses: number; discountCents: number }>;
  outOfStock: number;
  lowStock: Array<{ productId: string; name: string; stockTotal: number }>;
  /** Active products with the most page views, all time (not limited to the period). */
  topViewed: Array<{
    productId: string;
    name: string;
    slug: string | null;
    coverUrl: string | null;
    views: number;
    salesCount: number;
  }>;
};

export type AdminStoreSummaryResponse = { adminStoreSummary: AdminStoreSummary };

export const ADMIN_STORE_SUMMARY_QUERY = gql`
  query AdminStoreSummary($days: Int) {
    adminStoreSummary(days: $days) {
      days
      from
      to
      generatedAt
      orders
      previousOrders
      revenueCents
      previousRevenueCents
      units
      buyers
      averageOrderCents
      discountCents
      shippingChargedCents
      productCostCents
      shippingCostCents
      marginCents
      refundedOrders
      refundedCents
      seriesUnit
      series {
        key
        revenueCents
        orders
      }
      byPaymentMethod {
        key
        count
        amount
      }
      bySource {
        key
        units
        revenueCents
        costCents
      }
      topProducts {
        productId
        name
        units
        revenueCents
      }
      topCoupons {
        code
        uses
        discountCents
      }
      outOfStock
      lowStock {
        productId
        name
        stockTotal
      }
      topViewed {
        productId
        name
        slug
        coverUrl
        views
        salesCount
      }
    }
  }
`;
