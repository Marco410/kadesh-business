"use client";

import { PIPELINE_STATUS } from "kadesh/constants/constans";

const PIPELINE_OPTIONS = Object.values(PIPELINE_STATUS);

const selectClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-60 disabled:cursor-not-allowed";

const labelClassName =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

export default function LeadPipelineNotesFields({
  pipelineStatus,
  onPipelineStatusChange,
  notes,
  onNotesChange,
  className = "p-4",
  saving = false,
  notesDirty = false,
  onSaveNotes,
}: {
  pipelineStatus: string;
  onPipelineStatusChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  className?: string;
  saving?: boolean;
  notesDirty?: boolean;
  onSaveNotes?: () => void;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[minmax(12rem,16rem)_1fr] gap-3 ${className}`}>
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
          title="Se guarda al elegir"
          disabled={saving}
        >
          <option value="">—</option>
          {PIPELINE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="sr-only" aria-live="polite">
          {saving ? "Guardando estatus" : "El estatus se guarda al elegir"}
        </p>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="lead-notes" className={`${labelClassName} mb-0`}>
            Notas
          </label>
          {onSaveNotes ? (
            <button
              type="button"
              onClick={onSaveNotes}
              disabled={saving || !notesDirty}
              className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 hover:-translate-y-px active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          ) : null}
        </div>
        <textarea
          id="lead-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="Notas del cliente..."
          disabled={saving}
          className={`${selectClassName} placeholder-[#9ca3af] resize-y min-h-[42px]`}
        />
      </div>
    </div>
  );
}
