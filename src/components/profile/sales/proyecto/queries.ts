// ─── Proyecto (SaasProject) ─────────────────────────────────────────────────

import { gql } from "@apollo/client";

export const CREATE_SAAS_PROJECT_MUTATION = gql`
  mutation CreateSaasProject($data: SaasProjectCreateInput!) {
    createSaasProject(data: $data) {
      id
      name
      serviceType
      status
      startDate
      estimatedEndDate
      description
      company {
        id
      }
      businessLead {
        id
      }
      proposal {
        id
      }
      responsible {
        id
      }
      createdAt
      updatedAt
    }
  }
`;

export interface CreateSaasProjectVariables {
  data: {
    name: string;
    serviceType?: string | null;
    description?: string | null;
    status?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    company?: { connect?: { id: string } } | null;
    businessLead?: { connect?: { id: string } } | null;
    proposal?: { connect?: { id: string } } | null;
    responsible?: { connect?: { id: string } } | null;
  };
}

export interface CreateSaasProjectMutation {
  createSaasProject: {
    id: string;
    name: string;
    serviceType: string | null;
    status: string | null;
    startDate: string | null;
    estimatedEndDate: string | null;
    description: string | null;
    company: { id: string } | null;
    businessLead: { id: string } | null;
    proposal: { id: string } | null;
    responsible: { id: string } | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export const SAAS_PROJECT_QUERY = gql`
  query SaasProject($where: SaasProjectWhereUniqueInput!) {
    saasProject(where: $where) {
      id
      name
      serviceType
      status
      startDate
      estimatedEndDate
      description
      createdAt
      updatedAt
      company {
        id
        name
      }
      businessLead {
        id
        businessName
        city
        country
        category
      }
      proposal {
        id
        amount
        sentDate
        status
        product
        notes
        fileOrUrl
        createdAt
        updatedAt
        assignedSeller {
          id
          name
        }
      }
      responsible {
        id
        name
      }
    }
  }
`;

export interface SaasProjectQueryVariables {
  where: { id: string };
}

export const SAAS_PROJECTS_LIST_QUERY = gql`
  query SaasProjectsList($where: SaasProjectWhereInput!) {
    saasProjects(where: $where, orderBy: [{ updatedAt: desc }]) {
      id
      name
      serviceType
      status
      startDate
      updatedAt
      businessLead {
        id
        businessName
      }
      responsible {
        id
        name
      }
    }
  }
`;

export interface SaasProjectsListVariables {
  where: {
    company?: { id: { equals: string } };
    responsible?: { id: { equals: string } };
  };
}

export interface SaasProjectsListResponse {
  saasProjects: Array<{
    id: string;
    name: string;
    serviceType: string | null;
    status: string | null;
    startDate: string | null;
    updatedAt: string | null;
    businessLead: { id: string; businessName: string | null } | null;
    responsible: { id: string; name: string | null } | null;
  }>;
}

export interface SaasProjectQueryResponse {
  saasProject: {
    id: string;
    name: string;
    serviceType: string | null;
    status: string | null;
    startDate: string | null;
    estimatedEndDate: string | null;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    company: { id: string; name: string } | null;
    businessLead: {
      id: string;
      businessName: string | null;
      city: string | null;
      country: string | null;
      category: string | null;
    } | null;
    proposal: {
      id: string;
      amount: number | null;
      sentDate: string | null;
      status: string | null;
      product: string | null;
      notes: string | null;
      fileOrUrl: string | null;
      createdAt: string | null;
      updatedAt: string | null;
      assignedSeller: { id: string; name: string | null } | null;
    } | null;
    responsible: { id: string; name: string | null } | null;
  } | null;
}

export const UPDATE_SAAS_PROJECT_MUTATION = gql`
  mutation UpdateSaasProject($where: SaasProjectWhereUniqueInput!, $data: SaasProjectUpdateInput!) {
    updateSaasProject(where: $where, data: $data) {
      id
      name
      serviceType
      status
      startDate
      estimatedEndDate
      description
      updatedAt
    }
  }
`;

export interface UpdateSaasProjectVariables {
  where: { id: string };
  data: {
    name?: string | null;
    serviceType?: string | null;
    status?: string | null;
    description?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
  };
}

export interface UpdateSaasProjectMutation {
  updateSaasProject: {
    id: string;
    name: string;
    serviceType: string | null;
    status: string | null;
    startDate: string | null;
    estimatedEndDate: string | null;
    description: string | null;
    updatedAt: string | null;
  };
}