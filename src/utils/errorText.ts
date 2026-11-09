/**
 * Mensajes de error para la persona (clientes del SaaS y operadores): nunca el texto crudo de
 * GraphQL, Keystone, Prisma o del navegador.
 *
 * Keystone junta las validaciones así:
 *   "You provided invalid data for this operation.\n  - RescueOrganization.name: value must not be empty\n  - RescueOrganization: El nombre debe tener al menos 3 letras."
 * De cada viñeta se quita la etiqueta («Lista.campo:»); se prefieren los mensajes en español que
 * escribe el backend, los de Keystone en inglés se traducen a uno genérico y lo técnico se descarta.
 */

const UNIQUE_MESSAGE = "Ya existe un registro con ese dato. Usa otro.";

/** Mensajes conocidos (Keystone, Apollo, red) → español. */
const KNOWN_MESSAGES: Array<[RegExp, string]> = [
  [/unique constraint|already exists/i, UNIQUE_MESSAGE],
  [/must not be empty|is required|must be provided/i, "Falta un dato obligatorio."],
  [/is not an accepted option|non-unique set of options/i, "Una de las opciones elegidas ya no existe. Revisa tu selección y vuelve a guardar."],
  [/must be no longer than (\d+)/i, "Uno de los textos es demasiado largo."],
  [/must be at least (\d+) characters/i, "Uno de los textos es demasiado corto."],
  [/must be (an integer|a whole number|a number|a valid finite number|a positive integer)/i, "Revisa los números: uno no es válido."],
  [/must be (greater|less) than or equal to/i, "Uno de los números está fuera de rango."],
  [/access denied|you do not have access|you cannot (create|update|delete|query)|not authori[sz]ed|forbidden|unauthenticated/i, "No tienes permiso para hacer esto. Si crees que es un error, vuelve a iniciar sesión."],
  [/too many requests|rate limit|demasiad[oa]s (intentos|solicitudes)/i, "Demasiados intentos seguidos. Espera un momento y vuelve a intentarlo."],
  [/failed to fetch|network ?error|load failed|networkerror|fetch failed|err_connection/i, "No hay conexión con el servidor. Revisa tu internet y vuelve a intentarlo."],
  [/timeout|timed out/i, "El servidor tardó demasiado en responder. Vuelve a intentarlo."],
];

/**
 * Texto técnico o en inglés que no le sirve a la persona. Para el inglés se buscan palabras que no
 * existen en español («is», «not», «an», «of», «the»…): así se cuela menos que con una lista de frases.
 */
const TECHNICAL =
  /prisma|graphql|keystone|apollo|variable "\$|cannot query field|field "|argument "|unexpected|internal server|is not a function|cannot read prop|undefined|null value|\b(the|is|are|was|were|not|an|of|to|for|with|from|this|that|must|value|cannot|invalid|should|unable|failed|found|expected|accepted|option|allowed|provided|required|please|error occurred)\b/i;

/** Un mensaje se muestra solo si parece español (acentos o palabras comunes); el resto cae al genérico. */
const SPANISH = /[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|no|un|una|es|en|por|para|con|se|tu|su|sus|ya|al|lo|le|y|hay|debe|puedes)\b/i;

function collectMessages(err: unknown): string[] {
  if (!err) return [];
  if (typeof err === "string") return [err];
  if (typeof err !== "object") return [String(err)];
  const withGql = err as {
    graphQLErrors?: ReadonlyArray<{ message?: string }>;
    networkError?: { message?: string } | null;
    message?: string;
  };
  const gql = (withGql.graphQLErrors ?? []).map((item) => item.message ?? "").filter(Boolean);
  if (gql.length) return gql;
  return [withGql.networkError?.message, withGql.message].filter((text): text is string => Boolean(text));
}

/** Cada viñeta de Keystone sin su etiqueta («RescueOrganization.name: …» → «…»). */
function splitLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !/^(you provided invalid data for this operation|an error occurred while resolving input fields)\.?$/i.test(line),
    )
    .map((line) => (/^-\s/.test(line) ? line.replace(/^-\s*[\w.]+:\s*/, "") : line))
    .map((line) => line.replace(/^(error|graphql error|apolloerror):\s*/i, "").trim())
    .filter(Boolean);
}

/**
 * Mensaje legible de un error de mutación, query o `fetch`. Prefiere los mensajes en español del
 * backend («El nombre debe tener al menos 3 letras.»); si solo hay de Keystone, uno genérico en
 * español; si nada sirve, `fallback`. Úsalo en todo toast, alerta o estado de error.
 */
export function friendlyErrorText(err: unknown, fallback: string): string {
  const lines = collectMessages(err).flatMap(splitLines);
  const specific: string[] = [];
  const generic: string[] = [];

  for (const line of lines) {
    const known = KNOWN_MESSAGES.find(([pattern]) => pattern.test(line));
    if (known) generic.push(known[1]);
    else if (SPANISH.test(line) && !TECHNICAL.test(line)) specific.push(line);
  }

  const unique = (list: string[]) => [...new Set(list)];
  const picked = specific.length ? unique(specific) : unique(generic).slice(0, 1);
  const text = picked.join(" ").trim();
  return text ? text.slice(0, 280) : fallback;
}
