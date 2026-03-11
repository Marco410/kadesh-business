import { gql } from "@apollo/client";

/** Vendedores de la empresa con conteos (para sección solo ADMIN_COMPANY). */
export const COMPANY_VENDEDORES_WITH_STATS_QUERY = gql`
  query CompanyVendedoresWithStats($where: UserWhereInput!) {
    users(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      lastName
      secondLastName
      email
      phone
      businessLeadsAssignedCount
      followUpTasksCount
      proposalsCount
      salesActivitiesCount
      salesComission
      salesPersonVerified
    }
  }
`;

export interface CompanyVendedoresWithStatsVariables {
  where: {
    company?: { id?: { equals: string } };
    roles?: { some?: { name?: { equals: string } } };
  };
}

export interface CompanyVendedoresWithStatsResponse {
  users: Array<{
    id: string;
    name: string;
    lastName: string | null;
    secondLastName: string | null;
    email: string | null;
    phone: string | null;
    businessLeadsAssignedCount: number | null;
    followUpTasksCount: number | null;
    proposalsCount: number | null;
    salesActivitiesCount: number | null;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
  }>;
}

/** Detalle completo de un vendedor (para modal de detalles). */
export const USER_VENDEDOR_DETAIL_QUERY = gql`
  query UserVendedorDetail($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      name
      lastName
      secondLastName
      username
      email
      phone
      age
      birthday
      createdAt
      salesComission
      salesPersonVerified
      company {
        id
        name
      }
      followUpTasks {
        id
        notes
        priority
        scheduledDate
        status
        updatedAt
        createdAt
        businessLead {
          id
          businessName
        }
      }
      proposals {
        id
        amount
        sentDate
        status
        fileOrUrl
        createdAt
        updatedAt
        approved
        paid
        businessLead {
          id
          businessName
        }
      }
      salesActivities {
        id
        type
        result
        activityDate
        comments
        createdAt
        businessLead {
          id
          businessName
        }
      }
      techStatusBusinessLeads {
        id
        pipelineStatus
        opportunityLevel
        estimatedValue
        firstContactDate
        nextFollowUpDate
        notes
        productOffered
        businessLead {
          id
          businessName
        }
      }
    }
  }
`;

export interface UserVendedorDetailVariables {
  where: { id: string };
}

export interface UserVendedorDetailResponse {
  user: {
    id: string;
    name: string;
    lastName: string | null;
    secondLastName: string | null;
    username: string | null;
    email: string | null;
    phone: string | null;
    age: string | null;
    birthday: string | null;
    createdAt: string;
    salesComission: number | null;
    salesPersonVerified: boolean | null;
    company: { id: string; name: string } | null;
    followUpTasks: Array<{
      id: string;
      notes: string | null;
      priority: string | null;
      scheduledDate: string;
      status: string;
      updatedAt: string | null;
      createdAt: string;
      businessLead: { id: string; businessName: string } | null;
    }>;
    proposals: Array<{
      id: string;
      amount: number | null;
      sentDate: string;
      status: string;
      fileOrUrl: string | null;
      createdAt: string;
      updatedAt: string | null;
      approved: boolean | null;
      paid: boolean | null;
      businessLead: { id: string; businessName: string } | null;
    }>;
    salesActivities: Array<{
      id: string;
      type: string;
      result: string | null;
      activityDate: string;
      comments: string | null;
      createdAt: string;
      businessLead: { id: string; businessName: string } | null;
    }>;
    techStatusBusinessLeads: Array<{
      id: string;
      pipelineStatus: string | null;
      opportunityLevel: string | null;
      estimatedValue: number | null;
      firstContactDate: string | null;
      nextFollowUpDate: string | null;
      notes: string | null;
      productOffered: string | null;
      businessLead: { id: string; businessName: string } | null;
    }>;
  } | null;
}
