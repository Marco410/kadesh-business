"use client";

import { useMemo, type ReactNode } from "react";

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#212121] dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] };

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = body.trim().split(/\n{2,}/);

  for (const raw of paragraphs) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const isList = lines.every((l) => /^[-*•]\s+/.test(l));
    if (isList) {
      blocks.push({
        type: "list",
        items: lines.map((l) => l.replace(/^[-*•]\s+/, "")),
      });
    } else {
      blocks.push({ type: "paragraph", lines });
    }
  }

  return blocks;
}

interface ChangelogReleaseBodyProps {
  body: string;
  className?: string;
}

/**
 * Renders release notes: paragraphs, bullet lists, and **bold** inline.
 */
export default function ChangelogReleaseBody({
  body,
  className = "",
}: ChangelogReleaseBodyProps) {
  const blocks = useMemo(() => parseBlocks(body), [body]);

  if (blocks.length === 0) return null;

  return (
    <div
      className={`space-y-3 text-[15px] leading-relaxed text-[#424242] dark:text-[#c8c8c8] ${className}`}
    >
      {blocks.map((block, blockIndex) => {
        if (block.type === "list") {
          return (
            <ul
              key={blockIndex}
              className="list-disc space-y-1.5 pl-5 marker:text-orange-500"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={blockIndex}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
