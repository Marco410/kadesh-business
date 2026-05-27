/**
 * Formats a release date for the changelog (calendar date, es-MX).
 */
export function formatReleaseDate(releasedAt: string): string {
  const iso = releasedAt.includes("T")
    ? releasedAt
    : `${releasedAt.slice(0, 10)}T12:00:00`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
