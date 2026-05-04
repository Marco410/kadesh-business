import { gql } from "@apollo/client";

const STORAGE_KEY = "kadesh-crm-workspace-id";

export const SAAS_WORKSPACES_QUERY = gql`
  query SaasWorkspaces {
    saasWorkspaces {
      id
      name
    }
  }
`;

export interface SaasWorkspacesResponse {
  saasWorkspaces: Array<{ id: string; name: string }>;
}

export const SAAS_WORKSPACE_DETAIL_QUERY = gql`
  query SaasWorkspaceDetail($where: SaasWorkspaceWhereUniqueInput!) {
    saasWorkspace(where: $where) {
      id
      name
      showActivities
      showProposals
      showFollowUpTasks
      showTasks
      crmStatuses {
        id
        name
        color
        key
        order
        isDefault
        isArchived
      }
      members {
        id
        name
        lastName
        email
        profileImage {
          url
        }
      }
    }
  }
`;

export interface SaasWorkspaceDetailVariables {
  where: { id: string };
}

/** Estado CRM compartido (actividades, seguimientos, propuestas) por workspace. */
export interface SaasWorkspaceCrmStatus {
  id: string;
  name: string;
  color: string;
  key: string;
  order: number;
  isDefault: boolean | null;
  isArchived: boolean | null;
}

export interface SaasWorkspaceDetailResponse {
  saasWorkspace: {
    id: string;
    name: string;
    showActivities: boolean | null;
    showProposals: boolean | null;
    showFollowUpTasks: boolean | null;
    showTasks: boolean | null;
    crmStatuses: SaasWorkspaceCrmStatus[] | null;
    members: Array<{
      id: string;
      name: string;
      lastName: string | null;
      email: string | null;
      profileImage: {
        url: string | null;
      } | null;
    }>;
  } | null;
}

export const CREATE_SAAS_WORKSPACE_MUTATION = gql`
  mutation CreateSaasWorkspace($data: SaasWorkspaceCreateInput!) {
    createSaasWorkspace(data: $data) {
      id
      name
      showActivities
      showProposals
      showFollowUpTasks
      showTasks
    }
  }
`;

export interface CreateSaasWorkspaceVariables {
  data: {
    name: string;
    members?: { connect: Array<{ id: string }> };
    company?: { connect: { id: string } };
    showActivities?: boolean;
    showProposals?: boolean;
    showFollowUpTasks?: boolean;
    showTasks?: boolean;
  };
}

export interface CreateSaasWorkspaceMutation {
  createSaasWorkspace: {
    id: string;
    name: string;
    showActivities: boolean | null;
    showProposals: boolean | null;
    showFollowUpTasks: boolean | null;
    showTasks: boolean | null;
  };
}

export const UPDATE_SAAS_WORKSPACE_MUTATION = gql`
  mutation UpdateSaasWorkspace(
    $where: SaasWorkspaceWhereUniqueInput!
    $data: SaasWorkspaceUpdateInput!
  ) {
    updateSaasWorkspace(where: $where, data: $data) {
      id
      name
      showActivities
      showProposals
      showFollowUpTasks
      showTasks
      members {
        id
      }
      crmStatuses {
        id
        name
        color
      }
    }
  }
`;

export interface UpdateSaasWorkspaceVariables {
  where: { id: string };
  data: {
    members?: { set: Array<{ id: string }> };
    name?: string | null;
    showActivities?: boolean | null;
    showProposals?: boolean | null;
    showFollowUpTasks?: boolean | null;
    showTasks?: boolean | null;
  };
}

export const UPDATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION = gql`
  mutation UpdateSaasWorkspaceCrmStatus(
    $where: SaasWorkspaceCrmStatusWhereUniqueInput!
    $data: SaasWorkspaceCrmStatusUpdateInput!
  ) {
    updateSaasWorkspaceCrmStatus(where: $where, data: $data) {
      id
      name
      color
      order
    }
  }
`;

export interface UpdateSaasWorkspaceCrmStatusVariables {
  where: { id: string };
  data: {
    name?: string | null;
    color?: string | null;
    order?: number | null;
  };
}

export interface UpdateSaasWorkspaceCrmStatusMutation {
  updateSaasWorkspaceCrmStatus: {
    id: string;
    name: string;
    color: string;
    order: number | null;
  };
}

export const CREATE_SAAS_WORKSPACE_CRM_STATUS_MUTATION = gql`
  mutation CreateSaasWorkspaceCrmStatus($data: SaasWorkspaceCrmStatusCreateInput!) {
    createSaasWorkspaceCrmStatus(data: $data) {
      id
      name
      color
      key
      order
      isDefault
      isArchived
    }
  }
`;

export interface CreateSaasWorkspaceCrmStatusVariables {
  data: {
    name: string;
    color: string;
    key: string;
    order: number;
    isDefault?: boolean;
    isArchived?: boolean;
    workspace: { connect: { id: string } };
  };
}

export interface CreateSaasWorkspaceCrmStatusMutation {
  createSaasWorkspaceCrmStatus: {
    id: string;
    name: string;
    color: string;
    key: string;
    order: number;
    isDefault: boolean | null;
    isArchived: boolean | null;
  };
}

export const DELETE_SAAS_WORKSPACE_CRM_STATUS_MUTATION = gql`
  mutation DeleteSaasWorkspaceCrmStatus($where: SaasWorkspaceCrmStatusWhereUniqueInput!) {
    deleteSaasWorkspaceCrmStatus(where: $where) {
      id
    }
  }
`;

export interface DeleteSaasWorkspaceCrmStatusVariables {
  where: { id: string };
}

export interface DeleteSaasWorkspaceCrmStatusMutation {
  deleteSaasWorkspaceCrmStatus: { id: string } | null;
}

export interface UpdateSaasWorkspaceMutation {
  updateSaasWorkspace: {
    id: string;
    name: string;
    showActivities: boolean | null;
    showProposals: boolean | null;
    showFollowUpTasks: boolean | null;
    showTasks: boolean | null;
    members: Array<{ id: string }>;
    crmStatuses: Array<{ id: string; name: string; color: string }> | null;
  };
}

/** Sincronización / edición por lotes del API (un elemento = un espacio). */
export const CREATE_SAAS_WORKSPACES_MUTATION = gql`
  mutation CreateSaasWorkspaces($data: [SaasWorkspaceCreateInput!]!) {
    createSaasWorkspaces(data: $data) {
      id
      membersCount
      name
      showActivities
      showFollowUpTasks
      showProposals
      showTasks
      crmStatuses {
        id
      }
    }
  }
`;

/** Un ítem de `createSaasWorkspaces` (`SaasWorkspaceCreateInput`): sin `crmStatuses.update` (solo relate/create). */
export type SaasWorkspaceBulkCreateInputItem = {
  name: string;
  showActivities?: boolean;
  showProposals?: boolean;
  showFollowUpTasks?: boolean;
  showTasks?: boolean;
  members?: { connect: Array<{ id: string }> };
};

export interface CreateSaasWorkspacesVariables {
  data: SaasWorkspaceBulkCreateInputItem[];
}

export interface CreateSaasWorkspacesMutation {
  createSaasWorkspaces: Array<{
    id: string;
    membersCount: number | null;
    name: string;
    showActivities: boolean | null;
    showFollowUpTasks: boolean | null;
    showProposals: boolean | null;
    showTasks: boolean | null;
    crmStatuses: Array<{ id: string }> | null;
  }>;
}

/** Usuarios de la empresa para asignar miembros al workspace (admins). */
export const COMPANY_USERS_FOR_WORKSPACE_QUERY = gql`
  query CompanyUsersForWorkspace($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }], take: 300) {
      id
      name
      lastName
      email
      phone
      birthday
    }
  }
`;

export interface CompanyUsersForWorkspaceVariables {
  where: { company: { id: { equals: string } } };
}

export interface CompanyUsersForWorkspaceResponse {
  users: Array<{
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
  }>;
}

export const USER_BASIC_PROFILE_QUERY = gql`
  query UserBasicProfile($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      name
      lastName
      email
      phone
      birthday
    }
  }
`;

export interface UserBasicProfileVariables {
  where: { id: string };
}

export interface UserBasicProfileResponse {
  user: {
    id: string;
    name: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    birthday: string | null;
  } | null;
}

export function readStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(STORAGE_KEY);
  return v && v.length > 0 ? v : null;
}

export function persistWorkspaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id == null) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, id);
}
