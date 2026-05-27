"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import ChangelogReleaseBody from "./ChangelogReleaseBody";
import { CHANGELOG_BODY_COLLAPSE_CHARS } from "./constants";
import { formatReleaseDate } from "./format-release-date";
import type { SystemRelease } from "./types";

interface ChangelogReleaseCardProps {
  release: SystemRelease;
  isLatest?: boolean;
  index?: number;
}

export default function ChangelogReleaseCard({
  release,
  isLatest = false,
  index = 0,
}: ChangelogReleaseCardProps) {
  const body = release.body?.trim() ?? "";
  const isCollapsible = body.length > CHANGELOG_BODY_COLLAPSE_CHARS;
  const [expanded, setExpanded] = useState(!isCollapsible);
  const displayBody =
    isCollapsible && !expanded
      ? `${body.slice(0, CHANGELOG_BODY_COLLAPSE_CHARS).trim()}…`
      : body;

  const heading = release.title?.trim() || `Versión ${release.version}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      className={`relative rounded-2xl border bg-white p-6 shadow-sm dark:bg-[#1a1a1a] sm:p-8 ${
        isLatest
          ? "border-orange-400/60 shadow-orange-500/10 ring-1 ring-orange-500/20 dark:border-orange-500/40"
          : "border-[#e0e0e0] dark:border-[#333]"
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-sm font-bold tracking-tight ${
                isLatest
                  ? "bg-orange-500 text-white"
                  : "bg-[#f0f0f0] text-[#212121] dark:bg-[#2a2a2a] dark:text-orange-300"
              }`}
            >
              v{release.version}
            </span>
            {isLatest && (
              <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                Más reciente
              </span>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold text-[#212121] dark:text-white sm:text-2xl">
            {heading}
          </h2>
          <time
            dateTime={release.releasedAt}
            className="mt-1 block text-sm text-[#757575] dark:text-[#9e9e9e]"
          >
            {formatReleaseDate(release.releasedAt)}
          </time>
        </div>
      </header>

      {body ? (
        <div className="mt-5">
          <ChangelogReleaseBody body={displayBody} />
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <HugeiconsIcon
                icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
                size={16}
              />
              {expanded ? "Ver menos" : "Leer notas completas"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm italic text-[#9e9e9e]">
          Sin notas de cambio para esta versión.
        </p>
      )}
    </motion.article>
  );
}
