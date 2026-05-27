"use client";

import ChangelogReleaseCard from "./ChangelogReleaseCard";
import type { SystemRelease } from "./types";

interface ChangelogTimelineProps {
  releases: SystemRelease[];
}

export default function ChangelogTimeline({ releases }: ChangelogTimelineProps) {
  return (
    <ol className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-orange-400/80 before:via-[#e0e0e0] before:to-transparent dark:before:from-orange-500/50 dark:before:via-[#3a3a3a] sm:before:left-[15px]">
      {releases.map((release, index) => (
        <li key={release.id} className="relative pl-10 sm:pl-12">
          <span
            className={`absolute left-0 top-6 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 sm:h-[30px] sm:w-[30px] sm:left-[1px] ${
              index === 0
                ? "border-orange-500 bg-orange-500 shadow-md shadow-orange-500/30"
                : "border-[#e0e0e0] bg-white dark:border-[#444] dark:bg-[#1a1a1a]"
            }`}
            aria-hidden
          >
            {index === 0 && (
              <span className="h-2 w-2 rounded-full bg-white sm:h-2.5 sm:w-2.5" />
            )}
          </span>
          <ChangelogReleaseCard
            release={release}
            isLatest={index === 0}
            index={index}
          />
        </li>
      ))}
    </ol>
  );
}
