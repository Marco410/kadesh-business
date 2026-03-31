const PUBLIC_SLUG_DELIMITER = "--";

function toBase64UrlUtf8(input: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(input, "utf8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64UrlUtf8(input: string): string | null {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const b64 = `${normalized}${pad}`;
  try {
    if (typeof window === "undefined") {
      return Buffer.from(b64, "base64").toString("utf8");
    }
    return decodeURIComponent(escape(window.atob(b64)));
  } catch {
    return null;
  }
}

function slugifyQuotationNumber(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "cotizacion";
}

export function buildPublicQuotationSlug(
  quotationNumber: string,
  quotationId: string,
): string {
  return `${slugifyQuotationNumber(quotationNumber)}${PUBLIC_SLUG_DELIMITER}${toBase64UrlUtf8(quotationId)}`;
}

export function extractQuotationIdFromPublicSlug(slug: string): string | null {
  const i = slug.lastIndexOf(PUBLIC_SLUG_DELIMITER);
  if (i < 0) return null;
  const token = slug.slice(i + PUBLIC_SLUG_DELIMITER.length).trim();
  if (!token) return null;
  const decoded = fromBase64UrlUtf8(token);
  if (!decoded) return null;
  const t = decoded.trim();
  return t.length >= 10 ? t : null;
}
