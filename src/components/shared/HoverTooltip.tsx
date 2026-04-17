"use client";

import { useId, type ReactNode } from "react";

export interface HoverTooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function HoverTooltip({
  label,
  children,
  className = "",
}: HoverTooltipProps) {
  const id = useId();
  return (
    <span className={`group relative inline-flex ${className}`}>
      <span
        aria-describedby={id}
        tabIndex={0}
        className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-[60] mb-2 max-w-[240px] -translate-x-1/2 whitespace-normal rounded-lg bg-[#212121] px-3 py-2 text-left text-xs font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:bg-[#333] sm:max-w-[320px]"
      >
        {label}
      </span>
    </span>
  );
}
