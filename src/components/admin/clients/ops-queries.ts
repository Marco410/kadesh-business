import { gql } from "@apollo/client";

/* Acciones de Operaciones sobre una empresa: notas internas, dueño de cuenta, extender prueba
 * y tendencia semanal contra su plan. Todo es solo para admin de plataforma. */

/* ───────────────────────── Dueño de cuenta ───────────────────────── */

/** Equipo de Kadesh (rol admin): candidatos a dueño de cuenta. */
export const ADMIN_PLATFORM_USERS_QUERY = gql`
  query AdminPlatformUsers {
    users(
      where: { roles: { some: { name: { equals: "admin" } } } }
      orderBy: [{ name: asc }]
      take: 100
    ) {
      id
      name
      lastName
      email
    }
  }
`;

export type AdminPlatformUser = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
};

export type AdminPlatformUsersResponse = { users: AdminPlatformUser[] };

export const ADMIN_SET_ACCOUNT_MANAGER_MUTATION = gql`
  mutation AdminSetCompanyAccountManager($companyId: ID!, $userId: ID) {
    adminSetCompanyAccountManager(companyId: $companyId, userId: $userId) {
      success
      message
    }
  }
`;

export type AdminOpsActionResult = { success: boolean; message: string };

/* ───────────────────────── Prueba gratuita ───────────────────────── */

export const ADMIN_EXTEND_TRIAL_MUTATION = gql`
  mutation AdminExtendTrial($companyId: ID!, $days: Int, $until: String) {
    adminExtendTrial(companyId: $companyId, days: $days, until: $until) {
      success
      message
    }
  }
`;

/* ───────────────────────── Notas internas ───────────────────────── */

export const ADMIN_COMPANY_NOTES_QUERY = gql`
  query AdminCompanyNotes($companyId: ID!) {
    saasCompanyNotes(
      where: { company: { id: { equals: $companyId } } }
      orderBy: [{ createdAt: desc }]
      take: 200
    ) {
      id
      body
      pinned
      createdAt
      updatedAt
      author {
        id
        name
        lastName
      }
    }
  }
`;

export type AdminCompanyNote = {
  id: string;
  body: string;
  pinned: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  author: { id: string; name: string; lastName: string | null } | null;
};

export type AdminCompanyNotesResponse = { saasCompanyNotes: AdminCompanyNote[] };

export const CREATE_COMPANY_NOTE_MUTATION = gql`
  mutation CreateCompanyNote($data: SaasCompanyNoteCreateInput!) {
    createSaasCompanyNote(data: $data) {
      id
    }
  }
`;

export const UPDATE_COMPANY_NOTE_MUTATION = gql`
  mutation UpdateCompanyNote($id: ID!, $data: SaasCompanyNoteUpdateInput!) {
    updateSaasCompanyNote(where: { id: $id }, data: $data) {
      id
      pinned
    }
  }
`;

export const DELETE_COMPANY_NOTE_MUTATION = gql`
  mutation DeleteCompanyNote($id: ID!) {
    deleteSaasCompanyNote(where: { id: $id }) {
      id
    }
  }
`;

/* ───────────────────────── Tendencia y comparación ───────────────────────── */

export const ADMIN_COMPANY_TRENDS_QUERY = gql`
  query AdminCompanyTrends($companyId: ID!, $weeks: Int) {
    adminCompanyTrends(companyId: $companyId, weeks: $weeks) {
      ready
      planName
      peers
      weeks {
        weekStart
        activeDays
        activeMinutes
        extractions
        leadsCreated
        crmChanges
        activitiesLogged
        quotationsCreated
        quotationsAccepted
        whatsappSent
      }
      benchmark {
        key
        company
        median
      }
    }
  }
`;

export type AdminUsageWeek = {
  weekStart: string;
  activeDays: number;
  activeMinutes: number;
  extractions: number;
  leadsCreated: number;
  crmChanges: number;
  activitiesLogged: number;
  quotationsCreated: number;
  quotationsAccepted: number;
  whatsappSent: number;
};

export type AdminBenchmarkMetric = { key: string; company: number; median: number | null };

export type AdminCompanyTrends = {
  ready: boolean;
  planName: string | null;
  peers: number;
  weeks: AdminUsageWeek[];
  benchmark: AdminBenchmarkMetric[];
};

export type AdminCompanyTrendsResponse = { adminCompanyTrends: AdminCompanyTrends };

/* ───────────────────────── Control de cuentas ───────────────────────── */

export const ADMIN_SET_COMPANY_SUSPENSION_MUTATION = gql`
  mutation AdminSetCompanySuspension($companyId: ID!, $suspended: Boolean!, $reason: String) {
    adminSetCompanySuspension(companyId: $companyId, suspended: $suspended, reason: $reason) {
      success
      message
    }
  }
`;

export const ADMIN_SET_USER_SUSPENSION_MUTATION = gql`
  mutation AdminSetUserSuspension($userId: ID!, $suspended: Boolean!, $reason: String) {
    adminSetUserSuspension(userId: $userId, suspended: $suspended, reason: $reason) {
      success
      message
    }
  }
`;

export const ADMIN_REVOKE_SESSIONS_MUTATION = gql`
  mutation AdminRevokeSessions($userId: ID, $companyId: ID) {
    adminRevokeSessions(userId: $userId, companyId: $companyId) {
      success
      message
    }
  }
`;

export const ADMIN_TRANSFER_OWNERSHIP_MUTATION = gql`
  mutation AdminTransferCompanyOwnership(
    $companyId: ID!
    $newOwnerId: ID!
    $removeOtherAdmins: Boolean
  ) {
    adminTransferCompanyOwnership(
      companyId: $companyId
      newOwnerId: $newOwnerId
      removeOtherAdmins: $removeOtherAdmins
    ) {
      success
      message
    }
  }
`;

export const ADMIN_START_IMPERSONATION_MUTATION = gql`
  mutation AdminStartImpersonation($userId: ID!, $reason: String!) {
    adminStartImpersonation(userId: $userId, reason: $reason) {
      success
      message
      token
      expiresAt
      companyName
      user {
        id
        name
        lastName
        email
      }
    }
  }
`;

export type AdminImpersonationResult = AdminOpsActionResult & {
  token: string | null;
  expiresAt: string | null;
  companyName: string | null;
  user: { id: string; name: string; lastName: string | null; email: string | null } | null;
};

export const ADMIN_EXPORT_PERSON_DATA_MUTATION = gql`
  mutation AdminExportPersonData($userId: ID!) {
    adminExportPersonData(userId: $userId)
  }
`;

export const ADMIN_ANONYMIZE_USER_MUTATION = gql`
  mutation AdminAnonymizeUser($userId: ID!, $confirmEmail: String!, $reason: String!) {
    adminAnonymizeUser(userId: $userId, confirmEmail: $confirmEmail, reason: $reason) {
      success
      message
    }
  }
`;

/** Estado de acceso de una persona (para la pestaña Control). */
export const ADMIN_PERSON_CONTROL_QUERY = gql`
  query AdminPersonControl($id: ID!) {
    user(where: { id: $id }) {
      id
      name
      lastName
      email
      suspendedAt
      suspendedReason
      anonymizedAt
      roles {
        name
      }
      company {
        id
        name
        suspendedAt
      }
    }
  }
`;

export type AdminPersonControl = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  anonymizedAt: string | null;
  roles: Array<{ name: string }>;
  company: { id: string; name: string; suspendedAt: string | null } | null;
};

export type AdminPersonControlResponse = { user: AdminPersonControl | null };
