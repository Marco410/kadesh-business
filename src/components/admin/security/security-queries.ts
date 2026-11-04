import { gql } from "@apollo/client";

/** Operaciones → Seguridad (`adminSecuritySummary`, `adminBlockedIps` en kadesh-back). */
export const ADMIN_SECURITY_QUERY = gql`
  query AdminSecurity($days: Int) {
    adminSecuritySummary(days: $days) {
      blockedCount
      rateLimited {
        ip
        rule
        ruleLabel
        count
        lastAt
        blocked
        actor {
          id
          name
          lastName
          email
        }
      }
      signupIps {
        ip
        accounts
        lastAt
        blocked
      }
    }
    adminBlockedIps {
      id
      ip
      reason
      expiresAt
      createdAt
      active
      createdBy {
        id
        name
        lastName
      }
    }
  }
`;

export const ADMIN_BLOCK_IP_MUTATION = gql`
  mutation AdminBlockIp($ip: String!, $reason: String, $days: Int, $force: Boolean) {
    adminBlockIp(ip: $ip, reason: $reason, days: $days, force: $force) {
      success
      message
      needsConfirmation
    }
  }
`;

export const ADMIN_UNBLOCK_IP_MUTATION = gql`
  mutation AdminUnblockIp($ip: String!) {
    adminUnblockIp(ip: $ip) {
      success
      message
    }
  }
`;

type PersonRef = { id: string; name: string; lastName: string | null; email?: string | null };

export type AdminRateLimitHit = {
  ip: string | null;
  rule: string;
  ruleLabel: string;
  count: number;
  lastAt: string;
  blocked: boolean;
  actor: PersonRef | null;
};

export type AdminSignupIp = { ip: string; accounts: number; lastAt: string; blocked: boolean };

export type AdminBlockedIp = {
  id: string;
  ip: string;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
  active: boolean;
  createdBy: PersonRef | null;
};

export type AdminSecurityResponse = {
  adminSecuritySummary: {
    blockedCount: number;
    rateLimited: AdminRateLimitHit[];
    signupIps: AdminSignupIp[];
  };
  adminBlockedIps: AdminBlockedIp[];
};

export type AdminBlockIpResult = {
  adminBlockIp: { success: boolean; message: string; needsConfirmation: boolean };
};

export type AdminUnblockIpResult = { adminUnblockIp: { success: boolean; message: string } };

/** Duración del bloqueo (`days`; vacío = indefinido). */
export const BLOCK_DURATIONS = [
  { value: "1", label: "1 día" },
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "", label: "Indefinido" },
] as const;

export const SECURITY_RANGES = [
  { value: "24h", label: "24 h", days: 1 },
  { value: "7d", label: "7 días", days: 7 },
  { value: "30d", label: "30 días", days: 30 },
] as const;

export type SecurityRangeSlug = (typeof SECURITY_RANGES)[number]["value"];

export function parseSecurityRange(value: string | null): SecurityRangeSlug {
  return SECURITY_RANGES.find((range) => range.value === value)?.value ?? "7d";
}
