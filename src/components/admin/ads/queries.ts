import { gql } from "@apollo/client";

/**
 * Anuncios de Kadesh Pet. The list and the report come from kadesh-back's `adminAds` and
 * `adminAdStats` (aggregates in one query); the editor reads and writes one ad through the API
 * Keystone generates for `Ad` (admin only).
 */

export type AdminAdRow = {
  id: string;
  kind: string;
  status: string;
  title: string;
  brandLabel: string;
  tone: string;
  imageUrl: string | null;
  placements: string[];
  startDate: string | null;
  endDate: string | null;
  weight: number;
  geoScope: string;
  zoneLabel: string;
  advertiserName: string;
  priceCents: number;
  paymentStatus: string;
  targetLabel: string | null;
  createdAt: string | null;
  impressions: number;
  clicks: number;
};

export type AdminAdsResponse = { adminAds: { total: number; items: AdminAdRow[] } };

export const ADMIN_ADS_QUERY = gql`
  query AdminAds($take: Int, $skip: Int, $status: String, $kind: String, $search: String, $days: Int) {
    adminAds(take: $take, skip: $skip, status: $status, kind: $kind, search: $search, days: $days) {
      total
      items {
        id
        kind
        status
        title
        brandLabel
        tone
        imageUrl
        placements
        startDate
        endDate
        weight
        geoScope
        zoneLabel
        advertiserName
        priceCents
        paymentStatus
        targetLabel
        createdAt
        impressions
        clicks
      }
    }
  }
`;

export type AdminAdStatPoint = { key: string; impressions: number; clicks: number };

export type AdminAdStats = {
  days: number;
  impressions: number;
  clicks: number;
  previousImpressions: number;
  previousClicks: number;
  series: AdminAdStatPoint[];
  byPlacement: AdminAdStatPoint[];
  topAds: Array<{ adId: string; title: string; impressions: number; clicks: number }>;
  activeAds: number;
};

export const ADMIN_AD_STATS_QUERY = gql`
  query AdminAdStats($days: Int, $adId: ID) {
    adminAdStats(days: $days, adId: $adId) {
      days
      impressions
      clicks
      previousImpressions
      previousClicks
      series {
        key
        impressions
        clicks
      }
      byPlacement {
        key
        impressions
        clicks
      }
      topAds {
        adId
        title
        impressions
        clicks
      }
      activeAds
    }
  }
`;

export type AdminAdTarget = { id: string; label: string; slug: string | null; lat: number | null; lng: number | null };

export const ADMIN_AD_TARGETS_QUERY = gql`
  query AdminAdTargets($kind: String!, $search: String) {
    adminAdTargets(kind: $kind, search: $search) {
      id
      label
      slug
      lat
      lng
    }
  }
`;

type TargetRef = { id: string; name: string | null; slug: string | null } | null;

export type AdminAdDetail = {
  id: string;
  kind: string;
  status: string;
  title: string;
  body: string;
  brandLabel: string;
  ctaLabel: string;
  tone: string;
  image: { url: string } | null;
  url: string;
  storeProduct: TargetRef;
  petPlace: TargetRef;
  animal: TargetRef;
  placements: string[] | null;
  startDate: string | null;
  endDate: string | null;
  weight: number;
  geoScope: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  zoneLabel: string;
  advertiserName: string;
  advertiserContact: string;
  priceCents: number | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentNote: string;
};

export const ADMIN_AD_QUERY = gql`
  query AdminAd($id: ID!) {
    ad(where: { id: $id }) {
      id
      kind
      status
      title
      body
      brandLabel
      ctaLabel
      tone
      image {
        url
      }
      url
      storeProduct {
        id
        name
        slug
      }
      petPlace {
        id
        name
        slug
      }
      animal {
        id
        name
        slug
      }
      placements
      startDate
      endDate
      weight
      geoScope
      lat
      lng
      radiusKm
      zoneLabel
      advertiserName
      advertiserContact
      priceCents
      paymentStatus
      paymentMethod
      paymentNote
    }
  }
`;

export const CREATE_AD_MUTATION = gql`
  mutation CreateAdminAd($data: AdCreateInput!) {
    createAd(data: $data) {
      id
    }
  }
`;

export const UPDATE_AD_MUTATION = gql`
  mutation UpdateAdminAd($id: ID!, $data: AdUpdateInput!) {
    updateAd(where: { id: $id }, data: $data) {
      id
    }
  }
`;
