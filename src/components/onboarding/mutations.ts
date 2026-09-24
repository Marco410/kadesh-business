import { gql } from "@apollo/client";

export const UPDATE_ONBOARDING_STATE_MUTATION = gql`
  mutation UpdateOnboardingState(
    $where: UserWhereUniqueInput!
    $data: UserUpdateInput!
  ) {
    updateUser(where: $where, data: $data) {
      id
      onboardingState
    }
  }
`;
