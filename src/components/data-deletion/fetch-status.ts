export const DATA_DELETION_CONTACT_EMAIL = "contacto@kadesh.com.mx";

export type DataDeletionStatus = "pending" | "completed" | "failed";

export type DataDeletionRecord = {
  code: string;
  status: DataDeletionStatus;
  requestedAt: string | null;
  completedAt: string | null;
};

export type DataDeletionLookup =
  | { kind: "ok"; record: DataDeletionRecord }
  | { kind: "not_found" }
  | { kind: "error" };

const STATUS_PATH = "/webhooks/meta/data-deletion/status";
const STATUSES = new Set<DataDeletionStatus>(["pending", "completed", "failed"]);

/** Origen del backend a partir de `NEXT_PUBLIC_API_URL` (el endpoint GraphQL). */
function getBackendOrigin(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function parseRecord(value: unknown): DataDeletionRecord | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  if (typeof row.code !== "string" || !row.code.trim()) return null;
  if (typeof row.status !== "string" || !STATUSES.has(row.status as DataDeletionStatus)) {
    return null;
  }

  const requestedAt = optionalIso(row.requestedAt);
  const completedAt = optionalIso(row.completedAt);
  if (requestedAt === undefined || completedAt === undefined) return null;

  return {
    code: row.code,
    status: row.status as DataDeletionStatus,
    requestedAt,
    completedAt,
  };
}

function optionalIso(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === "string") return value;
  return undefined;
}

/**
 * Consulta el estado de una solicitud de eliminación de datos.
 * El fetch corre en el servidor para no depender de CORS del backend.
 */
export async function fetchDataDeletionStatus(code: string): Promise<DataDeletionLookup> {
  const origin = getBackendOrigin();
  if (!origin) return { kind: "error" };

  const url = new URL(STATUS_PATH, origin);
  url.searchParams.set("code", code);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status === 404) return { kind: "not_found" };
    if (!response.ok) return { kind: "error" };

    const record = parseRecord(await response.json());
    if (!record) return { kind: "error" };
    return { kind: "ok", record };
  } catch {
    return { kind: "error" };
  }
}
