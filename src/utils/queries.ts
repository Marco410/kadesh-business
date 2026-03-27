import { gql } from "@apollo/client";

export const AUTHENTICATED_ITEM_QUERY = gql(`
  query AuthenticatedItem {
    authenticatedItem {
      ... on User {
        id
        name
        lastName
        secondLastName
        username
        email
        verified
        phone
        profileImage {
          url
        }
        roles {
          name
        }
        birthday
        age
        createdAt
      }
    }
  }
`);

export const USER_QUERY = gql`
  query User($where: UserWhereUniqueInput!) {
    user(where: $where) {
      age
      birthday
      createdAt
      email
      id
      lastName
      name
      phone
      profileImage {
        url
      }
      roles {
        name
      }
      secondLastName
      username
      verified
    }
  }
`;

/** Empresa del usuario (perfil admin empresa). Separado para no pedir company a vendedores. */
export const PROFILE_USER_COMPANY_QUERY = gql`
  query ProfileUserCompany($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      company {
        id
        name
        logo {
          url
        }
        onboardingMainOffer
        onboardingIdealCustomer
        onboardingAvgTicketValue
        onboardingSalesPain
      }
    }
  }
`;

export interface UserQueryVariables {
  where: { id: string };
}

export interface UserCompanyProfile {
  id: string;
  name: string;
  logo: { url: string } | null;
  onboardingMainOffer: string | null;
  onboardingIdealCustomer: string | null;
  onboardingAvgTicketValue: string | null;
  onboardingSalesPain: string | null;
}

export interface UserQueryResponse {
  user: {
    id: string;
    name: string;
    lastName: string;
    secondLastName: string | null;
    username: string;
    email: string;
    verified: boolean;
    phone: string | null;
    profileImage: { url: string } | null;
    birthday: string | null;
    age: number | null;
    createdAt: string;
    roles?: { name: string }[] | null;
  } | null;
}

export interface ProfileUserCompanyVariables {
  where: { id: string };
}

export interface ProfileUserCompanyResponse {
  user: {
    id: string;
    company: UserCompanyProfile | null;
  } | null;
}

export const UPDATE_SAAS_COMPANY_MUTATION = gql`
  mutation UpdateSaasCompany(
    $where: SaasCompanyWhereUniqueInput!
    $data: SaasCompanyUpdateInput!
  ) {
    updateSaasCompany(where: $where, data: $data) {
      id
      name
      logo {
        url
      }
      onboardingMainOffer
      onboardingIdealCustomer
      onboardingAvgTicketValue
      onboardingSalesPain
    }
  }
`;

export interface UpdateSaasCompanyVariables {
  where: { id: string };
  data: {
    name?: string;
    onboardingMainOffer?: string | null;
    onboardingIdealCustomer?: string | null;
    onboardingAvgTicketValue?: string | null;
    onboardingSalesPain?: string | null;
    logo?: { upload: File };
  };
}

export interface UpdateSaasCompanyResponse {
  updateSaasCompany: UserCompanyProfile | null;
}

export const AUTHENTICATE_USER_MUTATION = gql`
  mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          lastName
          name
          phone
          email
          profileImage {
            url
          }
          roles {
            name
          }
          secondLastName
          username
          verified
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

/** Backend must implement this mutation (e.g. custom resolver or Keystone auth plugin). */
export const AUTHENTICATE_USER_WITH_GOOGLE_MUTATION = gql`
  mutation AuthenticateUserWithGoogle($idToken: String!, $referrerCode: String) {
    authenticateUserWithGoogle(idToken: $idToken, referrerCode: $referrerCode) {
      ... on UserAuthenticationWithGoogleSuccess {
        sessionToken
        item {
          id
          lastName
          name
          phone
          email
          profileImage {
            url
          }
          roles {
            name
          }
          secondLastName
          username
          verified
        }
      }
      ... on UserAuthenticationWithGoogleFailure {
        message
      }
    }
  }
`;

export const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser($data: UserCreateInput!, $referrerCode: String) {
    registerUser(data: $data, referrerCode: $referrerCode) {
      name
      lastName
      email
      phone
      referralCode
    }
  }
`;

export const CREATE_SAAS_COMPANY_MUTATION = gql`
  mutation CreateSaasCompany($data: SaasCompanyCreateInput!) {
    createSaasCompany(data: $data) {
      id
      name
    }
  }
`;

export interface CreateSaasCompanyVariables {
  data: { name: string };
}

export interface CreateSaasCompanyResponse {
  createSaasCompany: { id: string; name: string } | null;
}

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      name
      lastName
      secondLastName
      phone
      birthday
      lastLoginAt
      bank
      clabe
      cardNumber
      profileImage {
        url
      }
    }
  }
`;

export interface UpdateUserVariables {
  where: { id: string };
  data: {
    name?: string;
    lastName?: string;
    secondLastName?: string | null;
    phone?: string | null;
    birthday?: string | null;
    lastLoginAt?: string | null;
    bank?: string | null;
    clabe?: string | null;
    cardNumber?: string | null;
    profileImage?: { upload: File } | { disconnect?: boolean };
    company?: { connect: { id: string } };
    roles?: { connect: Array<{ id: string }> };
  };
}

export interface UpdateUserResponse {
  updateUser: {
    id: string;
    name: string;
    lastName: string;
    secondLastName: string | null;
    phone: string | null;
    birthday: string | null;
    lastLoginAt: string | null;
    bank: string | null;
    clabe: string | null;
    cardNumber: string | null;
    profileImage: { url: string } | null;
  } | null;
}

export interface AuthenticateUserVariables {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  authenticateUserWithPassword:
    | {
        __typename: "UserAuthenticationWithPasswordSuccess";
        sessionToken: string;
        item: {
          id: string;
          lastName: string;
          name: string;
          phone: string | null;
          email: string;
          profileImage: {
            url: string;
          } | null;
          roles: {
            name: string;
          }[];
          secondLastName: string | null;
          username: string;
          verified: boolean;
        };
      }
    | {
        __typename: "UserAuthenticationWithPasswordFailure";
        message: string;
      }
    | null;
}

export interface AuthenticateUserWithGoogleVariables {
  idToken: string;
  referrerCode?: string | null;
}

export interface AuthenticateUserWithGoogleResponse {
  authenticateUserWithGoogle:
    | {
        __typename: "UserAuthenticationWithGoogleSuccess";
        sessionToken: string;
        item: {
          id: string;
          lastName: string;
          name: string;
          phone: string | null;
          email: string;
          profileImage: {
            url: string;
          } | null;
          roles: {
            name: string;
          }[];
          secondLastName: string | null;
          username: string;
          verified: boolean;
        };
      }
    | {
        __typename: "UserAuthenticationWithGoogleFailure";
        message: string;
      }
    | null;
}

export interface RegisterUserVariables {
  data: {
    name: string;
    lastName: string;
    secondLastName?: string;
    email: string;
    password: string;
    phone?: string;
    company?: { connect: { id: string } };
    roles?: { connect: Array<{ id: string }> };
  };
  referrerCode?: string | null;
}

export interface RegisterUserResponse {
  registerUser: {
    name: string;
    lastName: string;
    email: string;
    phone: string | null;
    referralCode: string | null;
  };
}

export const CREATE_CONTACT_FORM_MUTATION = gql`
  mutation CreateContactForms($data: [ContactFormCreateInput!]!) {
    createContactForms(data: $data) {
      id
      message
      email
      name
      phone
      subject
    }
  }
`;

export interface CreateContactFormVariables {
  data: Array<{
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status?: string;
  }>;
}

export interface CreateContactFormResponse {
  createContactForms: Array<{
    id: string;
    message: string;
    email: string;
    name: string;
    phone: string | null;
    subject: string;
  }>;
}

export const CREATE_BLOG_SUBSCRIPTION_MUTATION = gql`
  mutation CreateBlogSubscription($data: BlogSubscriptionCreateInput!) {
    createBlogSubscription(data: $data) {
      active
      email
      user {
        name
      }
    }
  }
`;

export interface CreateBlogSubscriptionVariables {
  data: {
    email: string;
    active?: boolean;
    user?: {
      connect?: {
        id: string;
      };
    };
  };
}

export interface CreateBlogSubscriptionResponse {
  createBlogSubscription: {
    active: boolean;
    email: string;
    user: {
      name: string;
    } | null;
  };
}
