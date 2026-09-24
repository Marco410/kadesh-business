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
      whatsappTemplateStatus
      whatsappAppId
      whatsappWebhookConfiguredAt
      whatsappLastWebhookAt
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
  whatsappTemplateStatus: "none" | "pending" | "approved" | "rejected" | null;
  whatsappAppId: string | null;
  /** Kadesh dejó el webhook configurado por API (no implica que la App esté publicada). */
  whatsappWebhookConfiguredAt: string | null;
  /** Último mensaje REAL recibido por el webhook; null = nunca ha llegado uno. */
  whatsappLastWebhookAt: string | null;
}

export interface CompanyWhatsappSettingsResponse {
  saasCompany: CompanyWhatsappSettings | null;
}

export interface CompanyWhatsappSettingsVariables {
  id: string;
}

// Callback URL + Verify Token del webhook de Meta: nunca hardcodeados en el front (el
// Verify Token es un secreto del backend), se piden autenticados vía esta query, gateada por
// canManageCompanyWhatsapp en el backend (graphql/customs/queries/whatsapp/).
export const COMPANY_WHATSAPP_WEBHOOK_INFO_QUERY = gql`
  query CompanyWhatsappWebhookInfo($companyId: ID!) {
    companyWhatsappWebhookInfo(companyId: $companyId) {
      success
      message
      webhookUrl
      verifyToken
    }
  }
`;

export interface CompanyWhatsappWebhookInfoResult {
  success: boolean;
  message: string;
  webhookUrl: string | null;
  verifyToken: string | null;
}

export interface CompanyWhatsappWebhookInfoResponse {
  companyWhatsappWebhookInfo: CompanyWhatsappWebhookInfoResult;
}

export interface CompanyWhatsappWebhookInfoVariables {
  companyId: string;
}

export const WHATSAPP_CONVERSATIONS_QUERY = gql`
  query WhatsAppConversations($companyId: ID!) {
    whatsappConversations(companyId: $companyId) {
      success
      message
      conversations {
        leadId
        teamMemberId
        phoneKey
        kind
        name
        phone
        assignedToId
        assignedToName
        lastMessageBody
        lastMessageAt
        lastMessageDirection
      }
    }
  }
`;

/** `phone` = un número que escribió sin ser cliente todavía (solo lo ven los admins). */
export type WhatsAppConversationKind = "lead" | "team" | "phone";

export interface WhatsAppConversationSummary {
  /** Presente solo en conversaciones con un cliente. */
  leadId: string | null;
  /** Presente solo en conversaciones internas con alguien del equipo. */
  teamMemberId: string | null;
  /** Últimos 10 dígitos; presente solo en conversaciones con un número que aún no es cliente. */
  phoneKey: string | null;
  kind: WhatsAppConversationKind;
  name: string;
  phone: string | null;
  /** Vendedor dueño del chat (= salesPerson del lead). Vacío = solo lo ven los admins. */
  assignedToId: string | null;
  assignedToName: string | null;
  lastMessageBody: string;
  lastMessageAt: string;
  lastMessageDirection: "inbound" | "outbound" | "unknown";
}

export interface WhatsAppConversationsResult {
  success: boolean;
  message: string;
  conversations: WhatsAppConversationSummary[];
}

export interface WhatsAppConversationsResponse {
  whatsappConversations: WhatsAppConversationsResult;
}

export interface WhatsAppConversationsVariables {
  companyId: string;
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
      templateError
    }
  }
`;

export interface TestCompanyWhatsappConnectionResult {
  success: boolean;
  message: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  /** Motivo (de Meta) por el que no se pudo crear la plantilla de inicio; null si salió bien. */
  templateError: string | null;
}

export interface TestCompanyWhatsappConnectionResponse {
  testCompanyWhatsappConnection: TestCompanyWhatsappConnectionResult;
}

export interface TestCompanyWhatsappConnectionVariables {
  companyId: string;
}

export const DISCOVER_WHATSAPP_ACCOUNT_MUTATION = gql`
  mutation DiscoverWhatsappAccount($input: DiscoverWhatsappAccountInput!) {
    discoverWhatsappAccount(input: $input) {
      success
      message
      detail
      needsSelection
      phoneOptions {
        id
        displayPhoneNumber
        verifiedName
        wabaId
      }
      displayPhoneNumber
      verifiedName
      webhookConfigured
      webhookError
      templateError
    }
  }
`;

export interface WhatsappPhoneOption {
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
  wabaId: string;
}

export interface DiscoverWhatsappAccountResult {
  success: boolean;
  message: string;
  detail: string | null;
  needsSelection: boolean;
  phoneOptions: WhatsappPhoneOption[];
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  webhookConfigured: boolean;
  webhookError: string | null;
  templateError: string | null;
}

export interface DiscoverWhatsappAccountResponse {
  discoverWhatsappAccount: DiscoverWhatsappAccountResult;
}

export interface DiscoverWhatsappAccountVariables {
  input: {
    companyId: string;
    appId: string;
    appSecret: string;
    accessToken: string;
    phoneNumberId?: string;
  };
}

export const SEND_WHATSAPP_MESSAGE_MUTATION = gql`
  mutation SendWhatsAppMessage($businessLeadId: ID, $teamMemberId: ID, $phone: String, $body: String!) {
    sendWhatsAppMessage(businessLeadId: $businessLeadId, teamMemberId: $teamMemberId, phone: $phone, body: $body) {
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
  businessLeadId?: string | null;
  teamMemberId?: string | null;
  phone?: string | null;
  body: string;
}

/** Cuántos mensajes trae cada página del chat (los últimos al abrir; otros tantos al subir). */
export const WHATSAPP_MESSAGES_PAGE_SIZE = 30;

/** Paginada por cursor (id), no por `skip`: mientras alguien escribe llegan mensajes nuevos y un
 * `skip` fijo se correría y repetiría o se comería mensajes. `id` va como desempate porque los
 * mensajes importados comparten minuto y sin él el orden entre ellos no es estable. */
export const WHATSAPP_MESSAGES_QUERY = gql`
  query WhatsAppMessages(
    $where: TechWhatsAppMessageWhereInput!
    $orderBy: [TechWhatsAppMessageOrderByInput!]!
    $take: Int!
    $skip: Int! = 0
    $cursor: TechWhatsAppMessageWhereUniqueInput
  ) {
    techWhatsAppMessages(
      where: $where
      orderBy: $orderBy
      take: $take
      skip: $skip
      cursor: $cursor
    ) {
      id
      direction
      source
      senderLabel
      messageKind
      body
      status
      errorMessage
      mediaUrl
      mediaType
      mediaFileName
      createdAt
    }
  }
`;

export interface WhatsAppMessageItem {
  id: string;
  direction: "inbound" | "outbound" | "unknown";
  source: "api" | "imported";
  senderLabel: string | null;
  messageKind: "text" | "template";
  body: string;
  status: "sent" | "received" | "failed";
  errorMessage: string | null;
  mediaUrl: string | null;
  mediaType: "image" | "document" | null;
  mediaFileName: string | null;
  createdAt: string;
}

export interface WhatsAppMessagesResponse {
  techWhatsAppMessages: WhatsAppMessageItem[];
}

type MessageOrderBy = Array<{ createdAt: "asc" | "desc" } | { id: "asc" | "desc" }>;

export const WHATSAPP_NEWEST_FIRST: MessageOrderBy = [{ createdAt: "desc" }, { id: "desc" }];
export const WHATSAPP_OLDEST_FIRST: MessageOrderBy = [{ createdAt: "asc" }, { id: "asc" }];

export interface WhatsAppMessagesVariables {
  where: Record<string, unknown>;
  orderBy: MessageOrderBy;
  take: number;
  skip?: number;
  cursor?: { id: string } | null;
}

/** Filtro de la conversación: con un cliente (lead), interna (compañero de equipo) o con un
 * número que aún no es cliente (`id` = últimos 10 dígitos; se busca en quien lo mandó o recibió). */
export function whatsappConversationWhere(target: {
  kind: "lead" | "team" | "phone";
  id: string;
}): Record<string, unknown> {
  if (target.kind === "lead") return { businessLead: { id: { equals: target.id } } };
  if (target.kind === "team") return { teamMember: { id: { equals: target.id } } };
  return {
    OR: [{ fromPhone: { endsWith: target.id } }, { toPhone: { endsWith: target.id } }],
  };
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

/** Estado para decidir si mostrar el composer normal o el botón "Iniciar conversación". */
export const BUSINESS_LEAD_WHATSAPP_STATUS_QUERY = gql`
  query BusinessLeadWhatsappStatus($businessLeadId: ID, $teamMemberId: ID, $phone: String) {
    businessLeadWhatsappStatus(businessLeadId: $businessLeadId, teamMemberId: $teamMemberId, phone: $phone) {
      success
      message
      canReplyFreely
      templateStatus
    }
  }
`;

export interface BusinessLeadWhatsappStatusResult {
  success: boolean;
  message: string;
  canReplyFreely: boolean;
  templateStatus: "none" | "pending" | "approved" | "rejected" | null;
}

export interface BusinessLeadWhatsappStatusResponse {
  businessLeadWhatsappStatus: BusinessLeadWhatsappStatusResult;
}

export interface BusinessLeadWhatsappStatusVariables {
  businessLeadId?: string | null;
  teamMemberId?: string | null;
  phone?: string | null;
}

/** Manda la plantilla aprobada para iniciarle conversación a un lead que nunca ha escrito. */
export const START_WHATSAPP_CONVERSATION_MUTATION = gql`
  mutation StartWhatsAppConversation($businessLeadId: ID, $teamMemberId: ID, $phone: String) {
    startWhatsAppConversation(businessLeadId: $businessLeadId, teamMemberId: $teamMemberId, phone: $phone) {
      success
      message
    }
  }
`;

export interface StartWhatsAppConversationResult {
  success: boolean;
  message: string;
}

export interface StartWhatsAppConversationResponse {
  startWhatsAppConversation: StartWhatsAppConversationResult;
}

export interface StartWhatsAppConversationVariables {
  businessLeadId?: string | null;
  teamMemberId?: string | null;
  phone?: string | null;
}

export const SEND_WHATSAPP_MEDIA_MESSAGE_MUTATION = gql`
  mutation SendWhatsAppMediaMessage($businessLeadId: ID, $teamMemberId: ID, $phone: String, $media: Upload!, $caption: String) {
    sendWhatsAppMediaMessage(businessLeadId: $businessLeadId, teamMemberId: $teamMemberId, phone: $phone, media: $media, caption: $caption) {
      success
      message
      messageId
    }
  }
`;

export interface SendWhatsAppMediaMessageResult {
  success: boolean;
  message: string;
  messageId: string | null;
}

export interface SendWhatsAppMediaMessageResponse {
  sendWhatsAppMediaMessage: SendWhatsAppMediaMessageResult;
}

export interface SendWhatsAppMediaMessageVariables {
  businessLeadId?: string | null;
  teamMemberId?: string | null;
  phone?: string | null;
  media: File;
  caption?: string | null;
}

/** Compañeros de la empresa a los que se les puede escribir (o asignarles un chat). */
export const COMPANY_WHATSAPP_TEAM_QUERY = gql`
  query CompanyWhatsappTeam($companyId: ID!) {
    companyWhatsappTeam(companyId: $companyId) {
      success
      message
      members {
        id
        name
        phone
        canReceiveWhatsapp
      }
    }
  }
`;

export interface WhatsAppTeamMember {
  id: string;
  name: string;
  phone: string | null;
  canReceiveWhatsapp: boolean;
}

export interface CompanyWhatsappTeamResponse {
  companyWhatsappTeam: {
    success: boolean;
    message: string;
    members: WhatsAppTeamMember[];
  };
}

export interface CompanyWhatsappTeamVariables {
  companyId: string;
}

/** Asignar el chat = asignarle el lead a ese vendedor (una sola fuente de verdad). */
export const ASSIGN_WHATSAPP_CONVERSATION_MUTATION = gql`
  mutation AssignWhatsAppConversation($businessLeadId: ID!, $salesPersonId: ID) {
    assignWhatsAppConversation(
      businessLeadId: $businessLeadId
      salesPersonId: $salesPersonId
    ) {
      success
      message
    }
  }
`;

export interface AssignWhatsAppConversationResponse {
  assignWhatsAppConversation: { success: boolean; message: string };
}

export interface AssignWhatsAppConversationVariables {
  businessLeadId: string;
  salesPersonId?: string | null;
}

/** Al guardar como cliente un número que escribió solo: enlaza el historial que ya tenía. */
export const LINK_WHATSAPP_CONTACT_TO_LEAD_MUTATION = gql`
  mutation LinkWhatsAppContactToLead($businessLeadId: ID!, $phone: String!) {
    linkWhatsAppContactToLead(businessLeadId: $businessLeadId, phone: $phone) {
      success
      message
      linked
    }
  }
`;

export interface LinkWhatsAppContactToLeadResponse {
  linkWhatsAppContactToLead: { success: boolean; message: string; linked: number };
}

export interface LinkWhatsAppContactToLeadVariables {
  businessLeadId: string;
  phone: string;
}
