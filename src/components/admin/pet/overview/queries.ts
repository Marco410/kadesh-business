import { gql } from "@apollo/client";

/** Cifras de Kadesh Pet → Resumen (`adminPetSummary` en kadesh-back, solo admin de plataforma). */
export const ADMIN_PET_SUMMARY_QUERY = gql`
  query AdminPetSummary($input: AdminPetSummaryInput) {
    adminPetSummary(input: $input) {
      days
      generatedAt
      animals {
        total
        newInPeriod
        newPrevPeriod
        facebookPublished
        facebookPending
        duplicatesMerged
        byStatus { key count }
        byType { key count }
        byOrigin { key count }
        byReportedBy { key count }
        topStates { key count }
        topCities { key count }
      }
      places {
        total
        veterinaries
        verified
        fromGoogle
        reviews
        likes
        newInPeriod
        newPrevPeriod
        byClaimStatus { key count }
        byType { key count }
        topStates { key count }
      }
      users {
        total
        newInPeriod
        newPrevPeriod
      }
      engagement {
        views
        viewsSignedIn
        favorites
        comments
        topViewed { id name slug status coverUrl views }
      }
      pending {
        animalClaims
        placeClaims
        services
        facebookPending
      }
    }
  }
`;

/** Serie por día, semana o mes para las gráficas del Resumen (`adminPetSeries`). */
export const ADMIN_PET_SERIES_QUERY = gql`
  query AdminPetSeries($input: AdminPetSeriesInput!) {
    adminPetSeries(input: $input) {
      metric
      granularity
      breakdown
      from
      to
      total
      points {
        bucket
        total
        segments { key count }
      }
    }
  }
`;

export type PetCount = { key: string; count: number };

export type AdminPetTopAnimal = {
  id: string;
  name: string;
  slug: string | null;
  status: string | null;
  coverUrl: string | null;
  views: number;
};

export type AdminPetSummary = {
  days: number | null;
  generatedAt: string;
  animals: {
    total: number;
    newInPeriod: number;
    newPrevPeriod: number;
    facebookPublished: number;
    facebookPending: number;
    duplicatesMerged: number;
    byStatus: PetCount[];
    byType: PetCount[];
    byOrigin: PetCount[];
    byReportedBy: PetCount[];
    topStates: PetCount[];
    topCities: PetCount[];
  };
  places: {
    total: number;
    veterinaries: number;
    verified: number;
    fromGoogle: number;
    reviews: number;
    likes: number;
    newInPeriod: number;
    newPrevPeriod: number;
    byClaimStatus: PetCount[];
    byType: PetCount[];
    topStates: PetCount[];
  };
  users: { total: number; newInPeriod: number; newPrevPeriod: number };
  engagement: {
    views: number;
    viewsSignedIn: number;
    favorites: number;
    comments: number;
    topViewed: AdminPetTopAnimal[];
  };
  pending: {
    animalClaims: number;
    placeClaims: number;
    services: number;
    facebookPending: number;
  };
};

export type AdminPetSummaryResponse = { adminPetSummary: AdminPetSummary };

export type AdminPetSeriesPoint = { bucket: string; total: number; segments: PetCount[] };

export type AdminPetSeries = {
  metric: string;
  granularity: "day" | "week" | "month";
  breakdown: string;
  from: string;
  to: string;
  total: number;
  points: AdminPetSeriesPoint[];
};

export type AdminPetSeriesResponse = { adminPetSeries: AdminPetSeries };
