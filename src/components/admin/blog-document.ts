export type BlogText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
};

export type BlogElement = {
  type: string;
  level?: number;
  href?: string;
  children: BlogNode[];
};

export type BlogNode = BlogElement | BlogText;

export type BlogDocument = BlogElement[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function ensureNode(value: unknown): BlogNode | null {
  if (!isRecord(value)) return null;
  if (typeof value.text === "string" && value.type == null) {
    return value as BlogText;
  }
  const type = typeof value.type === "string" ? value.type : "paragraph";
  const rawChildren = Array.isArray(value.children) ? value.children : [];
  const children = rawChildren
    .map(ensureNode)
    .filter((node): node is BlogNode => node != null);
  if (children.length === 0) children.push({ text: "" });
  return { ...value, type, children } as BlogElement;
}

/** Documento vacío que el editor puede mutar. */
export function emptyBlogDocument(): BlogDocument {
  return [{ type: "paragraph", children: [{ text: "" }] }];
}

/** Asegura un documento que el editor puede abrir, aunque venga vacío o a medias. */
export function normalizeBlogDocument(value: unknown): BlogDocument {
  const source = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(source)) return emptyBlogDocument();
  const blocks = source
    .map(ensureNode)
    .filter((node): node is BlogElement => node != null && "type" in node);
  return blocks.length > 0 ? blocks : emptyBlogDocument();
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
