import { gql } from "@apollo/client";

/**
 * Espacios de rescate (`RescueOrganization` de kadesh-back). Un admin de plataforma lee todos y
 * escribe los campos de verificación y aliado con el `updateRescueOrganization` de Keystone; los
 * hooks del backend llenan `verifiedAt`/`allySince`, quitan `isAlly` si deja de estar verificado,
 * avisan a sus admins (`rescue.verified` / `rescue.rejected`) y registran la actividad.
 */

export const ADMIN_RESCUE_ORGS_QUERY = gql`
  query AdminRescueOrgs(
    $where: RescueOrganizationWhereInput!
    $take: Int!
    $skip: Int!
    $pendingWhere: RescueOrganizationWhereInput!
    $verifiedWhere: RescueOrganizationWhereInput!
    $alliesWhere: RescueOrganizationWhereInput!
    $rejectedWhere: RescueOrganizationWhereInput!
    $suspendedWhere: RescueOrganizationWhereInput!
  ) {
    rescueOrganizations(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      name
      slug
      type
      city
      state
      status
      isAlly
      whatsapp
      createdAt
      logo {
        url
      }
      membersCount
      publishedCount
      adoptedCount
    }
    total: rescueOrganizationsCount(where: $where)
    pending: rescueOrganizationsCount(where: $pendingWhere)
    verified: rescueOrganizationsCount(where: $verifiedWhere)
    allies: rescueOrganizationsCount(where: $alliesWhere)
    rejected: rescueOrganizationsCount(where: $rejectedWhere)
    suspended: rescueOrganizationsCount(where: $suspendedWhere)
  }
`;

export type AdminRescueOrgRow = {
  id: string;
  name: string;
  slug?: string | null;
  type?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  isAlly?: boolean | null;
  whatsapp?: string | null;
  createdAt?: string | null;
  logo?: { url?: string | null } | null;
  membersCount?: number | null;
  publishedCount?: number | null;
  adoptedCount?: number | null;
};

export type AdminRescueOrgsResponse = {
  rescueOrganizations: AdminRescueOrgRow[];
  total: number;
  pending: number;
  verified: number;
  allies: number;
  rejected: number;
  suspended: number;
};

export const ADMIN_RESCUE_ORG_QUERY = gql`
  query AdminRescueOrg($id: ID!) {
    rescueOrganization(where: { id: $id }) {
      id
      name
      slug
      type
      description
      city
      state
      species
      capacity
      whatsapp
      email
      websiteUrl
      facebookUrl
      instagramUrl
      tiktokUrl
      donationUrl
      donationInfo
      needs
      status
      statusNote
      verifiedAt
      isAlly
      allySince
      allyOrder
      adminNotes
      createdAt
      logo {
        url
      }
      cover {
        url
      }
      createdBy {
        id
        name
        lastName
        email
        phone
      }
      members(orderBy: [{ createdAt: asc }]) {
        id
        role
        userName
        userEmail
      }
      membersCount
      publishedCount
      adoptedCount
      inAdoptionCount
      petsCount
    }
  }
`;

export type AdminRescueOrgDetail = AdminRescueOrgRow & {
  description?: string | null;
  species?: string[] | null;
  capacity?: number | null;
  email?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  donationUrl?: string | null;
  donationInfo?: string | null;
  needs?: string | null;
  statusNote?: string | null;
  verifiedAt?: string | null;
  allySince?: string | null;
  allyOrder?: number | null;
  adminNotes?: string | null;
  cover?: { url?: string | null } | null;
  createdBy?: {
    id: string;
    name?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  members: Array<{ id: string; role: string; userName?: string | null; userEmail?: string | null }>;
  inAdoptionCount?: number | null;
  petsCount?: number | null;
};

export type AdminRescueOrgResponse = { rescueOrganization: AdminRescueOrgDetail | null };

/** Verificar, rechazar, suspender, marcar aliado y notas internas (campos solo de admin). */
export const ADMIN_UPDATE_RESCUE_ORG_MUTATION = gql`
  mutation AdminUpdateRescueOrg($id: ID!, $data: RescueOrganizationUpdateInput!) {
    updateRescueOrganization(where: { id: $id }, data: $data) {
      id
      status
      statusNote
      verifiedAt
      isAlly
      allySince
      allyOrder
      adminNotes
    }
  }
`;

/**
 * Globo del menú: espacios esperando verificación. Va en su propia query (no en
 * `AdminNavCounts`) para que, si el API todavía no tiene `RescueOrganization`, no se caigan los
 * demás globos.
 */
export const ADMIN_RESCUE_NAV_COUNT_QUERY = gql`
  query AdminRescueNavCount {
    pendingRescues: rescueOrganizationsCount(where: { status: { equals: "pending" } })
  }
`;

export type AdminRescueNavCountResponse = { pendingRescues: number | null };
