import { gql } from "@apollo/client";

/** Operaciones → Kadesh Pet → Avisos y Alertas de zona (kadesh-back: `queries/admin/adminNotifications.ts`). */

export const ADMIN_NOTIFICATION_LOG_QUERY = gql`
  query AdminNotificationLog(
    $product: String
    $type: String
    $channel: String
    $result: String
    $search: String
    $entityId: String
    $days: Int
    $take: Int
    $skip: Int
  ) {
    adminNotificationLog(
      product: $product
      type: $type
      channel: $channel
      result: $result
      search: $search
      entityId: $entityId
      days: $days
      take: $take
      skip: $skip
    ) {
      total
      items {
        id
        createdAt
        type
        title
        body
        url
        entityType
        entityId
        readAt
        recipient {
          id
          name
          lastName
          email
        }
        recipientPhone
        pushStatus
        pushDevices
        whatsappStatus
        whatsappDetail
        whatsappUpdatedAt
      }
      summary {
        total
        read
        pushSent
        pushFailed
        pushNoDevices
        whatsappDelivered
        whatsappPending
        whatsappFailed
        whatsappSkipped
      }
      types {
        key
        count
      }
    }
  }
`;

export const ADMIN_ZONE_ALERTS_QUERY = gql`
  query AdminZoneAlerts($search: String, $status: String, $take: Int, $skip: Int) {
    adminZoneAlerts(search: $search, status: $status, take: $take, skip: $skip) {
      total
      items {
        id
        name
        lastName
        email
        phone
        enabled
        lat
        lng
        radiusKm
        whatsapp
        pushDevices
        alerts30d
        lastAlertAt
      }
      summary {
        active
        inactive
        withPush
        withWhatsapp
        alerts7d
      }
    }
  }
`;

export const ADMIN_ZONE_ALERT_PREVIEW_QUERY = gql`
  query AdminZoneAlertPreview($lat: Float!, $lng: Float!) {
    adminZoneAlertPreview(lat: $lat, lng: $lng) {
      total
      wouldReceive
      capped
      maxPerDay
      items {
        id
        name
        lastName
        email
        distanceKm
        radiusKm
        alertsToday
        capped
        pushDevices
        whatsapp
      }
    }
  }
`;

export const ADMIN_UPDATE_ZONE_ALERTS_MUTATION = gql`
  mutation AdminUpdateZoneAlerts(
    $userId: ID!
    $enabled: Boolean
    $lat: Float
    $lng: Float
    $radiusKm: Int
    $disableWhatsapp: Boolean
  ) {
    adminUpdateZoneAlerts(
      userId: $userId
      enabled: $enabled
      lat: $lat
      lng: $lng
      radiusKm: $radiusKm
      disableWhatsapp: $disableWhatsapp
    ) {
      success
      message
    }
  }
`;

type PersonRef = { id: string; name: string; lastName: string | null; email: string | null };

export type AdminNotificationRow = {
  id: string;
  createdAt: string | null;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  recipient: PersonRef | null;
  recipientPhone: string | null;
  pushStatus: string | null;
  pushDevices: number | null;
  whatsappStatus: string | null;
  whatsappDetail: string | null;
  whatsappUpdatedAt: string | null;
};

export type AdminNotificationLogResponse = {
  adminNotificationLog: {
    total: number;
    items: AdminNotificationRow[];
    summary: {
      total: number;
      read: number;
      pushSent: number;
      pushFailed: number;
      pushNoDevices: number;
      whatsappDelivered: number;
      whatsappPending: number;
      whatsappFailed: number;
      whatsappSkipped: number;
    };
    types: Array<{ key: string; count: number }>;
  };
};

/** `on`, `off` (no lo activó), `no_phone` o `muted` (silenció las alertas de zona). */
export type ZoneWhatsappState = "on" | "off" | "no_phone" | "muted";

export type AdminZoneAlertRow = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  enabled: boolean;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  whatsapp: ZoneWhatsappState;
  pushDevices: number;
  alerts30d: number;
  lastAlertAt: string | null;
};

export type AdminZoneAlertsResponse = {
  adminZoneAlerts: {
    total: number;
    items: AdminZoneAlertRow[];
    summary: { active: number; inactive: number; withPush: number; withWhatsapp: number; alerts7d: number };
  };
};

export type AdminZonePreviewRow = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
  distanceKm: number;
  radiusKm: number | null;
  alertsToday: number;
  capped: boolean;
  pushDevices: number;
  whatsapp: ZoneWhatsappState;
};

export type AdminZonePreviewResponse = {
  adminZoneAlertPreview: {
    total: number;
    wouldReceive: number;
    capped: number;
    maxPerDay: number;
    items: AdminZonePreviewRow[];
  };
};

export type AdminUpdateZoneAlertsResponse = {
  adminUpdateZoneAlerts: { success: boolean; message: string };
};
