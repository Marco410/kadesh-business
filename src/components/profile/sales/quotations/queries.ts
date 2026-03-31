import { gql } from "@apollo/client";

export const SAAS_QUOTATIONS_LIST_QUERY = gql`
  query SaasQuotationsList(
    $where: SaasQuotationWhereInput!
    $orderBy: [SaasQuotationOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    saasQuotations(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      quotationNumber
      status
      currency
      total
      validUntil
      createdAt
      updatedAt
      lead {
        id
        businessName
      }
      company {
        id
      }
    }
  }
`;

export const CREATE_SAAS_QUOTATION_MUTATION = gql`
  mutation CreateSaasQuotation($data: SaasQuotationCreateInput!) {
    createSaasQuotation(data: $data) {
      id
      quotationNumber
      status
      currency
      total
      createdAt
    }
  }
`;

export const SAAS_QUOTATION_DETAIL_QUERY = gql`
  query SaasQuotationDetail($where: SaasQuotationWhereUniqueInput!) {
    saasQuotation(where: $where) {
      id
      quotationNumber
      status
      currency
      exchangeRate
      subtotal
      discountTotal
      taxTotal
      total
      validUntil
      notes
      terms
      sentAt
      acceptedAt
      createdAt
      updatedAt
      lead {
        id
        businessName
      }
      assignedSeller {
        id
        name
      }
      project {
        id
        name
      }
      company {
        id
        termsQuotation
      }
      quotationProducts {
        id
        createdAt
        description
        discountType
        discountValue
        lineSubtotal
        lineTotal
        quantity
        taxRate
        unitPrice
        updatedAt
        quotation {
          id
        }
      }
    }
  }
`;

export const UPDATE_SAAS_QUOTATION_MUTATION = gql`
  mutation UpdateSaasQuotation(
    $where: SaasQuotationWhereUniqueInput!
    $data: SaasQuotationUpdateInput!
  ) {
    updateSaasQuotation(where: $where, data: $data) {
      id
      quotationNumber
      status
      currency
      exchangeRate
      subtotal
      discountTotal
      taxTotal
      total
      validUntil
      notes
      terms
      sentAt
      acceptedAt
      updatedAt
      lead {
        id
      }
      assignedSeller {
        id
      }
      project {
        id
      }
      quotationProducts {
        id
      }
    }
  }
`;

export const SAAS_QUOTATION_PRODUCTS_LIST_QUERY = gql`
  query SaasQuotationProductsList(
    $where: SaasQuotationProductWhereInput!
    $orderBy: [SaasQuotationProductOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    saasQuotationProducts(
      where: $where
      orderBy: $orderBy
      take: $take
      skip: $skip
    ) {
      id
      createdAt
      description
      discountType
      discountValue
      lineSubtotal
      lineTotal
      quantity
      taxRate
      unitPrice
      updatedAt
      quotation {
        id
      }
    }
  }
`;

export const CREATE_SAAS_QUOTATION_PRODUCT_MUTATION = gql`
  mutation CreateSaasQuotationProduct($data: SaasQuotationProductCreateInput!) {
    createSaasQuotationProduct(data: $data) {
      id
      description
      discountType
      discountValue
      lineSubtotal
      lineTotal
      quantity
      taxRate
      unitPrice
    }
  }
`;

export const UPDATE_SAAS_QUOTATION_PRODUCT_MUTATION = gql`
  mutation UpdateSaasQuotationProduct(
    $where: SaasQuotationProductWhereUniqueInput!
    $data: SaasQuotationProductUpdateInput!
  ) {
    updateSaasQuotationProduct(where: $where, data: $data) {
      id
      description
      discountType
      discountValue
      lineSubtotal
      lineTotal
      quantity
      taxRate
      unitPrice
    }
  }
`;

export const DELETE_SAAS_QUOTATION_PRODUCT_MUTATION = gql`
  mutation DeleteSaasQuotationProduct(
    $where: SaasQuotationProductWhereUniqueInput!
  ) {
    deleteSaasQuotationProduct(where: $where) {
      id
    }
  }
`;

export interface SaasQuotationRow {
  id: string;
  quotationNumber: string;
  status: string | null;
  currency: string | null;
  total: number | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  lead: { id: string; businessName: string | null } | null;
  company: { id: string } | null;
}

export interface SaasQuotationsListResponse {
  saasQuotations: SaasQuotationRow[];
}

export interface SaasQuotationsListVariables {
  where: Record<string, unknown>;
  orderBy: Record<string, "asc" | "desc">[];
  take: number;
  skip: number;
}

export interface CreateSaasQuotationResponse {
  createSaasQuotation: {
    id: string;
    quotationNumber: string;
    status: string | null;
    currency: string | null;
    total: number | null;
    createdAt: string;
  } | null;
}

export interface CreateSaasQuotationVariables {
  data: {
    company: { connect: { id: string } };
    createdBy?: { connect: { id: string } };
    assignedSeller?: { connect: { id: string } };
    lead?: { connect: { id: string } };
    currency?: string;
    validUntil?: string | null;
    notes?: string | null;
    quotationNumber?: string | null;
  };
}

export interface SaasQuotationProductRow {
  id: string;
  createdAt: string;
  description: string | null;
  discountType: string | null;
  discountValue: number | null;
  lineSubtotal: number | null;
  lineTotal: number | null;
  quantity: number | null;
  taxRate: number | null;
  unitPrice: number | null;
  updatedAt: string;
  quotation: { id: string } | null;
}

export interface SaasQuotationDetail {
  id: string;
  quotationNumber: string;
  status: string | null;
  currency: string | null;
  exchangeRate: number | null;
  subtotal: number | null;
  discountTotal: number | null;
  taxTotal: number | null;
  total: number | null;
  validUntil: string | null;
  notes: string | null;
  terms: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead: { id: string; businessName: string | null } | null;
  assignedSeller: { id: string; name: string | null } | null;
  project: { id: string; name: string | null } | null;
  company: { id: string; termsQuotation: string | null } | null;
  quotationProducts: SaasQuotationProductRow[];
}

export interface SaasQuotationDetailResponse {
  saasQuotation: SaasQuotationDetail | null;
}

export interface SaasQuotationDetailVariables {
  where: { id: string };
}

export interface UpdateSaasQuotationResponse {
  updateSaasQuotation: Pick<
    SaasQuotationDetail,
    | "id"
    | "quotationNumber"
    | "status"
    | "currency"
    | "exchangeRate"
    | "subtotal"
    | "discountTotal"
    | "taxTotal"
    | "total"
    | "validUntil"
    | "notes"
    | "terms"
    | "sentAt"
    | "acceptedAt"
    | "updatedAt"
  > & {
    lead: { id: string } | null;
    assignedSeller: { id: string } | null;
    project: { id: string } | null;
    quotationProducts: { id: string }[];
  } | null;
}

export interface UpdateSaasQuotationVariables {
  where: { id: string };
  data: Record<string, unknown>;
}

export interface SaasQuotationProductsListResponse {
  saasQuotationProducts: SaasQuotationProductRow[];
}

export interface SaasQuotationProductsListVariables {
  where: Record<string, unknown>;
  orderBy: Record<string, "asc" | "desc">[];
  take: number;
  skip: number;
}

export interface CreateSaasQuotationProductResponse {
  createSaasQuotationProduct: SaasQuotationProductRow | null;
}

export interface CreateSaasQuotationProductVariables {
  data: {
    quotation: { connect: { id: string } };
    description?: string | null;
    unitPrice?: number | null;
    quantity?: number | null;
    taxRate?: number | null;
    discountType?: string | null;
    discountValue?: number | null;
  };
}

export interface UpdateSaasQuotationProductResponse {
  updateSaasQuotationProduct: SaasQuotationProductRow | null;
}

export interface UpdateSaasQuotationProductVariables {
  where: { id: string };
  data: {
    description?: string | null;
    unitPrice?: number | null;
    quantity?: number | null;
    taxRate?: number | null;
    discountType?: string | null;
    discountValue?: number | null;
  };
}

export interface DeleteSaasQuotationProductResponse {
  deleteSaasQuotationProduct: { id: string } | null;
}

export interface DeleteSaasQuotationProductVariables {
  where: { id: string };
}
