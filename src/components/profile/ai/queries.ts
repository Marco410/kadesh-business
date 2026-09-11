import { gql } from "@apollo/client";

export const COMPANY_AI_SETTINGS_QUERY = gql`
  query CompanyAiSettings($id: ID!) {
    saasCompany(where: { id: $id }) {
      id
      aiBillingMode
      aiProvider
      aiModel
      aiApiKeyPreview
      aiKeyUpdatedAt
      onboardingMainOffer
      onboardingIdealCustomer
      onboardingAvgTicketValue
      onboardingSalesPain
    }
  }
`;

export interface CompanyAiSettings {
  id: string;
  aiBillingMode: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  aiApiKeyPreview: string | null;
  aiKeyUpdatedAt: string | null;
  onboardingMainOffer: string | null;
  onboardingIdealCustomer: string | null;
  onboardingAvgTicketValue: string | null;
  onboardingSalesPain: string | null;
}

export interface CompanyAiSettingsResponse {
  saasCompany: CompanyAiSettings | null;
}

export interface CompanyAiSettingsVariables {
  id: string;
}

export const UPDATE_COMPANY_AI_SETTINGS_MUTATION = gql`
  mutation UpdateCompanyAiSettings($input: UpdateCompanyAiSettingsInput!) {
    updateCompanyAiSettings(input: $input) {
      success
      message
      billingMode
      provider
      model
      apiKeyPreview
      keyUpdatedAt
    }
  }
`;

export interface UpdateCompanyAiSettingsInput {
  companyId: string;
  billingMode?: string | null;
  provider?: string | null;
  apiKey?: string | null;
  model?: string | null;
}

export interface UpdateCompanyAiSettingsResult {
  success: boolean;
  message: string;
  billingMode: string | null;
  provider: string | null;
  model: string | null;
  apiKeyPreview: string | null;
  keyUpdatedAt: string | null;
}

export interface UpdateCompanyAiSettingsResponse {
  updateCompanyAiSettings: UpdateCompanyAiSettingsResult;
}

export interface UpdateCompanyAiSettingsVariables {
  input: UpdateCompanyAiSettingsInput;
}

export const TEST_COMPANY_AI_CONNECTION_MUTATION = gql`
  mutation TestCompanyAiConnection($companyId: ID!) {
    testCompanyAiConnection(companyId: $companyId) {
      success
      message
    }
  }
`;

export interface TestCompanyAiConnectionResult {
  success: boolean;
  message: string;
}

export interface TestCompanyAiConnectionResponse {
  testCompanyAiConnection: TestCompanyAiConnectionResult;
}

export interface TestCompanyAiConnectionVariables {
  companyId: string;
}

export const COMPANY_AI_LIVE_QUERY = gql`
  query CompanyAiLiveStatus($companyId: ID!) {
    saasCompany(where: { id: $companyId }) {
      id
      aiBillingMode
      aiApiKeyPreview
    }
    techAiCallLogs(
      where: {
        AND: [
          { company: { id: { equals: $companyId } } }
          { feature: { equals: "connection_test" } }
          { success: { equals: true } }
        ]
      }
      take: 1
    ) {
      id
    }
  }
`;

export interface CompanyAiLiveStatusResponse {
  saasCompany: {
    id: string;
    aiBillingMode: string | null;
    aiApiKeyPreview: string | null;
  } | null;
  techAiCallLogs: { id: string }[];
}

export interface CompanyAiLiveStatusVariables {
  companyId: string;
}

export const DAILY_DIGEST_QUERY = gql`
  query DailyDigest($companyId: ID!) {
    dailyDigest(companyId: $companyId) {
      success
      message
      cached
      creditsCharged
      insight {
        id
        referenceKey
        content
        generatedAt
        actions {
          title
          detail
        }
      }
    }
  }
`;

export interface DailyDigestAction {
  title: string;
  detail: string;
}

export interface DailyDigestInsight {
  id: string;
  referenceKey: string;
  content: string | null;
  generatedAt: string | null;
  actions: DailyDigestAction[];
}

export interface DailyDigestResult {
  success: boolean;
  message: string;
  cached: boolean;
  creditsCharged: number | null;
  insight: DailyDigestInsight | null;
}

export interface DailyDigestQueryResponse {
  dailyDigest: DailyDigestResult;
}

export interface DailyDigestQueryVariables {
  companyId: string;
}

export const GENERATE_DAILY_DIGEST_MUTATION = gql`
  mutation GenerateDailyDigest($companyId: ID!, $force: Boolean) {
    generateDailyDigest(companyId: $companyId, force: $force) {
      success
      message
      cached
      creditsCharged
      insight {
        id
        referenceKey
        content
        generatedAt
        actions {
          title
          detail
        }
      }
    }
  }
`;

export interface GenerateDailyDigestResponse {
  generateDailyDigest: DailyDigestResult;
}

export interface GenerateDailyDigestVariables {
  companyId: string;
  force?: boolean | null;
}
