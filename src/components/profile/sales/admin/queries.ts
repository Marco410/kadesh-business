import { gql } from "@apollo/client";

export const ADMIN_COMPANY_USERS_QUERY = gql`
  query AdminCompanyUsers($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      lastName
      secondLastName
      email
      roles {
        name
      }
      company {
        id
        name
        subscriptions {
          id
          activatedAt
          planCost
          planCurrency
          planFrequency
          planLeadLimit
          planName
          planFeatures
          status
          stripeCustomerId
          stripeSubscriptionId
          currentPeriodEnd
        }
      }
    }
  }
`;

export const REFRESH_SUBSCRIPTION_STATUS_QUERY = gql`
  query RefreshSubscriptionStatus($companyId: ID) {
    subscriptionStatus(companyId: $companyId) {
      success
      message
      daysUntilNextBilling
      subscriptionActive
      subscription {
        id
        activatedAt
        planCost
        planCurrency
        planFrequency
        planLeadLimit
        planName
        planFeatures
        status
        stripeCustomerId
        stripeSubscriptionId
        currentPeriodEnd
      }
    }
  }
`;

export const UPDATE_COMPANY_SUBSCRIPTION_PLAN_FEATURES_MUTATION = gql`
  mutation UpdateCompanySubscriptionPlanFeatures(
    $where: SaasCompanySubscriptionWhereUniqueInput!
    $data: SaasCompanySubscriptionUpdateInput!
  ) {
    updateSaasCompanySubscription(where: $where, data: $data) {
      id
    }
  }
`;

