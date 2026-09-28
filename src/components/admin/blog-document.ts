type DocNode = {
  type?: string;
  text?: string;
  bold?: true;
  italic?: true;
  href?: string;
  level?: number;
  children?: DocNode[];
};

export type BlogDocument = DocNode[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseInlines(input: string): DocNode[] {
  const nodes: DocNode[] = [];
  const pattern =
    /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(input);

  while (match) {
    if (match.index > last) {
      nodes.push({ text: input.slice(last, match.index) });
    }
    if (match[1] != null) nodes.push({ text: match[1], bold: true });
    else if (match[2] != null) nodes.push({ text: match[2], italic: true });
    else if (match[3] != null && match[4] != null) {
      nodes.push({
        type: "link",
        href: match[4],
        children: [{ text: match[3] }],
      });
    }
    last = match.index + match[0].length;
    match = pattern.exec(input);
  }

  if (last < input.length) nodes.push({ text: input.slice(last) });

  const filled = nodes.filter(
    (node) => node.type === "link" || (node.text ?? "").length > 0,
  );
  return filled.length > 0 ? filled : [{ text: "" }];
}

function inlinesToText(children: unknown): string {
  if (!Array.isArray(children)) return "";
  return children
    .map((node) => {
      if (!isRecord(node)) return "";
      if (typeof node.text === "string") {
        if (node.bold === true) return `**${node.text}**`;
        if (node.italic === true) return `*${node.text}*`;
        return node.text;
      }
      if (node.type === "link" && typeof node.href === "string") {
        const label = inlinesToText(node.children);
        return `[${label}](${node.href})`;
      }
      if (Array.isArray(node.children)) return inlinesToText(node.children);
      return "";
    })
    .join("");
}

function asBlocks(value: unknown): DocNode[] {
  if (Array.isArray(value)) return value.filter(isRecord) as DocNode[];
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed.filter(isRecord) as DocNode[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Texto editable a partir del cuerpo guardado. Si no se toca, se vuelve a guardar el original. */
export function documentToText(value: unknown): string {
  const parts: string[] = [];

  for (const block of asBlocks(value)) {
    if (block.type === "paragraph") {
      parts.push(inlinesToText(block.children));
      continue;
    }
    if (block.type === "heading") {
      const level = Math.min(6, Math.max(1, block.level ?? 2));
      parts.push(`${"#".repeat(level)} ${inlinesToText(block.children)}`.trimEnd());
      continue;
    }
    if (block.type === "divider") {
      parts.push("---");
      continue;
    }
    if (block.type === "blockquote") {
      const lines = (block.children ?? [])
        .map((child) => inlinesToText(isRecord(child) ? child.children : []))
        .filter((line) => line.length > 0);
      if (lines.length > 0) parts.push(lines.map((line) => `> ${line}`).join("\n"));
      continue;
    }
    if (block.type === "unordered-list" || block.type === "ordered-list") {
      const items = (block.children ?? []).flatMap((item, index) => {
        if (!isRecord(item) || item.type !== "list-item") return [];
        const content = Array.isArray(item.children)
          ? item.children.find(
              (child) => isRecord(child) && child.type === "list-item-content",
            )
          : undefined;
        const text = inlinesToText(isRecord(content) ? content.children : []);
        return [block.type === "unordered-list" ? `- ${text}` : `${index + 1}. ${text}`];
      });
      if (items.length > 0) parts.push(items.join("\n"));
      continue;
    }
    const fallback = inlinesToText(block.children);
    if (fallback.trim()) parts.push(fallback);
  }

  return parts.join("\n\n").trim();
}

function isSpecialLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length === 0 ||
    /^(-{3,}|\*{3,})$/.test(trimmed) ||
    /^#{1,6}\s+/.test(trimmed) ||
    trimmed.startsWith(">") ||
    /^[-*]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed)
  );
}

/** Cuerpo del artículo: párrafos, títulos, listas, negrita, cursiva y enlaces. */
export function textToDocument(source: string): BlogDocument {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlogDocument = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider", children: [{ text: "" }] });
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        children: parseInlines(heading[2]),
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({
        type: "blockquote",
        children: [
          { type: "paragraph", children: parseInlines(quote.join("\n")) },
        ],
      });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: DocNode[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push({
          type: "list-item",
          children: [
            {
              type: "list-item-content",
              children: parseInlines(lines[index].trim().replace(/^[-*]\s+/, "")),
            },
          ],
        });
        index += 1;
      }
      blocks.push({ type: "unordered-list", children: items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: DocNode[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push({
          type: "list-item",
          children: [
            {
              type: "list-item-content",
              children: parseInlines(lines[index].trim().replace(/^\d+\.\s+/, "")),
            },
          ],
        });
        index += 1;
      }
      blocks.push({ type: "ordered-list", children: items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && !isSpecialLine(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const text = paragraph.join("\n");
    if (text.trim()) {
      blocks.push({ type: "paragraph", children: parseInlines(text) });
    }
  }

  if (blocks.length === 0) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }
  return blocks;
}
