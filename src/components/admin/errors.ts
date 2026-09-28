/** Mensaje de una mutación, sin filtrar detalles internos al operador. */
export function adminErrorText(err: unknown, fallback: string): string {
  const raw = collectErrorText(err);
  if (!raw) return fallback;
  if (/unique constraint|already exists/i.test(raw)) {
    return "Ese nombre ya está en uso.";
  }

  const cleaned = raw
    .replace(/You provided invalid data for this operation\.\s*/gi, "")
    .replace(/^[\s-]+/gm, "")
    .trim();

  if (!cleaned || /prisma|graphql|keystone/i.test(cleaned)) return fallback;
  return cleaned.slice(0, 280);
}

function collectErrorText(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) {
    const withGql = err as Error & {
      graphQLErrors?: ReadonlyArray<{ message?: string }>;
    };
    const gql =
      withGql.graphQLErrors?.map((item) => item.message ?? "").join(" ") ?? "";
    return [gql, err.message].filter(Boolean).join(" ");
  }
  return String(err);
}
