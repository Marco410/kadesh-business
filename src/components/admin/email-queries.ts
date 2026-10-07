import { gql } from "@apollo/client";

export type AdminEmailAudience = "saas" | "pet" | "all" | "custom";
export type AdminEmailBrand = "saas" | "pet";

export type SendAdminBroadcastEmailInput = {
  audience: AdminEmailAudience;
  brand: AdminEmailBrand;
  emails?: string[] | null;
  subject: string;
  title: string;
  eyebrow?: string | null;
  preheader?: string | null;
  body: string;
  callout?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  footerNote?: string | null;
  dryRun?: boolean | null;
};

export type SendAdminBroadcastEmailResult = {
  success: boolean;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  dryRun: boolean;
  brand: string;
  audience: string;
};

export const SEND_ADMIN_BROADCAST_EMAIL_MUTATION = gql`
  mutation SendAdminBroadcastEmail($input: SendAdminBroadcastEmailInput!) {
    sendAdminBroadcastEmail(input: $input) {
      success
      message
      recipientCount
      sentCount
      failedCount
      dryRun
      brand
      audience
    }
  }
`;

export type SendAdminBroadcastEmailResponse = {
  sendAdminBroadcastEmail: SendAdminBroadcastEmailResult;
};
