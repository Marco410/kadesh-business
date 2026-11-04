import { gql } from "@apollo/client";

/** Dispositivos, IPs y cuentas que comparten IP con una persona (`adminPersonDevices`). */
export const ADMIN_PERSON_DEVICES_QUERY = gql`
  query AdminPersonDevices($userId: ID!, $days: Int) {
    adminPersonDevices(userId: $userId, days: $days) {
      devices {
        ip
        userAgent
        count
        firstSeen
        lastSeen
        sources
      }
      sharedIps {
        ip
        accounts
        crowded
      }
      sharedAccounts {
        person {
          id
          name
          lastName
          email
        }
        company {
          id
          name
        }
        ips
        count
        lastSeen
      }
    }
  }
`;

export type AdminPersonDevice = {
  ip: string | null;
  userAgent: string | null;
  count: number;
  firstSeen: string;
  lastSeen: string;
  /** actividad | accesos */
  sources: string[];
};

export type AdminPersonDevicesResponse = {
  adminPersonDevices: {
    devices: AdminPersonDevice[];
    sharedIps: Array<{ ip: string; accounts: number; crowded: boolean }>;
    sharedAccounts: Array<{
      person: { id: string; name: string; lastName: string | null; email: string | null };
      company: { id: string; name: string } | null;
      ips: string[];
      count: number;
      lastSeen: string;
    }>;
  };
};
