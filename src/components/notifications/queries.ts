import { gql } from "@apollo/client";

/** Las del usuario en sesión (el back filtra por destinatario). */
export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($take: Int!) {
    notifications(orderBy: [{ createdAt: desc }], take: $take) {
      id
      product
      type
      title
      body
      entityType
      entityId
      url
      metadata
      readAt
      createdAt
    }
    unread: notificationsCount(where: { readAt: null })
  }
`;

export const MY_UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query MyUnreadNotificationsCount {
    notificationsCount(where: { readAt: null })
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!, $readAt: DateTime!) {
    updateNotification(where: { id: $id }, data: { readAt: $readAt }) {
      id
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead($product: String) {
    markAllNotificationsRead(product: $product)
  }
`;

export type NotificationItem = {
  id: string;
  product: string | null;
  type: string | null;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type MyNotificationsResponse = {
  notifications: NotificationItem[];
  unread: number;
};

export type MyUnreadNotificationsCountResponse = {
  notificationsCount: number;
};
