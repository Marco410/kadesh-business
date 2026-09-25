import { gql } from "@apollo/client";
import type {
  AdminBlogSubscriptionRow,
  AdminOverviewData,
  AdminPetPlaceRow,
  AdminPetPlaceServiceRow,
  AdminPlanRow,
  AdminRoleOption,
  AdminSubscriptionRow,
  AdminUserDetail,
  AdminUserRow,
  StripePlanCheckResult,
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
    pipelineStatus
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

const PET_PLACE_SERVICE_FIELDS = gql`
  fragment AdminPetPlaceServiceFields on PetPlaceService {
    id
    name
    description
    status
    active
    createdAt
    requestedBy {
      id
      name
      lastName
      email
    }
    requestedFor {
      id
      name
      municipality
      state
    }
  }
`;

export const ADMIN_OVERVIEW_QUERY = gql`
  ${PET_PLACE_FIELDS}
  ${PET_PLACE_SERVICE_FIELDS}
  query AdminOverview(
    $activeWhere: SaasCompanySubscriptionWhereInput!
    $pendingWhere: PetPlaceWhereInput!
    $verifiedWhere: PetPlaceWhereInput!
    $pendingServiceWhere: PetPlaceServiceWhereInput!
  ) {
    usersCount
    activeSubscriptions: saasCompanySubscriptionsCount(where: $activeWhere)
    pendingPlaces: petPlacesCount(where: $pendingWhere)
    verifiedPlaces: petPlacesCount(where: $verifiedWhere)
    pendingServices: petPlaceServicesCount(where: $pendingServiceWhere)
    pendingPetPlaces: petPlaces(
      where: $pendingWhere
      orderBy: [{ claimedAt: desc }]
      take: 6
    ) {
      ...AdminPetPlaceFields
    }
    pendingPetPlaceServices: petPlaceServices(
      where: $pendingServiceWhere
      orderBy: [{ createdAt: desc }]
      take: 6
    ) {
      ...AdminPetPlaceServiceFields
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

export const ADMIN_USER_DETAIL_QUERY = gql`
  query AdminUserDetail($id: ID!) {
    user(where: { id: $id }) {
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
        id
        name
      }
      company {
        id
        name
      }
    }
    roles {
      id
      name
    }
  }
`;

export type AdminUserDetailResponse = {
  user: AdminUserDetail | null;
  roles: AdminRoleOption[];
};

export const ADMIN_USER_BLOG_SUBSCRIPTIONS_QUERY = gql`
  query AdminUserBlogSubscriptions($where: BlogSubscriptionWhereInput!) {
    blogSubscriptions(where: $where, orderBy: [{ createdAt: desc }]) {
      id
      email
      product
      active
      createdAt
      user {
        id
      }
    }
  }
`;

export type AdminUserBlogSubscriptionsResponse = {
  blogSubscriptions: AdminBlogSubscriptionRow[];
};

export const UPDATE_ADMIN_USER_MUTATION = gql`
  mutation UpdateAdminUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
    }
  }
`;

export const CREATE_BLOG_SUBSCRIPTION_MUTATION = gql`
  mutation CreateAdminBlogSubscription($data: BlogSubscriptionCreateInput!) {
    createBlogSubscription(data: $data) {
      id
    }
  }
`;

export const UPDATE_BLOG_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateAdminBlogSubscription(
    $where: BlogSubscriptionWhereUniqueInput!
    $data: BlogSubscriptionUpdateInput!
  ) {
    updateBlogSubscription(where: $where, data: $data) {
      id
    }
  }
`;

export const ADMIN_SUBSCRIPTIONS_QUERY = gql`
  query AdminSubscriptions(
    $where: SaasCompanySubscriptionWhereInput!
    $take: Int
    $skip: Int!
    $year: Int!
    $month: Int!
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
        purchasedBonusCredits
        creditPeriods(
          where: { year: { equals: $year }, month: { equals: $month } }
          take: 1
        ) {
          id
          planAllowance
          bonusAllowance
          used
        }
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

export const ADMIN_PLANS_QUERY = gql`
  query AdminPlans($where: SaasPlanWhereInput!) {
    saasPlans(where: $where, orderBy: [{ cost: asc }]) {
      id
      name
      cost
      costOld
      currency
      frequency
      leadLimit
      planFeatures
      active
      bestSeller
      referralUpfrontCommissionPct
      referralRecurringCommissionPct
      stripePriceId
      stripeProductId
      updatedAt
      subscriptionsCount
    }
  }
`;

export type AdminPlansResponse = {
  saasPlans: AdminPlanRow[];
};

export const UPDATE_ADMIN_PLAN_MUTATION = gql`
  mutation UpdateAdminPlan(
    $where: SaasPlanWhereUniqueInput!
    $data: SaasPlanUpdateInput!
  ) {
    updateSaasPlan(where: $where, data: $data) {
      id
    }
  }
`;

export const UPDATE_PLAN_FEATURE_CATALOG_MUTATION = gql`
  mutation UpdatePlanFeatureCatalog($input: UpdatePlanFeatureCatalogInput!) {
    updatePlanFeatureCatalog(input: $input) {
      success
      message
      plansUpdated
      subscriptionsUpdated
    }
  }
`;

export type UpdatePlanFeatureCatalogResponse = {
  updatePlanFeatureCatalog: {
    success: boolean;
    message: string;
    plansUpdated: number | null;
    subscriptionsUpdated: number | null;
  };
};

export const STRIPE_PLAN_CHECK_QUERY = gql`
  query StripePlanCheck($input: StripePlanCheckInput!) {
    stripePlanCheck(input: $input) {
      success
      message
      allMatch
      checkedAt
      priceId
      priceActive
      productId
      productName
      productActive
      livemode
      subscriptionsCount
      fields {
        field
        label
        local
        stripe
        match
      }
    }
  }
`;

export type StripePlanCheckResponse = {
  stripePlanCheck: StripePlanCheckResult;
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

export const GRANT_ADMIN_CREDITS_MUTATION = gql`
  mutation GrantAdminCredits($input: GrantAdminCreditsInput!) {
    grantAdminCredits(input: $input) {
      success
      message
      creditsAdded
      remainingQuota
      extraCredits
    }
  }
`;

export type GrantAdminCreditsResponse = {
  grantAdminCredits: {
    success: boolean;
    message: string;
    creditsAdded: number | null;
    remainingQuota: number | null;
    extraCredits: number | null;
  };
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
      pipelineStatus
      verifiedAt
    }
  }
`;

export const ADMIN_PET_PLACE_SERVICES_QUERY = gql`
  ${PET_PLACE_SERVICE_FIELDS}
  query AdminPetPlaceServices(
    $where: PetPlaceServiceWhereInput!
    $take: Int
    $skip: Int!
  ) {
    petPlaceServices(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      ...AdminPetPlaceServiceFields
    }
    petPlaceServicesCount(where: $where)
  }
`;

export const ADMIN_PET_PLACE_SERVICE_QUERY = gql`
  ${PET_PLACE_SERVICE_FIELDS}
  query AdminPetPlaceService($id: ID!) {
    petPlaceService(where: { id: $id }) {
      ...AdminPetPlaceServiceFields
    }
  }
`;

export type AdminPetPlaceServicesResponse = {
  petPlaceServices: AdminPetPlaceServiceRow[];
  petPlaceServicesCount: number;
};

export const UPDATE_PET_PLACE_SERVICE_MUTATION = gql`
  mutation UpdateAdminPetPlaceService(
    $where: PetPlaceServiceWhereUniqueInput!
    $data: PetPlaceServiceUpdateInput!
  ) {
    updatePetPlaceService(where: $where, data: $data) {
      id
      status
      active
      requestedFor {
        id
        name
      }
    }
  }
`;

export const ADMIN_PET_PLACE_SEARCH_QUERY = gql`
  query AdminPetPlaceSearch($where: PetPlaceWhereInput!, $take: Int) {
    petPlaces(where: $where, orderBy: [{ name: asc }], take: $take) {
      id
      name
      municipality
      state
    }
  }
`;

export type AdminPetPlaceSearchRow = {
  id: string;
  name: string | null;
  municipality: string | null;
  state: string | null;
};
