import { gql } from "@apollo/client";

/** Bandeja de Errores (`adminErrorIssues` en kadesh-back). */
export const ADMIN_ERROR_ISSUES_QUERY = gql`
  query AdminErrorIssues($input: AdminErrorIssuesInput) {
    adminErrorIssues(input: $input) {
      openCount
      items {
        fingerprint
        type
        title
        message
        operation
        kind
        opType
        code
        app
        apps
        page
        count
        people
        anonymous
        firstSeen
        lastSeen
        status
        reopened
        note
        resolvedAt
        resolvedBy {
          id
          name
          lastName
          email
        }
        userAgents {
          key
          count
        }
      }
    }
  }
`;

export const ADMIN_SET_ERROR_ISSUE_STATUS_MUTATION = gql`
  mutation AdminSetErrorIssueStatus($fingerprint: ID!, $status: String!, $note: String) {
    adminSetErrorIssueStatus(fingerprint: $fingerprint, status: $status, note: $note) {
      success
      message
    }
  }
`;

export type ErrorIssueStatus = "open" | "resolved" | "ignored";

export type AdminErrorIssue = {
  fingerprint: string;
  /** app.error (servidor) | app.client_error (navegador) */
  type: string;
  title: string;
  message: string | null;
  operation: string | null;
  /** network | crash | script | chunk */
  kind: string | null;
  /** query | mutation */
  opType: string | null;
  code: string | null;
  app: string | null;
  apps: string[];
  page: string | null;
  count: number;
  people: number;
  anonymous: number;
  firstSeen: string;
  lastSeen: string;
  status: ErrorIssueStatus;
  reopened: boolean;
  note: string | null;
  resolvedAt: string | null;
  resolvedBy: { id: string; name: string; lastName: string | null; email: string | null } | null;
  userAgents: Array<{ key: string; count: number }>;
};

export type AdminErrorIssuesResponse = {
  adminErrorIssues: { openCount: number; items: AdminErrorIssue[] };
};

export type AdminErrorIssuesInput = {
  app?: string | null;
  status?: ErrorIssueStatus | "all";
  days?: number;
  search?: string | null;
  take?: number;
};

/** Filtros de la URL (`&estado=`, `&rango=`). */
export const ERROR_STATUS_FILTERS = [
  { value: "abiertos", label: "Abiertos", api: "open" },
  { value: "resueltos", label: "Resueltos", api: "resolved" },
  { value: "ignorados", label: "Ignorados", api: "ignored" },
  { value: "todos", label: "Todos", api: "all" },
] as const;

export type ErrorStatusSlug = (typeof ERROR_STATUS_FILTERS)[number]["value"];

export const ERROR_RANGE_FILTERS = [
  { value: "24h", label: "24 h", days: 1 },
  { value: "7d", label: "7 días", days: 7 },
  { value: "30d", label: "30 días", days: 30 },
  { value: "90d", label: "90 días", days: 90 },
] as const;

export type ErrorRangeSlug = (typeof ERROR_RANGE_FILTERS)[number]["value"];

export function parseErrorStatus(value: string | null): ErrorStatusSlug {
  return ERROR_STATUS_FILTERS.find((item) => item.value === value)?.value ?? "abiertos";
}

export function parseErrorRange(value: string | null): ErrorRangeSlug {
  return ERROR_RANGE_FILTERS.find((item) => item.value === value)?.value ?? "7d";
}

export const ERROR_KIND_LABELS: Record<string, string> = {
  network: "Conexión",
  crash: "Pantalla caída",
  script: "Error de código",
  chunk: "No cargó la pantalla",
  // Hidratación en una página que tradujo el navegador: no es falla de Kadesh.
  warning: "Aviso (baja prioridad)",
};

export const ERROR_ISSUE_STATUS_LABELS: Record<ErrorIssueStatus, string> = {
  open: "Abierto",
  resolved: "Resuelto",
  ignored: "Ignorado",
};

/** De dónde viene: servidor (GraphQL) o navegador. */
export function errorOriginLabel(issue: Pick<AdminErrorIssue, "type" | "kind">): string {
  if (issue.type === "app.client_error") return ERROR_KIND_LABELS[issue.kind ?? ""] ?? "Navegador";
  return "Servidor";
}
