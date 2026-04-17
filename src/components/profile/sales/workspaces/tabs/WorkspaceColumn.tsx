import type React from "react";

export interface WorkspaceColumnProps {
  title: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string | null;
  className?: string;
}

export default function WorkspaceColumn({
  title,
  count,
  action,
  children,
  accentColor,
  className,
}: WorkspaceColumnProps) {
  return (
    <div
      className={`flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.07),0_4px_14px_-3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:border-[#333] dark:bg-[#181818] dark:shadow-none dark:ring-0 ${className ?? ""}`}
    >
      {accentColor ? (
        <div
          className="h-1 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />
      ) : (
        <div
          className="h-1 w-full shrink-0 bg-neutral-300 dark:bg-[#404040]"
          aria-hidden
        />
      )}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-100/95 px-3 py-3.5 dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
        <div className="flex min-w-0 items-center gap-2.5">
          {accentColor ? (
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow-sm dark:ring-[#1f1f1f]"
              style={{ backgroundColor: accentColor }}
              aria-hidden
            />
          ) : null}
          <h3 className="min-w-0 truncate text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-neutral-700 shadow-sm dark:border-[#404040] dark:bg-[#252525] dark:text-[#b0b0b0] dark:shadow-none">
            {count}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-neutral-50/95 p-3 max-h-[min(60vh,520px)] pr-1 dark:bg-[#141414]">
        {children}
      </div>
    </div>
  );
}
