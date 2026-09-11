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
