import { gql } from "@apollo/client";

/*
 * Eventos de Kadesh Pet en Operaciones. Lista y detalle salen de las queries de Keystone
 * (`petEvents`, `petEvent`: el admin ve todos los estados); revisar y cancelar, de las
 * mutaciones de kadesh-back (`graphql/customs/mutations/pet/events/`).
 */

/** Campos de la fila y del detalle (sin `user` ni `multimedia`, que cambian entre los dos). */
const BASE_FIELDS = `
  id
  title
  slug
  category
  city
  state
  timeZone
  organizerName
  status
  createdAt
  firstStartsAt
  lastEndsAt
  nextStartsAt
  approvedAt
  pendingChangeNotice
  zoneAlertsSentAt
  zoneAlertsCount
  interestedCount
  goingCount
`;

const ROW_FIELDS = `
  ${BASE_FIELDS}
  user { id name lastName email }
  multimedia(orderBy: { order: asc }, take: 1) { id image { url } }
`;

export const ADMIN_PET_EVENTS_QUERY = gql`
  query AdminPetEvents(
    $where: PetEventWhereInput!
    $orderBy: [PetEventOrderByInput!]!
    $take: Int
    $skip: Int!
    $pendingWhere: PetEventWhereInput!
    $approvedWhere: PetEventWhereInput!
    $rejectedWhere: PetEventWhereInput!
    $cancelledWhere: PetEventWhereInput!
  ) {
    petEvents(where: $where, orderBy: $orderBy, take: $take, skip: $skip) { ${ROW_FIELDS} }
    total: petEventsCount(where: $where)
    pending: petEventsCount(where: $pendingWhere)
    approved: petEventsCount(where: $approvedWhere)
    rejected: petEventsCount(where: $rejectedWhere)
    cancelled: petEventsCount(where: $cancelledWhere)
  }
`;

export const ADMIN_PET_EVENT_QUERY = gql`
  query AdminPetEvent($id: ID!) {
    petEvent(where: { id: $id }) {
      ${BASE_FIELDS}
      species
      description
      requirements
      contactPhone
      placeLabel
      address
      neighborhood
      stateCode
      lat
      lng
      scope
      reachKm
      isFree
      price
      priceNote
      capacity
      isFull
      registrationUrl
      registrationWhatsapp
      facebookUrl
      instagramUrl
      tiktokUrl
      xUrl
      websiteUrl
      reviewNote
      reviewedAt
      reviewedBy { id name lastName email }
      cancelledAt
      cancelReason
      updatedAt
      petPlace { id name slug }
      user { id name lastName email phone }
      sessions(orderBy: { startsAt: asc }) { id startsAt endsAt }
      multimedia(orderBy: { order: asc }) { id order image { url } }
    }
  }
`;

/** A cuántas personas de la zona avisaría y cuándo (solo admin). */
export const ADMIN_PET_EVENT_ALERT_PREVIEW_QUERY = gql`
  query AdminPetEventAlertPreview($id: ID!) {
    adminPetEventAlertPreview(id: $id) {
      recipients
      candidates
      alreadySent
      sendNow
      sendAt
    }
  }
`;

/** Contador de "Eventos por revisar" en el Resumen de Kadesh Pet. */
export const ADMIN_PET_EVENTS_PENDING_COUNT_QUERY = gql`
  query AdminPetEventsPendingCount {
    pendingEvents: petEventsCount(where: { status: { equals: "pending" } })
  }
`;

export const REVIEW_PET_EVENT_MUTATION = gql`
  mutation AdminReviewPetEvent($id: ID!, $approved: Boolean!, $note: String) {
    reviewPetEvent(id: $id, approved: $approved, note: $note) {
      success
      message
      event { id status }
    }
  }
`;

export const CANCEL_PET_EVENT_MUTATION = gql`
  mutation AdminCancelPetEvent($id: ID!, $reason: String) {
    cancelPetEvent(id: $id, reason: $reason) {
      success
      message
      event { id status }
    }
  }
`;

export type AdminPetEventPerson = {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
};

export type AdminPetEventRow = {
  id: string;
  title: string | null;
  slug: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  timeZone: string | null;
  organizerName: string | null;
  status: string | null;
  createdAt: string | null;
  firstStartsAt: string | null;
  lastEndsAt: string | null;
  /** Próxima fecha que no ha terminado; `null` si ya pasaron todas. */
  nextStartsAt: string | null;
  approvedAt: string | null;
  pendingChangeNotice: boolean | null;
  zoneAlertsSentAt: string | null;
  zoneAlertsCount: number | null;
  interestedCount: number | null;
  goingCount: number | null;
  user: AdminPetEventPerson | null;
  multimedia: Array<{ id: string; image: { url: string } | null }> | null;
};

export type AdminPetEventsResponse = {
  petEvents: AdminPetEventRow[] | null;
  total: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  cancelled: number | null;
};

export type AdminPetEventDetail = Omit<AdminPetEventRow, "user" | "multimedia"> & {
  species: string[] | null;
  description: string | null;
  requirements: string | null;
  contactPhone: string | null;
  placeLabel: string | null;
  address: string | null;
  neighborhood: string | null;
  stateCode: string | null;
  lat: number | null;
  lng: number | null;
  scope: string | null;
  reachKm: number | null;
  isFree: boolean | null;
  price: number | null;
  priceNote: string | null;
  capacity: number | null;
  isFull: boolean | null;
  registrationUrl: string | null;
  registrationWhatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  xUrl: string | null;
  websiteUrl: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: AdminPetEventPerson | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  updatedAt: string | null;
  petPlace: { id: string; name: string | null; slug: string | null } | null;
  user: (AdminPetEventPerson & { phone: string | null }) | null;
  sessions: Array<{ id: string; startsAt: string | null; endsAt: string | null }> | null;
  multimedia: Array<{ id: string; order: number | null; image: { url: string } | null }> | null;
};

export type AdminPetEventResponse = { petEvent: AdminPetEventDetail | null };

export type AdminPetEventAlertPreview = {
  recipients: number;
  candidates: number;
  alreadySent: boolean;
  sendNow: boolean;
  sendAt: string | null;
};

export type AdminPetEventsPendingCountResponse = { pendingEvents: number | null };

export type AdminPetEventAlertPreviewResponse = {
  adminPetEventAlertPreview: AdminPetEventAlertPreview | null;
};

export type PetEventMutationResult = {
  success: boolean;
  message: string;
  event: { id: string; status: string | null } | null;
};
