"use client";

import { useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { PROJECT_STATUS, PROJECT_STATUS_CLASSES } from "kadesh/constants/constans";
import DatePickerField from "kadesh/components/shared/DatePickerField";

const CREATE_STATUSES = [
  PROJECT_STATUS.PENDIENTE,
  PROJECT_STATUS.EN_PROCESO,
  PROJECT_STATUS.EN_REVISION,
] as const;

export const projectInputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] px-3 py-2.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-[box-shadow,border-color] duration-150 disabled:opacity-60";

const labelClassName =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

export type ProjectCreateFormValues = {
  name: string;
  serviceType: string;
  startDate: string;
  estimatedEndDate: string;
  description: string;
  urlData: string;
  status: string;
};

export default function ProjectCreateForm({
  values,
  onChange,
  extraAfterName,
  nameInputRef,
  creating,
  canSubmit,
  onSubmit,
  onCancel,
}: {
  values: ProjectCreateFormValues;
  onChange: (patch: Partial<ProjectCreateFormValues>) => void;
  extraAfterName?: ReactNode;
  nameInputRef?: RefObject<HTMLInputElement | null>;
  creating: boolean;
  canSubmit: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const hasOptional =
    Boolean(values.serviceType.trim()) ||
    Boolean(values.startDate) ||
    Boolean(values.estimatedEndDate) ||
    Boolean(values.description.trim()) ||
    Boolean(values.urlData.trim());
  const showMore = moreOpen || hasOptional;

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <label htmlFor="project-name" className={labelClassName}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="project-name"
            type="text"
            required
            autoComplete="off"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ej. Sitio web, campaña, remodelación"
            className={projectInputClassName}
            disabled={creating}
          />
        </div>

        {extraAfterName}

        <div>
          <p className={labelClassName}>Estado</p>
          <div className="flex flex-wrap gap-1.5">
            {CREATE_STATUSES.map((opt) => {
              const selected = values.status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ status: opt })}
                  disabled={creating}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    selected
                      ? `${PROJECT_STATUS_CLASSES[opt]} shadow-sm`
                      : "bg-[#f5f5f5] text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0] hover:bg-[#ececec] dark:hover:bg-[#333]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#e8e8e8] pt-3 dark:border-[#333]">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#616161] hover:text-orange-600 dark:text-[#b0b0b0] dark:hover:text-orange-400"
            aria-expanded={showMore}
          >
            Fechas, alcance y archivos
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              className={`transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>
          {showMore ? (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="project-serviceType" className={labelClassName}>
                  Tipo de servicio
                </label>
                <input
                  id="project-serviceType"
                  type="text"
                  value={values.serviceType}
                  onChange={(e) => onChange({ serviceType: e.target.value })}
                  placeholder="Desarrollo web, campaña…"
                  className={projectInputClassName}
                  disabled={creating}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DatePickerField
                  id="project-startDate"
                  label="Inicio"
                  granularity="day"
                  value={values.startDate}
                  onChange={(value) => onChange({ startDate: value })}
                  isDisabled={creating}
                  highZIndex
                />
                <DatePickerField
                  id="project-estimatedEndDate"
                  label="Fin estimado"
                  granularity="day"
                  value={values.estimatedEndDate}
                  onChange={(value) => onChange({ estimatedEndDate: value })}
                  isDisabled={creating}
                  highZIndex
                />
              </div>
              <div>
                <label htmlFor="project-description" className={labelClassName}>
                  Alcance
                </label>
                <textarea
                  id="project-description"
                  rows={2}
                  value={values.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Qué incluye, qué no"
                  className={`${projectInputClassName} resize-y min-h-[64px]`}
                  disabled={creating}
                />
              </div>
              <div>
                <label htmlFor="project-urlData" className={labelClassName}>
                  Carpeta en la nube
                </label>
                <input
                  id="project-urlData"
                  type="url"
                  value={values.urlData}
                  onChange={(e) => onChange({ urlData: e.target.value })}
                  placeholder="https://…"
                  className={projectInputClassName}
                  disabled={creating}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[#e0e0e0] bg-[#fafafa] px-5 py-3 dark:border-[#3a3a3a] dark:bg-[#252525]">
        <button
          type="button"
          onClick={onCancel}
          disabled={creating}
          className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-medium text-[#212121] hover:bg-white dark:border-[#3a3a3a] dark:text-white dark:hover:bg-[#2a2a2a]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={creating || !canSubmit}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 hover:-translate-y-px active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
        >
          {creating ? "Creando…" : "Crear proyecto"}
        </button>
      </div>
    </form>
  );
}
