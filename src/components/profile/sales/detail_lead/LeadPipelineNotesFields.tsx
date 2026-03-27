"use client";

import { PIPELINE_STATUS } from "kadesh/constants/constans";

const PIPELINE_OPTIONS = Object.values(PIPELINE_STATUS);

const selectClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500";

const labelClassName =
  "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

export default function LeadPipelineNotesFields({
  pipelineStatus,
  onPipelineStatusChange,
  notes,
  onNotesChange,
  className = "p-4",
}: {
  pipelineStatus: string;
  onPipelineStatusChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  /** Extra wrapper classes; default includes padding. */
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label htmlFor="lead-pipeline" className={labelClassName}>
          Estatus
        </label>
        <select
          id="lead-pipeline"
          value={pipelineStatus}
          onChange={(e) => onPipelineStatusChange(e.target.value)}
          className={selectClassName}
          aria-label="Estado del pipeline"
        >
          <option value="">—</option>
          {PIPELINE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="lead-notes" className={labelClassName}>
          Notas
        </label>
        <textarea
          id="lead-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Notas del lead..."
          className={`${selectClassName} placeholder-[#9ca3af] resize-y min-h-[80px]`}
        />
      </div>
    </div>
  );
}
