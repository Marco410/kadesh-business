import type { ReactNode } from "react";
import {
  DEFAULT_PIPELINE_SECTION_HEADER,
  PIPELINE_STATUS_SECTION_HEADER,
} from "kadesh/constants/constans";

export function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-0.5 py-1.5 text-sm border-b border-dash-line last:border-0">
      <dt className="font-medium text-dash-muted shrink-0">
        {label}
      </dt>
      <dd className="text-dash-ink min-w-0 break-words">
        {children ?? (value != null && value !== "" ? String(value) : "—")}
      </dd>
    </div>
  );
}

export function SectionCard({
  title,
  headerClassName,
  headerPipelineStatus,
  className = "",
  children,
}: {
  title: string;
  headerClassName?: string;
  headerPipelineStatus?: string;
  className?: string;
  children: ReactNode;
}) {
  const baseHeader =
    "px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b";

  const headerClasses =
    headerPipelineStatus !== undefined
      ? `${baseHeader} ${
          headerPipelineStatus && PIPELINE_STATUS_SECTION_HEADER[headerPipelineStatus]
            ? PIPELINE_STATUS_SECTION_HEADER[headerPipelineStatus]
            : DEFAULT_PIPELINE_SECTION_HEADER
        }`
      : (headerClassName ??
        `${baseHeader} text-dash-muted bg-dash-surface-2 border-dash-line`);

  return (
    <div
      className={`rounded-lg border border-dash-line bg-dash-surface overflow-hidden ${className}`.trim()}
    >
      <h2 className={headerClasses}>{title}</h2>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

export const leadInputClassName =
  "w-full min-w-0 rounded-lg border border-dash-line bg-white dark:bg-[#2a2a2a] px-2.5 py-1.5 text-dash-ink text-sm placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

export function asExternalHref(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
