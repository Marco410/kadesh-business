import { gql } from "@apollo/client";

export const COMPANY_USERS_MANAGE_QUERY = gql`
  query CompanyUsersManage($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }], take: 300) {
      id
      name
      lastName
      email
      phone
      birthday
      permissions
      roles {
        id
        name
      }
    }
  }
`;

export interface CompanyUserManageRow {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  permissions: unknown;
  roles: Array<{ id: string; name: string }>;
}

export interface CompanyUsersManageVariables {
  where: {
    company?: { id?: { equals: string } };
  };
}

export interface CompanyUsersManageResponse {
  users: CompanyUserManageRow[];
}

export const CREATE_COMPANY_MANAGED_USER_MUTATION = gql`
  mutation CreateCompanyManagedUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      lastName
      email
      phone
      birthday
      permissions
      roles {
        id
        name
      }
    }
  }
`;

export interface CreateCompanyManagedUserVariables {
  data: {
    name: string;
    lastName?: string | null;
    email: string;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    product?: "pet" | "saas";
    permissions?: string[] | null;
    roles?: { connect: Array<{ id: string }> };
    company?: { connect: { id: string } };
  };
}

export interface CreateCompanyManagedUserResponse {
  createUser: CompanyUserManageRow;
}

export const UPDATE_COMPANY_MANAGED_USER_MUTATION = gql`
  mutation UpdateCompanyManagedUser(
    $where: UserWhereUniqueInput!
    $data: UserUpdateInput!
  ) {
    updateUser(where: $where, data: $data) {
      id
      name
      lastName
      email
      phone
      birthday
      permissions
      roles {
        id
        name
      }
    }
  }
`;

export interface UpdateCompanyManagedUserVariables {
  where: { id: string };
  data: {
    name?: string;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    phone?: string | null;
    birthday?: string | null;
    permissions?: string[] | null;
    roles?: { set: Array<{ id: string }> };
  };
}

export interface UpdateCompanyManagedUserResponse {
  updateUser: CompanyUserManageRow;
}
