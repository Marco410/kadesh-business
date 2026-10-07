/** Colores y nombres de marca en correos (alineados con kadesh-back/emailLayout). */
export const EMAIL_BRAND_PREVIEW = {
  pet: {
    id: "pet" as const,
    name: "Kadesh Pet",
    tagline: "El cuidado de tu mascota, en un solo lugar",
    color: "#216BFA",
    dark: "#1C5CD7",
    soft: "#EAF1FF",
  },
  saas: {
    id: "saas" as const,
    name: "Kadesh Negocios",
    tagline: "Gestiona tu negocio sin complicaciones",
    color: "#FF8C42",
    dark: "#E6732E",
    soft: "#FFF1E6",
  },
} as const;

export type EmailBrandId = keyof typeof EMAIL_BRAND_PREVIEW;

export const EMAIL_TEXT_PREVIEW = {
  heading: "#0f172a",
  body: "#475569",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  surface: "#f8fafc",
  page: "#eef0f4",
} as const;

/** Misma conversión que el backend: párrafos, **negrita** y [texto](url). */
export function formatEmailBodyPreview(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph.trim()).replace(/\n/g, "<br>");
      const withBold = escaped.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>",
      );
      const withLinks = withBold.replace(
        /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
        '<a href="$2" style="color:inherit;text-decoration:underline;">$1</a>',
      );
      return `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${EMAIL_TEXT_PREVIEW.body};">${withLinks}</p>`;
    })
    .join("");
}

export function formatCalloutPreview(raw: string): string {
  return escapeHtml(raw.trim())
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
