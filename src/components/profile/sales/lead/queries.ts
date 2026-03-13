import { gql } from "@apollo/client";

export const ADD_OWN_LEAD_MUTATION = gql`
  mutation AddOwnLead($input: AddOwnLeadInput!) {
    addOwnLead(input: $input) {
      success
      message
      leadId
    }
  }
`;

export interface AddOwnLeadInput {
  businessName: string;
  category?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  websiteUrl?: string;
  instagram?: string;
  facebook?: string;
  xTwitter?: string;
  tiktok?: string;
  lat?: number;
  lng?: number;
  source?: string;
  notes?: string;
  opportunityLevel?: string;
  topReview1?: string;
  topReview2?: string;
  topReview3?: string;
  topReview4?: string;
  topReview5?: string;
}

export interface AddOwnLeadVariables {
  input: AddOwnLeadInput;
}

export interface AddOwnLeadResult {
  addOwnLead: {
    success: boolean;
    message: string;
    leadId: string | null;
  };
}
