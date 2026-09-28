"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowExpand01Icon,
  CodeIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  MinusSignIcon,
  QuoteDownIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import {
  Editor,
  Element,
  Node,
  Path,
  Range,
  Text,
  Transforms,
  createEditor,
  type Descendant,
} from "slate";
import { withHistory, type HistoryEditor } from "slate-history";
import {
  Editable,
  ReactEditor,
  Slate,
  useSlate,
  withReact,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-react";
import type { BaseEditor } from "slate";
import type { BlogDocument, BlogElement, BlogText } from "./blog-document";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: BlogElement;
    Text: BlogText;
  }
}

type Mark =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "superscript"
  | "subscript";

type BlockChoice = "paragraph" | "h1" | "h2" | "h3" | "h4";

const BLOCKS: Array<{ id: BlockChoice; label: string }> = [
  { id: "paragraph", label: "Texto" },
  { id: "h1", label: "Título 1" },
  { id: "h2", label: "Título 2" },
  { id: "h3", label: "Título 3" },
  { id: "h4", label: "Título 4" },
];

const INLINE_TYPES = new Set([
  "paragraph",
  "heading",
  "code",
  "divider",
  "list-item-content",
]);

const LIST_TYPES = new Set(["ordered-list", "unordered-list"]);

type SchemaInfo =
  | { kind: "inlines"; invalid: "unwrap" | "move" }
  | { kind: "blocks"; allowed: Set<string>; wrap: string; invalid: "unwrap" | "move" };

const SCHEMA: Record<string, SchemaInfo> = {
  editor: {
    kind: "blocks",
    allowed: new Set([
      "paragraph",
      "heading",
      "blockquote",
      "code",
      "divider",
      "ordered-list",
      "unordered-list",
    ]),
    wrap: "paragraph",
    invalid: "move",
  },
  blockquote: {
    kind: "blocks",
    allowed: new Set([
      "paragraph",
      "heading",
      "code",
      "divider",
      "ordered-list",
      "unordered-list",
    ]),
    wrap: "paragraph",
    invalid: "move",
  },
  paragraph: { kind: "inlines", invalid: "unwrap" },
  heading: { kind: "inlines", invalid: "unwrap" },
  code: { kind: "inlines", invalid: "move" },
  divider: { kind: "inlines", invalid: "move" },
  "ordered-list": {
    kind: "blocks",
    allowed: new Set(["list-item"]),
    wrap: "list-item",
    invalid: "move",
  },
  "unordered-list": {
    kind: "blocks",
    allowed: new Set(["list-item"]),
    wrap: "list-item",
    invalid: "move",
  },
  "list-item": {
    kind: "blocks",
    allowed: new Set(["list-item-content", "ordered-list", "unordered-list"]),
    wrap: "list-item-content",
    invalid: "unwrap",
  },
  "list-item-content": { kind: "inlines", invalid: "unwrap" },
};

function createBlogEditor() {
  return withShortcuts(withSchema(withLists(withHistory(withReact(createEditor())))));
}

function withSchema(editor: Editor) {
  const { normalizeNode, isInline, isVoid } = editor;
  editor.isInline = (element) => element.type === "link" || isInline(element);
  editor.isVoid = (element) => element.type === "divider" || isVoid(element);

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    if (Text.isText(node) || (Element.isElement(node) && node.type === "link")) {
      normalizeNode(entry);
      return;
    }

    const nodeType = Editor.isEditor(node) ? "editor" : node.type;
    const info = SCHEMA[nodeType];
    if (!info) {
      Transforms.unwrapNodes(editor, { at: path });
      return;
    }

    if (
      info.kind === "blocks" &&
      node.children.length > 0 &&
      node.children.every((child) => !(Element.isElement(child) && Editor.isBlock(editor, child)))
    ) {
      Transforms.wrapNodes(
        editor,
        { type: info.wrap, children: [] },
        {
          at: path,
          match: (child) => !(Element.isElement(child) && Editor.isBlock(editor, child)),
        },
      );
      return;
    }

    if (Element.isElement(node) || Editor.isEditor(node)) {
      for (const [index, child] of node.children.entries()) {
        const childPath = [...path, index];
        if (info.kind === "inlines") {
          if (
            !Text.isText(child) &&
            !(Element.isElement(child) && Editor.isInline(editor, child))
          ) {
            fixInvalid(editor, childPath);
            return;
          }
        } else if (Element.isElement(child) && Editor.isBlock(editor, child)) {
          if (!info.allowed.has(child.type)) {
            fixInvalid(editor, childPath);
            return;
          }
        } else {
          Transforms.wrapNodes(
            editor,
            { type: info.wrap, children: [] },
            { at: childPath },
          );
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
}

function fixInvalid(editor: Editor, path: Path) {
  const node = Node.get(editor, path);
  if (!Element.isElement(node)) {
    Transforms.unwrapNodes(editor, { at: path });
    return;
  }
  const parentPath = Path.parent(path);
  const parent = Node.get(editor, parentPath);
  const parentType = Editor.isEditor(parent)
    ? "editor"
    : Element.isElement(parent)
      ? parent.type
      : "editor";
  const parentInfo = SCHEMA[parentType];
  const childInfo = SCHEMA[node.type];

  if (
    parentInfo?.kind === "blocks" &&
    (!childInfo || childInfo.invalid === "unwrap")
  ) {
    const props: Partial<BlogElement> = { type: parentInfo.wrap };
    Transforms.setNodes(editor, props, { at: path });
    if (node.level != null && parentInfo.wrap !== "heading") {
      Transforms.unsetNodes(editor, "level", { at: path });
    }
    if (node.href && parentInfo.wrap !== "link") {
      Transforms.unsetNodes(editor, "href", { at: path });
    }
    return;
  }

  Transforms.unwrapNodes(editor, { at: path });
}

function withLists(editor: Editor) {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const [listItem] = Editor.nodes(editor, {
      match: (node) => Element.isElement(node) && node.type === "list-item",
      mode: "lowest",
    });
    if (listItem && Node.string(listItem[0]) === "") {
      Transforms.unwrapNodes(editor, {
        match: (node) => Element.isElement(node) && LIST_TYPES.has(node.type),
        split: true,
      });
      return;
    }
    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const list = Editor.above(editor, {
        match: (node) => Element.isElement(node) && LIST_TYPES.has(node.type),
      });
      if (list && Editor.isStart(editor, editor.selection.anchor, list[1])) {
        Transforms.unwrapNodes(editor, {
          match: (node) => Element.isElement(node) && LIST_TYPES.has(node.type),
          split: true,
        });
        return;
      }
    }
    deleteBackward(unit);
  };

  return editor;
}

function withShortcuts(editor: Editor) {
  const { insertText } = editor;
  editor.insertText = (text) => {
    insertText(text);
    if (text !== " " && text !== "-") return;
    if (!editor.selection || !Range.isCollapsed(editor.selection)) return;
    const block = Editor.above(editor, {
      match: (node) =>
        Element.isElement(node) &&
        Editor.isBlock(editor, node) &&
        (node.type === "paragraph" || node.type === "heading"),
    });
    if (!block) return;
    const [node, path] = block;
    const value = Node.string(node);
    if (text === "-" && value === "---") {
      Transforms.removeNodes(editor, { at: path });
      Transforms.insertNodes(
        editor,
        [
          { type: "divider", children: [{ text: "" }] },
          { type: "paragraph", children: [{ text: "" }] },
        ],
        { at: path },
      );
      return;
    }
    if (text !== " ") return;
    const shortcut = value.trimEnd();
    const apply =
      shortcut === "#"
        ? () => setBlock(editor, "h1")
        : shortcut === "##"
          ? () => setBlock(editor, "h2")
          : shortcut === "###"
            ? () => setBlock(editor, "h3")
            : shortcut === "####"
              ? () => setBlock(editor, "h4")
              : shortcut === ">"
                ? () => toggleQuote(editor)
                : shortcut === "-" || shortcut === "*"
                  ? () => toggleList(editor, "unordered-list")
                  : shortcut === "1."
                    ? () => toggleList(editor, "ordered-list")
                    : null;
    if (!apply) return;
    clearBlock(editor, path);
    apply();
  };
  return editor;
}

function clearBlock(editor: Editor, path: Path) {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, path),
      focus: Editor.end(editor, path),
    },
  });
}

function isMarkActive(editor: Editor, mark: Mark) {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

function toggleMark(editor: Editor, mark: Mark) {
  if (isMarkActive(editor, mark)) Editor.removeMark(editor, mark);
  else Editor.addMark(editor, mark, true);
}

function isTypeActive(editor: Editor, type: string) {
  const [match] = Editor.nodes(editor, {
    match: (node) => Element.isElement(node) && node.type === type,
  });
  return Boolean(match);
}

function currentBlock(editor: Editor): BlockChoice {
  const [match] = Editor.nodes(editor, {
    match: (node) =>
      Element.isElement(node) &&
      (node.type === "paragraph" || node.type === "heading"),
  });
  if (!match || !Element.isElement(match[0])) return "paragraph";
  if (match[0].type === "heading") {
    const level = match[0].level ?? 2;
    if (level === 1 || level === 2 || level === 3 || level === 4) {
      return `h${level}`;
    }
  }
  return "paragraph";
}

function setBlock(editor: Editor, choice: BlockChoice) {
  Transforms.unwrapNodes(editor, {
    match: (node) => Element.isElement(node) && node.type === "blockquote",
    split: true,
  });
  if (choice === "paragraph") {
    Transforms.setNodes(
      editor,
      { type: "paragraph" },
      {
        match: (node) =>
          Element.isElement(node) && INLINE_TYPES.has(node.type) && Editor.isBlock(editor, node),
      },
    );
    Transforms.unsetNodes(editor, "level", {
      match: (node) => Element.isElement(node) && node.type === "paragraph",
    });
    return;
  }
  const level = Number(choice.slice(1));
  Transforms.setNodes(
    editor,
    { type: "heading", level },
    {
      match: (node) =>
        Element.isElement(node) && INLINE_TYPES.has(node.type) && Editor.isBlock(editor, node),
    },
  );
}

function toggleQuote(editor: Editor) {
  const active = isTypeActive(editor, "blockquote");
  if (active) {
    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && node.type === "blockquote",
    });
    return;
  }
  Transforms.wrapNodes(
    editor,
    { type: "blockquote", children: [] },
    {
      match: (node) =>
        Element.isElement(node) &&
        Editor.isBlock(editor, node) &&
        node.type !== "blockquote",
    },
  );
}

function toggleCodeBlock(editor: Editor) {
  const active = isTypeActive(editor, "code");
  Transforms.setNodes(
    editor,
    { type: active ? "paragraph" : "code" },
    {
      match: (node) =>
        Element.isElement(node) &&
        (node.type === "paragraph" || node.type === "code" || node.type === "heading"),
    },
  );
  if (!active) {
    Transforms.unsetNodes(editor, "level", {
      match: (node) => Element.isElement(node) && node.type === "code",
    });
  }
}

function toggleList(editor: Editor, format: "ordered-list" | "unordered-list") {
  const active = isTypeActive(editor, format);
  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && LIST_TYPES.has(node.type),
      split: true,
      mode: active ? "all" : "lowest",
    });
    if (!active) {
      Transforms.wrapNodes(
        editor,
        { type: format, children: [] },
        {
          match: (node) =>
            Element.isElement(node) &&
            Editor.isBlock(editor, node) &&
            node.type !== "list-item-content",
        },
      );
    }
  });
}

function insertDivider(editor: Editor) {
  Transforms.insertNodes(editor, { type: "divider", children: [{ text: "" }] });
  Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] });
}

function safeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^\s*javascript:/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}

function applyLink(editor: Editor, href: string) {
  const url = safeHref(href);
  if (!url) return;
  const [existing] = Editor.nodes(editor, {
    match: (node) => Element.isElement(node) && node.type === "link",
  });
  if (existing) {
    Transforms.setNodes(editor, { href: url }, { at: existing[1] });
    return;
  }
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    Transforms.insertNodes(editor, {
      type: "link",
      href: url,
      children: [{ text: url }],
    });
    return;
  }
  Transforms.wrapNodes(editor, { type: "link", href: url, children: [] }, { split: true });
}

function removeLink(editor: Editor) {
  Transforms.unwrapNodes(editor, {
    match: (node) => Element.isElement(node) && node.type === "link",
  });
}

export default function AdminBlogEditor({
  value,
  onChange,
}: {
  value: BlogDocument;
  onChange: (value: BlogDocument) => void;
}) {
  const editor = useMemo(() => createBlogEditor(), []);
  const [expanded, setExpanded] = useState(false);

  return (
    <Slate
      editor={editor}
      initialValue={value as Descendant[]}
      onValueChange={(next) => onChange(next as BlogDocument)}
    >
      <div
        className={`overflow-hidden rounded-xl border border-[#e0e0e0] bg-white dark:border-[#3a3a3a] dark:bg-[#1e1e1e] ${
          expanded ? "min-h-[70vh]" : ""
        }`}
      >
        <Toolbar
          expanded={expanded}
          onToggleExpanded={() => setExpanded((current) => !current)}
        />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Escribe el artículo…"
          spellCheck
          className="min-h-56 px-3 py-3 text-sm leading-relaxed text-[#212121] outline-none dark:text-white [&_a]:text-orange-600 [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-orange-500 [&_blockquote]:pl-3 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-bold [&_h4]:mt-2 [&_h4]:text-base [&_h4]:font-bold [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/5 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] dark:[&_pre]:bg-white/10 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          onKeyDown={(event) => {
            if (!(event.metaKey || event.ctrlKey)) return;
            if (event.key.toLowerCase() === "b") {
              event.preventDefault();
              toggleMark(editor, "bold");
            } else if (event.key.toLowerCase() === "i") {
              event.preventDefault();
              toggleMark(editor, "italic");
            } else if (event.key.toLowerCase() === "u") {
              event.preventDefault();
              toggleMark(editor, "underline");
            } else if (event.key.toLowerCase() === "k") {
              event.preventDefault();
              const current = Editor.nodes(editor, {
                match: (node) => Element.isElement(node) && node.type === "link",
              }).next().value as [BlogElement, Path] | undefined;
              const href = window.prompt("Enlace", current?.[0].href ?? "https://");
              if (href == null) return;
              if (!href.trim()) removeLink(editor);
              else applyLink(editor, href);
            }
          }}
        />
      </div>
    </Slate>
  );
}

function Toolbar({
  expanded,
  onToggleExpanded,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const editor = useSlate();
  const [blockOpen, setBlockOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("https://");
  const block = currentBlock(editor);
  const blockLabel = BLOCKS.find((item) => item.id === block)?.label ?? "Texto";

  function run(action: () => void) {
    action();
    ReactEditor.focus(editor);
  }

  function openLink() {
    const current = Editor.nodes(editor, {
      match: (node) => Element.isElement(node) && node.type === "link",
    }).next().value as [BlogElement, Path] | undefined;
    setHref(current?.[0].href ?? "https://");
    setLinkOpen(true);
    setBlockOpen(false);
    setMoreOpen(false);
  }

  return (
    <div className="border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
      <div className="flex flex-wrap items-center gap-1 p-1">
        <div className="relative shrink-0">
          <button
            type="button"
            aria-expanded={blockOpen}
            aria-label="Estilo de texto"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setBlockOpen((open) => !open);
              setMoreOpen(false);
            }}
            className="h-11 min-w-28 rounded-lg px-3 text-left text-sm font-semibold text-[#212121] dark:text-white cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
          >
            {blockLabel}
          </button>
          {blockOpen ? (
            <div className="absolute left-0 top-12 z-20 w-40 rounded-xl border border-[#e0e0e0] bg-white p-1 shadow-lg dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
              {BLOCKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    run(() => setBlock(editor, item.id));
                    setBlockOpen(false);
                  }}
                  className="flex h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-[#212121] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <ToolButton
          label="Negrita"
          selected={isMarkActive(editor, "bold")}
          onClick={() => run(() => toggleMark(editor, "bold"))}
        >
          <HugeiconsIcon icon={TextBoldIcon} size={18} />
        </ToolButton>
        <ToolButton
          label="Cursiva"
          selected={isMarkActive(editor, "italic")}
          onClick={() => run(() => toggleMark(editor, "italic"))}
        >
          <HugeiconsIcon icon={TextItalicIcon} size={18} />
        </ToolButton>

        <div className="relative shrink-0">
          <ToolButton
            label="Más formato"
            selected={moreOpen}
            onClick={() => {
              setMoreOpen((open) => !open);
              setBlockOpen(false);
            }}
          >
            <span className="text-base font-bold leading-none">…</span>
          </ToolButton>
          {moreOpen ? (
            <div className="absolute left-0 top-12 z-20 w-44 rounded-xl border border-[#e0e0e0] bg-white p-1 shadow-lg dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
              <MenuMark editor={editor} mark="underline" label="Subrayado" icon={TextUnderlineIcon} onDone={() => setMoreOpen(false)} />
              <MenuMark editor={editor} mark="strikethrough" label="Tachado" icon={TextStrikethroughIcon} onDone={() => setMoreOpen(false)} />
              <MenuMark editor={editor} mark="code" label="Código" icon={CodeIcon} onDone={() => setMoreOpen(false)} />
              <MenuMark editor={editor} mark="superscript" label="Superíndice" onDone={() => setMoreOpen(false)} />
              <MenuMark editor={editor} mark="subscript" label="Subíndice" onDone={() => setMoreOpen(false)} />
            </div>
          ) : null}
        </div>

        <span className="mx-1 h-6 w-px shrink-0 bg-[#e0e0e0] dark:bg-[#3a3a3a]" />

        <ToolButton
          label="Lista"
          selected={isTypeActive(editor, "unordered-list")}
          onClick={() => run(() => toggleList(editor, "unordered-list"))}
        >
          <HugeiconsIcon icon={LeftToRightListBulletIcon} size={18} />
        </ToolButton>
        <ToolButton
          label="Lista numerada"
          selected={isTypeActive(editor, "ordered-list")}
          onClick={() => run(() => toggleList(editor, "ordered-list"))}
        >
          <HugeiconsIcon icon={LeftToRightListNumberIcon} size={18} />
        </ToolButton>

        <span className="mx-1 h-6 w-px shrink-0 bg-[#e0e0e0] dark:bg-[#3a3a3a]" />

        <ToolButton label="Separador" onClick={() => run(() => insertDivider(editor))}>
          <HugeiconsIcon icon={MinusSignIcon} size={18} />
        </ToolButton>
        <ToolButton
          label="Enlace"
          selected={isTypeActive(editor, "link") || linkOpen}
          onClick={openLink}
        >
          <HugeiconsIcon icon={Link01Icon} size={18} />
        </ToolButton>
        <ToolButton
          label="Cita"
          selected={isTypeActive(editor, "blockquote")}
          onClick={() => run(() => toggleQuote(editor))}
        >
          <HugeiconsIcon icon={QuoteDownIcon} size={18} />
        </ToolButton>
        <ToolButton
          label="Bloque de código"
          selected={isTypeActive(editor, "code")}
          onClick={() => run(() => toggleCodeBlock(editor))}
        >
          <HugeiconsIcon icon={CodeIcon} size={18} />
        </ToolButton>

        <span className="mx-1 h-6 w-px shrink-0 bg-[#e0e0e0] dark:bg-[#3a3a3a]" />

        <ToolButton
          label={expanded ? "Reducir editor" : "Ampliar editor"}
          selected={expanded}
          onClick={onToggleExpanded}
        >
          <HugeiconsIcon icon={ArrowExpand01Icon} size={18} />
        </ToolButton>
      </div>

      {linkOpen ? (
        <div className="flex flex-col gap-2 border-t border-[#e0e0e0] p-2 sm:flex-row dark:border-[#3a3a3a]">
          <label className="sr-only" htmlFor="blog-link-href">
            Dirección del enlace
          </label>
          <input
            id="blog-link-href"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              run(() => applyLink(editor, href));
              setLinkOpen(false);
            }}
            placeholder="https://"
            className="h-11 min-w-0 flex-1 rounded-lg border border-[#e0e0e0] bg-white px-3 text-sm text-[#212121] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              run(() => applyLink(editor, href));
              setLinkOpen(false);
            }}
            className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white cursor-pointer"
          >
            Aplicar
          </button>
          {isTypeActive(editor, "link") ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                run(() => removeLink(editor));
                setLinkOpen(false);
              }}
              className="h-11 rounded-lg px-3 text-sm font-semibold text-[#616161] cursor-pointer"
            >
              Quitar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolButton({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
        selected
          ? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
          : "text-[#424242] hover:bg-black/5 dark:text-[#e0e0e0] dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function MenuMark({
  editor,
  mark,
  label,
  icon,
  onDone,
}: {
  editor: Editor;
  mark: Mark;
  label: string;
  icon?: typeof TextBoldIcon;
  onDone: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        toggleMark(editor, mark);
        ReactEditor.focus(editor);
        onDone();
      }}
      className={`flex h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium cursor-pointer ${
        isMarkActive(editor, mark)
          ? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
          : "text-[#212121] hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
      }`}
    >
      {icon ? <HugeiconsIcon icon={icon} size={16} /> : null}
      {label}
    </button>
  );
}

function renderElement({ attributes, children, element }: RenderElementProps) {
  const align =
    "textAlign" in element
      ? (element.textAlign as CSSProperties["textAlign"])
      : undefined;
  switch (element.type) {
    case "heading": {
      const level = element.level ?? 2;
      const Tag = (`h${Math.min(6, Math.max(1, level))}`) as "h1";
      return (
        <Tag {...attributes} style={{ textAlign: align }}>
          {children}
        </Tag>
      );
    }
    case "blockquote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "unordered-list":
      return <ul {...attributes}>{children}</ul>;
    case "ordered-list":
      return <ol {...attributes}>{children}</ol>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "list-item-content":
      return <div {...attributes}>{children}</div>;
    case "link":
      return (
        <a {...attributes} href={element.href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    case "code":
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    case "divider":
      return (
        <div {...attributes} className="py-2">
          <hr contentEditable={false} className="border-[#e0e0e0] dark:border-[#3a3a3a]" />
          {children}
        </div>
      );
    default:
      return (
        <p {...attributes} style={{ textAlign: align }}>
          {children}
        </p>
      );
  }
}

function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let content = children;
  if (leaf.bold) content = <strong>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u>{content}</u>;
  if (leaf.strikethrough) content = <s>{content}</s>;
  if (leaf.code) {
    content = (
      <code className="rounded bg-black/5 px-1 font-mono text-[0.92em] dark:bg-white/10">
        {content}
      </code>
    );
  }
  if (leaf.superscript) content = <sup>{content}</sup>;
  if (leaf.subscript) content = <sub>{content}</sub>;
  return <span {...attributes}>{content}</span>;
}
