import { gql } from "@apollo/client";

/**
 * Operaciones → Kadesh Pet → Tienda → Pedidos and Ajustes. Orders are read and moved through the
 * custom `adminStore*` operations of kadesh-back (the generated API cannot write an order); the
 * settings are the `StoreSettings` singleton of the generated API.
 */

export type AdminPersonRef = { id: string; name: string; lastName: string | null; email: string | null };

export type AdminStoreOrderRow = {
  id: string;
  number: string;
  createdAt: string | null;
  customerName: string | null;
  email: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  totalCents: number;
  itemsCount: number;
  shipCity: string | null;
  shipStateName: string | null;
  guestCheckout: boolean;
  expiresAt: string | null;
};

const ORDER_ROW_FIELDS = `
  id
  number
  createdAt
  customerName
  email
  status
  paymentStatus
  fulfillmentStatus
  paymentMethod
  totalCents
  itemsCount
  shipCity
  shipStateName
  guestCheckout
  expiresAt
`;

export type AdminStoreOrdersResponse = {
  adminStoreOrders: {
    total: number;
    items: AdminStoreOrderRow[];
    queues: Array<{ key: string; count: number }>;
  };
};

export const ADMIN_STORE_ORDERS_QUERY = gql`
  query AdminStoreOrders($search: String, $queue: String, $paymentMethod: String, $take: Int, $skip: Int) {
    adminStoreOrders(search: $search, queue: $queue, paymentMethod: $paymentMethod, take: $take, skip: $skip) {
      total
      queues {
        key
        count
      }
      items {
        ${ORDER_ROW_FIELDS}
      }
    }
  }
`;

export type AdminStoreOrderLine = {
  id: string;
  productId: string | null;
  name: string;
  variantTitle: string | null;
  sku: string | null;
  source: string | null;
  externalId: string | null;
  dropiVariationId: number | null;
  coverUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number | null;
  totalCents: number;
  shipmentId: string | null;
};

export type AdminStorePayment = {
  id: string;
  provider: string;
  amountCents: number;
  status: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  refundedCents: number | null;
  transferProofUrl: string | null;
  transferReference: string | null;
  reviewedBy: AdminPersonRef | null;
  reviewedAt: string | null;
  errorMessage: string | null;
  createdAt: string | null;
};

export type AdminStoreShipment = {
  id: string;
  provider: string;
  status: string;
  /** Statuses an admin may set next, the current one first (decided by the backend). */
  nextStatuses: string[];
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippingCostCents: number | null;
  dropiOrderId: string | null;
  dropiStatus: string | null;
  dropiSupplierId: number | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  lastError: string | null;
};

export type AdminStoreOrderEvent = {
  id: string;
  type: string;
  message: string | null;
  isPublic: boolean;
  actor: AdminPersonRef | null;
  createdAt: string | null;
};

export type AdminStoreAddress = {
  recipientName: string;
  phone: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string;
  city: string;
  stateName: string;
  postalCode: string;
  references: string | null;
};

export type AdminStoreOrderDetail = {
  order: AdminStoreOrderRow;
  user: AdminPersonRef | null;
  phone: string | null;
  subtotalCents: number;
  shippingCents: number;
  couponCode: string | null;
  couponDiscountCents: number;
  costCents: number;
  shippingCostCents: number;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  customerNote: string | null;
  adminNote: string | null;
  address: AdminStoreAddress;
  items: AdminStoreOrderLine[];
  payments: AdminStorePayment[];
  shipments: AdminStoreShipment[];
  events: AdminStoreOrderEvent[];
};

const PERSON_FIELDS = "id name lastName email";

export const ADMIN_STORE_ORDER_QUERY = gql`
  query AdminStoreOrder($id: ID!) {
    adminStoreOrder(id: $id) {
      order {
        ${ORDER_ROW_FIELDS}
      }
      user { ${PERSON_FIELDS} }
      phone
      subtotalCents
      shippingCents
      couponCode
      couponDiscountCents
      costCents
      shippingCostCents
      stripePaymentIntentId
      paidAt
      cancelledAt
      cancelReason
      customerNote
      adminNote
      address {
        recipientName
        phone
        street
        exteriorNumber
        interiorNumber
        neighborhood
        city
        stateName
        postalCode
        references
      }
      items {
        id
        productId
        name
        variantTitle
        sku
        source
        externalId
        dropiVariationId
        coverUrl
        quantity
        unitPriceCents
        unitCostCents
        totalCents
        shipmentId
      }
      payments {
        id
        provider
        amountCents
        status
        stripePaymentIntentId
        stripeChargeId
        refundedCents
        transferProofUrl
        transferReference
        reviewedBy { ${PERSON_FIELDS} }
        reviewedAt
        errorMessage
        createdAt
      }
      shipments {
        id
        provider
        status
        nextStatuses
        carrier
        trackingCode
        trackingUrl
        shippingCostCents
        dropiOrderId
        dropiStatus
        dropiSupplierId
        shippedAt
        deliveredAt
        lastError
      }
      events {
        id
        type
        message
        isPublic
        actor { ${PERSON_FIELDS} }
        createdAt
      }
    }
  }
`;

export type AdminStoreActionResult = { success: boolean; message: string };

export const ADMIN_REVIEW_STORE_TRANSFER_MUTATION = gql`
  mutation AdminReviewStoreTransfer($orderId: ID!, $approve: Boolean!, $note: String) {
    adminReviewStoreTransfer(orderId: $orderId, approve: $approve, note: $note) {
      success
      message
    }
  }
`;

export const ADMIN_UPDATE_STORE_SHIPMENT_MUTATION = gql`
  mutation AdminUpdateStoreShipment($shipmentId: ID!, $input: AdminStoreShipmentInput!) {
    adminUpdateStoreShipment(shipmentId: $shipmentId, input: $input) {
      success
      message
    }
  }
`;

export const ADMIN_CANCEL_STORE_ORDER_MUTATION = gql`
  mutation AdminCancelStoreOrder($orderId: ID!, $reason: String!) {
    adminCancelStoreOrder(orderId: $orderId, reason: $reason) {
      success
      message
    }
  }
`;

export const ADMIN_REFUND_STORE_ORDER_MUTATION = gql`
  mutation AdminRefundStoreOrder($orderId: ID!, $reason: String!, $restock: Boolean!) {
    adminRefundStoreOrder(orderId: $orderId, reason: $reason, restock: $restock) {
      success
      message
    }
  }
`;

export const ADMIN_SET_STORE_ORDER_NOTE_MUTATION = gql`
  mutation AdminSetStoreOrderNote($orderId: ID!, $note: String!) {
    adminSetStoreOrderNote(orderId: $orderId, note: $note) {
      success
      message
    }
  }
`;

// ─── Settings ───────────────────────────────────────────────────────────────────────────────

export type AdminStoreSettings = {
  id: string;
  shippingFlatCents: number | null;
  freeShippingMinCents: number | null;
  cardEnabled: boolean | null;
  transferEnabled: boolean | null;
  bankName: string | null;
  bankBeneficiary: string | null;
  bankClabe: string | null;
  bankNote: string | null;
  transferExpiryHours: number | null;
  cardExpiryMinutes: number | null;
  returnPolicy: string | null;
  supportWhatsapp: string | null;
};

const SETTINGS_FIELDS = `
  id
  shippingFlatCents
  freeShippingMinCents
  cardEnabled
  transferEnabled
  bankName
  bankBeneficiary
  bankClabe
  bankNote
  transferExpiryHours
  cardExpiryMinutes
  returnPolicy
  supportWhatsapp
`;

/** One row. `null` until someone saves it for the first time (the backend then uses its defaults). */
export const ADMIN_STORE_SETTINGS_QUERY = gql`
  query AdminStoreSettings {
    storeSettings {
      ${SETTINGS_FIELDS}
    }
  }
`;

export const CREATE_ADMIN_STORE_SETTINGS_MUTATION = gql`
  mutation CreateAdminStoreSettings($data: StoreSettingsCreateInput!) {
    createStoreSettings(data: $data) {
      ${SETTINGS_FIELDS}
    }
  }
`;

export const UPDATE_ADMIN_STORE_SETTINGS_MUTATION = gql`
  mutation UpdateAdminStoreSettings($data: StoreSettingsUpdateInput!) {
    updateStoreSettings(data: $data) {
      ${SETTINGS_FIELDS}
    }
  }
`;
