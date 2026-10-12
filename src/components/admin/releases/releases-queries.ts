import { gql } from "@apollo/client";

/** Novedades de la plataforma (`SystemRelease` de kadesh-back). El admin ve también los borradores. */

const RELEASE_FIELDS = `
  id
  version
  product
  title
  body
  releasedAt
  isPublished
  notifyByEmail
  emailedAt
  createdAt
`;

export const ADMIN_RELEASES_QUERY = gql`
  query AdminReleases($where: SystemReleaseWhereInput!) {
    systemReleases(where: $where, orderBy: [{ releasedAt: desc }], take: 200) {
      ${RELEASE_FIELDS}
    }
  }
`;

export const CREATE_RELEASE_MUTATION = gql`
  mutation CreateRelease($data: SystemReleaseCreateInput!) {
    createSystemRelease(data: $data) {
      ${RELEASE_FIELDS}
    }
  }
`;

export const UPDATE_RELEASE_MUTATION = gql`
  mutation UpdateRelease($id: ID!, $data: SystemReleaseUpdateInput!) {
    updateSystemRelease(where: { id: $id }, data: $data) {
      ${RELEASE_FIELDS}
    }
  }
`;

export const DELETE_RELEASE_MUTATION = gql`
  mutation DeleteRelease($id: ID!) {
    deleteSystemRelease(where: { id: $id }) {
      id
    }
  }
`;

export type AdminRelease = {
  id: string;
  version: string;
  product: "saas" | "pet" | "all";
  title: string | null;
  body: string | null;
  releasedAt: string;
  isPublished: boolean;
  notifyByEmail: boolean;
  emailedAt: string | null;
  createdAt: string | null;
};

export type AdminReleasesResponse = { systemReleases: AdminRelease[] };
