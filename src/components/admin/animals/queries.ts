import { gql } from "@apollo/client";

const ROW_FIELDS = `
  id
  name
  slug
  createdAt
  reportedBy
  sex
  animalType
  breed
  coverUrl
  status
  city
  state
  creator { id name lastName email }
  creatorIsAdmin
  views
  views7d
  favorites
  comments
  facebookPostId
  facebookPublishedAt
`;

export const ADMIN_ANIMALS_QUERY = gql`
  query AdminAnimals(
    $search: String
    $animalTypeId: ID
    $reportedBy: String
    $creator: String
    $facebook: String
    $take: Int
    $skip: Int
  ) {
    adminAnimals(
      search: $search
      animalTypeId: $animalTypeId
      reportedBy: $reportedBy
      creator: $creator
      facebook: $facebook
      take: $take
      skip: $skip
    ) {
      total
      items { ${ROW_FIELDS} }
    }
  }
`;

export const ADMIN_ANIMAL_DETAIL_QUERY = gql`
  query AdminAnimalDetail($id: ID!) {
    adminAnimalDetail(id: $id) {
      animal { ${ROW_FIELDS} }
      physicalDescription
      age
      color
      size
      contactNumber
      contactNumber2
      sourceUrl
      photos
      logs { id status notes city state address createdAt }
      comments { id comment createdAt user { id name lastName email } }
      favoritesList { id createdAt user { id name lastName email } }
      viewStats {
        total
        anonymous
        signedIn
        last7d
        daily { day count }
        recentViewers { id name lastName email }
      }
      facebookPublishedBy { id name lastName email }
    }
  }
`;

export const ANIMAL_TYPES_QUERY = gql`
  query AdminAnimalTypes {
    animalTypes(orderBy: [{ name: asc }]) {
      id
      name
    }
  }
`;

export const ADMIN_PUBLISH_ANIMAL_TO_FACEBOOK_MUTATION = gql`
  mutation AdminPublishAnimalToFacebook($animalId: ID!, $force: Boolean) {
    adminPublishAnimalToFacebook(animalId: $animalId, force: $force) {
      success
      message
    }
  }
`;

export const ADMIN_PURGE_ANIMAL_VIEWS_MUTATION = gql`
  mutation AdminPurgeAnimalViews($animalId: ID!, $onlyAnonymous: Boolean) {
    adminPurgeAnimalViews(animalId: $animalId, onlyAnonymous: $onlyAnonymous) {
      success
      message
    }
  }
`;

/** Borrar un comentario o favorito usa la API generada (el admin tiene permiso). */
export const DELETE_ANIMAL_COMMENT_MUTATION = gql`
  mutation AdminDeleteAnimalComment($id: ID!) {
    deleteAnimalComment(where: { id: $id }) {
      id
    }
  }
`;

export const DELETE_ANIMAL_FAVORITE_MUTATION = gql`
  mutation AdminDeleteAnimalFavorite($id: ID!) {
    deleteAnimalFavorite(where: { id: $id }) {
      id
    }
  }
`;

export type AdminPersonRef = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
};

export type AdminAnimalRow = {
  id: string;
  name: string;
  slug: string | null;
  createdAt: string | null;
  reportedBy: string | null;
  sex: string | null;
  animalType: string | null;
  breed: string | null;
  coverUrl: string | null;
  status: string | null;
  city: string | null;
  state: string | null;
  creator: AdminPersonRef | null;
  creatorIsAdmin: boolean;
  views: number;
  views7d: number;
  favorites: number;
  comments: number;
  facebookPostId: string | null;
  facebookPublishedAt: string | null;
};

export type AdminAnimalsResponse = {
  adminAnimals: { total: number; items: AdminAnimalRow[] };
};

export type AdminAnimalDetail = {
  animal: AdminAnimalRow;
  physicalDescription: string | null;
  age: string | null;
  color: string | null;
  size: string | null;
  contactNumber: string | null;
  contactNumber2: string | null;
  sourceUrl: string | null;
  photos: string[];
  logs: Array<{
    id: string;
    status: string | null;
    notes: string | null;
    city: string | null;
    state: string | null;
    address: string | null;
    createdAt: string | null;
  }>;
  comments: Array<{ id: string; comment: string; createdAt: string | null; user: AdminPersonRef | null }>;
  favoritesList: Array<{ id: string; createdAt: string | null; user: AdminPersonRef | null }>;
  viewStats: {
    total: number;
    anonymous: number;
    signedIn: number;
    last7d: number;
    daily: Array<{ day: string; count: number }>;
    recentViewers: AdminPersonRef[];
  };
  facebookPublishedBy: AdminPersonRef | null;
};

export type AdminAnimalDetailResponse = { adminAnimalDetail: AdminAnimalDetail | null };

export type AdminActionResult = { success: boolean; message: string };
