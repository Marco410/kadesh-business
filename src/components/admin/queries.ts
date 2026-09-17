import { gql } from "@apollo/client";
import type {
  AdminOverviewData,
  AdminPetPlaceRow,
  AdminSubscriptionRow,
  AdminUserRow,
} from "./types";

const PET_PLACE_FIELDS = gql`
  fragment AdminPetPlaceFields on PetPlace {
    id
    name
    slug
    municipality
    state
    phone
    email
    verified
    verifiedAt
    claimStatus
    claimRole
    claimPhone
    claimNotes
    claimedAt
    createdAt
    user {
      id
      name
      lastName
      email
      phone
    }
  }
`;

export const ADMIN_OVERVIEW_QUERY = gql`
  ${PET_PLACE_FIELDS}
  query AdminOverview(
    $activeWhere: SaasCompanySubscriptionWhereInput!
    $pendingWhere: PetPlaceWhereInput!
    $verifiedWhere: PetPlaceWhereInput!
  ) {
    usersCount
    activeSubscriptions: saasCompanySubscriptionsCount(where: $activeWhere)
    pendingPlaces: petPlacesCount(where: $pendingWhere)
    verifiedPlaces: petPlacesCount(where: $verifiedWhere)
    pendingPetPlaces: petPlaces(
      where: $pendingWhere
      orderBy: [{ claimedAt: desc }]
      take: 6
    ) {
      ...AdminPetPlaceFields
    }
  }
`;

export type AdminOverviewResponse = AdminOverviewData;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers(
    $where: UserWhereInput!
    $take: Int
    $skip: Int!
  ) {
    users(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      name
      lastName
      secondLastName
      email
      phone
      createdAt
      lastLoginAt
      verified
      roles {
        name
      }
      company {
        id
        name
      }
    }
    usersCount(where: $where)
  }
`;

export type AdminUsersResponse = {
  users: AdminUserRow[];
  usersCount: number;
};

export const ADMIN_SUBSCRIPTIONS_QUERY = gql`
  query AdminSubscriptions(
    $where: SaasCompanySubscriptionWhereInput!
    $take: Int
    $skip: Int!
  ) {
    saasCompanySubscriptions(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      planName
      planCost
      planCurrency
      planFrequency
      planLeadLimit
      planFeatures
      status
      activatedAt
      currentPeriodEnd
      stripeCustomerId
      stripeSubscriptionId
      createdAt
      company {
        id
        name
        users(take: 4, orderBy: [{ createdAt: asc }]) {
          id
          name
          lastName
          email
        }
      }
    }
    saasCompanySubscriptionsCount(where: $where)
  }
`;

export type AdminSubscriptionsResponse = {
  saasCompanySubscriptions: AdminSubscriptionRow[];
  saasCompanySubscriptionsCount: number;
};

export const ADMIN_PET_PLACES_QUERY = gql`
  ${PET_PLACE_FIELDS}
  query AdminPetPlaces(
    $where: PetPlaceWhereInput!
    $take: Int
    $skip: Int!
  ) {
    petPlaces(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      ...AdminPetPlaceFields
    }
    petPlacesCount(where: $where)
  }
`;

export const ADMIN_PET_PLACE_QUERY = gql`
  ${PET_PLACE_FIELDS}
  query AdminPetPlace($id: ID!) {
    petPlace(where: { id: $id }) {
      ...AdminPetPlaceFields
    }
  }
`;

export type AdminPetPlacesResponse = {
  petPlaces: AdminPetPlaceRow[];
  petPlacesCount: number;
};

export const UPDATE_ADMIN_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateAdminSubscription(
    $where: SaasCompanySubscriptionWhereUniqueInput!
    $data: SaasCompanySubscriptionUpdateInput!
  ) {
    updateSaasCompanySubscription(where: $where, data: $data) {
      id
    }
  }
`;

export const VERIFY_PET_PLACE_MUTATION = gql`
  mutation VerifyPetPlace($input: VerifyPetPlaceInput!) {
    verifyPetPlace(input: $input) {
      success
      message
      claimStatus
      verified
    }
  }
`;

export const UPDATE_PET_PLACE_MUTATION = gql`
  mutation UpdateAdminPetPlace(
    $where: PetPlaceWhereUniqueInput!
    $data: PetPlaceUpdateInput!
  ) {
    updatePetPlace(where: $where, data: $data) {
      id
      verified
      claimStatus
      verifiedAt
    }
  }
`;
