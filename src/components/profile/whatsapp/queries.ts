import { gql } from "@apollo/client";

export const COMPANY_WHATSAPP_SETTINGS_QUERY = gql`
  query CompanyWhatsappSettings($id: ID!) {
    saasCompany(where: { id: $id }) {
      id
      whatsappPhoneNumberId
      whatsappBusinessAccountId
      whatsappDisplayPhoneNumber
      whatsappTokenPreview
      whatsappConnectedAt
    }
  }
`;

export interface CompanyWhatsappSettings {
  id: string;
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappDisplayPhoneNumber: string | null;
  whatsappTokenPreview: string | null;
  whatsappConnectedAt: string | null;
}

export interface CompanyWhatsappSettingsResponse {
  saasCompany: CompanyWhatsappSettings | null;
}

export interface CompanyWhatsappSettingsVariables {
  id: string;
}

export const UPDATE_COMPANY_WHATSAPP_SETTINGS_MUTATION = gql`
  mutation UpdateCompanyWhatsappSettings(
    $input: UpdateCompanyWhatsappSettingsInput!
  ) {
    updateCompanyWhatsappSettings(input: $input) {
      success
      message
      phoneNumberId
      businessAccountId
      displayPhoneNumber
      tokenPreview
      appSecretConfigured
      connectedAt
    }
  }
`;

export interface UpdateCompanyWhatsappSettingsInput {
  companyId: string;
  phoneNumberId?: string | null;
  businessAccountId?: string | null;
  accessToken?: string | null;
  appSecret?: string | null;
}

export interface UpdateCompanyWhatsappSettingsResult {
  success: boolean;
  message: string;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  displayPhoneNumber: string | null;
  tokenPreview: string | null;
  appSecretConfigured: boolean;
  connectedAt: string | null;
}

export interface UpdateCompanyWhatsappSettingsResponse {
  updateCompanyWhatsappSettings: UpdateCompanyWhatsappSettingsResult;
}

export interface UpdateCompanyWhatsappSettingsVariables {
  input: UpdateCompanyWhatsappSettingsInput;
}

export const TEST_COMPANY_WHATSAPP_CONNECTION_MUTATION = gql`
  mutation TestCompanyWhatsappConnection($companyId: ID!) {
    testCompanyWhatsappConnection(companyId: $companyId) {
      success
      message
      displayPhoneNumber
      verifiedName
    }
  }
`;

export interface TestCompanyWhatsappConnectionResult {
  success: boolean;
  message: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
}

export interface TestCompanyWhatsappConnectionResponse {
  testCompanyWhatsappConnection: TestCompanyWhatsappConnectionResult;
}

export interface TestCompanyWhatsappConnectionVariables {
  companyId: string;
}

export const SEND_WHATSAPP_MESSAGE_MUTATION = gql`
  mutation SendWhatsAppMessage($businessLeadId: ID!, $body: String!) {
    sendWhatsAppMessage(businessLeadId: $businessLeadId, body: $body) {
      success
      message
      messageId
    }
  }
`;

export interface SendWhatsAppMessageResult {
  success: boolean;
  message: string;
  messageId: string | null;
}

export interface SendWhatsAppMessageResponse {
  sendWhatsAppMessage: SendWhatsAppMessageResult;
}

export interface SendWhatsAppMessageVariables {
  businessLeadId: string;
  body: string;
}

export const WHATSAPP_MESSAGES_QUERY = gql`
  query WhatsAppMessages($businessLeadId: ID!) {
    techWhatsAppMessages(
      where: { businessLead: { id: { equals: $businessLeadId } } }
      orderBy: [{ createdAt: asc }]
      take: 200
    ) {
      id
      direction
      source
      senderLabel
      body
      status
      errorMessage
      createdAt
    }
  }
`;

export interface WhatsAppMessageItem {
  id: string;
  direction: "inbound" | "outbound" | "unknown";
  source: "api" | "imported";
  senderLabel: string | null;
  body: string;
  status: "sent" | "received" | "failed";
  errorMessage: string | null;
  createdAt: string;
}

export interface WhatsAppMessagesResponse {
  techWhatsAppMessages: WhatsAppMessageItem[];
}

export interface WhatsAppMessagesVariables {
  businessLeadId: string;
}

export const WHATSAPP_MESSAGES_COUNT_QUERY = gql`
  query WhatsAppMessagesCount($businessLeadId: ID!) {
    techWhatsAppMessagesCount(
      where: { businessLead: { id: { equals: $businessLeadId } } }
    )
  }
`;

export interface WhatsAppMessagesCountResponse {
  techWhatsAppMessagesCount: number;
}

export interface WhatsAppMessagesCountVariables {
  businessLeadId: string;
}

export const PREVIEW_WHATSAPP_CHAT_EXPORT_QUERY = gql`
  query PreviewWhatsAppChatExport($content: String!) {
    previewWhatsAppChatExport(content: $content) {
      success
      message
      messageCount
      senderNames
    }
  }
`;

export interface PreviewWhatsAppChatExportResult {
  success: boolean;
  message: string;
  messageCount: number;
  senderNames: string[];
}

export interface PreviewWhatsAppChatExportResponse {
  previewWhatsAppChatExport: PreviewWhatsAppChatExportResult;
}

export interface PreviewWhatsAppChatExportVariables {
  content: string;
}

export const IMPORT_WHATSAPP_CHAT_EXPORT_MUTATION = gql`
  mutation ImportWhatsAppChatExport(
    $businessLeadId: ID!
    $fileName: String
    $content: String!
    $leadSenderName: String
  ) {
    importWhatsAppChatExport(
      businessLeadId: $businessLeadId
      fileName: $fileName
      content: $content
      leadSenderName: $leadSenderName
    ) {
      success
      message
      imported
      skippedDuplicates
    }
  }
`;

export interface ImportWhatsAppChatExportResult {
  success: boolean;
  message: string;
  imported: number;
  skippedDuplicates: number;
}

export interface ImportWhatsAppChatExportResponse {
  importWhatsAppChatExport: ImportWhatsAppChatExportResult;
}

export interface ImportWhatsAppChatExportVariables {
  businessLeadId: string;
  fileName?: string | null;
  content: string;
  leadSenderName?: string | null;
}
