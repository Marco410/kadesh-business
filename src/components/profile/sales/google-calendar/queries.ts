import { gql } from "@apollo/client";

/** `personal` = cuenta de un usuario; `company` = compartida por toda la empresa. */
export type GoogleCalendarScopeType = "personal" | "company";

// ---------------------------------------------------------------------------
// Cuentas y calendarios conectados (lectura vía queries generadas por Keystone;
// los tokens nunca se piden ni viajan al front)
// ---------------------------------------------------------------------------

export const GOOGLE_CALENDAR_ACCOUNTS_QUERY = gql`
  query GoogleCalendarAccounts {
    googleCalendarAccounts(orderBy: [{ createdAt: asc }]) {
      id
      scopeType
      googleAccountEmail
      isActive
      lastSyncedAt
      lastSyncError
      user {
        id
      }
      company {
        id
      }
      calendars(orderBy: [{ isPrimary: desc }, { calendarName: asc }]) {
        id
        googleCalendarId
        calendarName
        isPrimary
        isSelected
        colorHex
        pushActivities
        pushProposals
        pushFollowUps
        pushTasks
      }
    }
  }
`;

/** Qué registros del CRM se envían a un calendario de Google. */
export type GooglePushFlag = "pushActivities" | "pushProposals" | "pushFollowUps" | "pushTasks";

export interface GoogleCalendarSelectionItem {
  id: string;
  googleCalendarId: string;
  calendarName: string;
  isPrimary: boolean;
  isSelected: boolean;
  colorHex: string | null;
  pushActivities: boolean;
  pushProposals: boolean;
  pushFollowUps: boolean;
  pushTasks: boolean;
}

export interface GoogleCalendarAccountItem {
  id: string;
  scopeType: GoogleCalendarScopeType;
  googleAccountEmail: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  user: { id: string } | null;
  company: { id: string } | null;
  calendars: GoogleCalendarSelectionItem[];
}

export interface GoogleCalendarAccountsResponse {
  googleCalendarAccounts: GoogleCalendarAccountItem[];
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export const GET_GOOGLE_CALENDAR_AUTH_URL_MUTATION = gql`
  mutation GetGoogleCalendarAuthUrl($scopeType: String!, $companyId: ID) {
    getGoogleCalendarAuthUrl(scopeType: $scopeType, companyId: $companyId) {
      success
      message
      url
    }
  }
`;

export interface GetGoogleCalendarAuthUrlResponse {
  getGoogleCalendarAuthUrl: {
    success: boolean;
    message: string | null;
    url: string | null;
  };
}

export interface GetGoogleCalendarAuthUrlVariables {
  scopeType: GoogleCalendarScopeType;
  companyId?: string | null;
}

export const CONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION = gql`
  mutation ConnectGoogleCalendarAccount($code: String!, $state: String!) {
    connectGoogleCalendarAccount(code: $code, state: $state) {
      success
      message
      accountId
      googleAccountEmail
      calendarsCount
    }
  }
`;

export interface ConnectGoogleCalendarAccountResponse {
  connectGoogleCalendarAccount: {
    success: boolean;
    message: string;
    accountId: string | null;
    googleAccountEmail: string | null;
    calendarsCount: number | null;
  };
}

export interface ConnectGoogleCalendarAccountVariables {
  code: string;
  state: string;
}

// ---------------------------------------------------------------------------
// Administración de cuentas / calendarios
// ---------------------------------------------------------------------------

export const DISCONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION = gql`
  mutation DisconnectGoogleCalendarAccount($accountId: ID!) {
    disconnectGoogleCalendarAccount(accountId: $accountId) {
      success
      message
    }
  }
`;

export interface DisconnectGoogleCalendarAccountResponse {
  disconnectGoogleCalendarAccount: { success: boolean; message: string };
}

export const REFRESH_GOOGLE_CALENDAR_LIST_MUTATION = gql`
  mutation RefreshGoogleCalendarList($accountId: ID!) {
    refreshGoogleCalendarList(accountId: $accountId) {
      success
      message
      calendarsCount
    }
  }
`;

export interface RefreshGoogleCalendarListResponse {
  refreshGoogleCalendarList: {
    success: boolean;
    message: string;
    calendarsCount: number | null;
  };
}

export const TOGGLE_GOOGLE_CALENDAR_SELECTION_MUTATION = gql`
  mutation ToggleGoogleCalendarSelection($selectionId: ID!, $isSelected: Boolean!) {
    toggleGoogleCalendarSelection(selectionId: $selectionId, isSelected: $isSelected) {
      success
      message
      selectionId
      isSelected
    }
  }
`;

export interface ToggleGoogleCalendarSelectionResponse {
  toggleGoogleCalendarSelection: {
    success: boolean;
    message: string;
    selectionId: string | null;
    isSelected: boolean | null;
  };
}

export const SET_GOOGLE_CALENDAR_PUSH_SETTINGS_MUTATION = gql`
  mutation SetGoogleCalendarPushSettings(
    $selectionId: ID!
    $settings: GoogleCalendarPushSettingsInput!
  ) {
    setGoogleCalendarPushSettings(selectionId: $selectionId, settings: $settings) {
      success
      message
      selectionId
      pushActivities
      pushProposals
      pushFollowUps
      pushTasks
    }
  }
`;

export interface SetGoogleCalendarPushSettingsResponse {
  setGoogleCalendarPushSettings: {
    success: boolean;
    message: string;
    selectionId: string | null;
  };
}

// ---------------------------------------------------------------------------
// Eventos de Google (pull en vivo, no se guardan en Kadesh)
// ---------------------------------------------------------------------------

export const SYNC_GOOGLE_CALENDAR_NOW_QUERY = gql`
  query SyncGoogleCalendarNow($selectionIds: [ID!]!, $timeMin: String!, $timeMax: String!) {
    syncGoogleCalendarNow(selectionIds: $selectionIds, timeMin: $timeMin, timeMax: $timeMax) {
      success
      message
      events {
        id
        selectionId
        calendarId
        calendarName
        accountEmail
        colorHex
        title
        description
        location
        start
        end
        allDay
        htmlLink
        kadeshEventId
      }
    }
  }
`;

export interface GooglePulledEvent {
  id: string;
  selectionId: string;
  calendarId: string;
  calendarName: string;
  accountEmail: string;
  colorHex: string | null;
  title: string;
  description: string | null;
  location: string | null;
  /** ISO con hora, o `YYYY-MM-DD` si es de día completo. */
  start: string;
  end: string | null;
  allDay: boolean;
  htmlLink: string | null;
  /** Si el evento lo empujó Kadesh, id del `TechCalendarEvent` (se omite para no duplicar). */
  kadeshEventId: string | null;
}

export interface SyncGoogleCalendarNowResponse {
  syncGoogleCalendarNow: {
    success: boolean;
    message: string | null;
    events: GooglePulledEvent[];
  };
}

export interface SyncGoogleCalendarNowVariables {
  selectionIds: string[];
  timeMin: string;
  timeMax: string;
}

// ---------------------------------------------------------------------------
// Eventos nativos de Kadesh (TechCalendarEvent creados a mano)
// ---------------------------------------------------------------------------

export const TECH_CALENDAR_EVENTS_QUERY = gql`
  query TechCalendarEvents($where: TechCalendarEventWhereInput!) {
    techCalendarEvents(where: $where, orderBy: [{ startAt: asc }], take: 1000) {
      id
      title
      description
      startAt
      endAt
      allDay
      location
      createdBy {
        id
        name
      }
      googleTargets {
        id
      }
      googleLinks {
        id
        lastPushStatus
      }
    }
  }
`;

export interface NativeCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  createdBy: { id: string; name: string } | null;
  googleTargets: { id: string }[];
  googleLinks: { id: string; lastPushStatus: "pending" | "success" | "error" | null }[];
}

export interface TechCalendarEventsResponse {
  techCalendarEvents: NativeCalendarEvent[];
}

export interface TechCalendarEventsVariables {
  where: Record<string, unknown>;
}

export const CREATE_TECH_CALENDAR_EVENT_MUTATION = gql`
  mutation CreateTechCalendarEvent($data: TechCalendarEventCreateInput!) {
    createTechCalendarEvent(data: $data) {
      id
    }
  }
`;

export interface CreateTechCalendarEventVariables {
  data: {
    title: string;
    description?: string | null;
    startAt: string;
    endAt?: string | null;
    allDay: boolean;
    location?: string | null;
    sourceType: "native";
    /** Calendarios de Google que recibirán el evento. */
    googleTargets?: { connect: { id: string }[] };
  };
}

export const DELETE_TECH_CALENDAR_EVENT_MUTATION = gql`
  mutation DeleteTechCalendarEvent($id: ID!) {
    deleteTechCalendarEvent(where: { id: $id }) {
      id
    }
  }
`;
