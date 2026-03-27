"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon, Cancel01Icon, FolderIcon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { PROJECT_STATUS_CLASSES } from "kadesh/constants/constans";
import CreateProjectModal from "./CreateProjectModal";

export type LeadProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  createdAt: string;
};

export default function LeadProjectsModal({
  isOpen,
  onClose,
  projects,
  leadBusinessName,
  leadId,
  userId,
  onProjectCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: LeadProjectListItem[] | null | undefined;
  leadBusinessName?: string | null;
  leadId: string;
  userId: string;
  onProjectCreated?: () => void;
}) {
  const list = projects ?? [];
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const canCreateProject = Boolean(leadId && userId);

  useEffect(() => {
    if (!isOpen) setIsCreateProjectOpen(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-projects-modal-title"
              className="pointer-events-auto w-full max-w-lg max-h-[min(85vh,640px)] flex flex-col rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                <div className="min-w-0">
                  <h2
                    id="lead-projects-modal-title"
                    className="text-lg font-bold text-[#212121] dark:text-white"
                  >
                    Proyectos del lead
                  </h2>
                  {leadBusinessName ? (
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5 truncate">
                      {leadBusinessName}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 p-2 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:bg-[#e5e5e5] dark:hover:bg-[#333] hover:text-[#212121] dark:hover:text-white transition-colors"
                  aria-label="Cerrar"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] px-4 py-10 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 mb-3">
                      <HugeiconsIcon icon={FolderIcon} size={24} />
                    </span>
                    <p className="text-sm font-medium text-[#212121] dark:text-white">
                      Sin proyectos aún
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 max-w-xs mx-auto">
                      Crea un proyecto desde una propuesta comprada o desde la sección de proyectos.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {list.map((p) => {
                      const statusClass =
                        PROJECT_STATUS_CLASSES[p.status ?? ""] ??
                        "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]";
                      return (
                        <li
                          key={p.id}
                          className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-[#212121] dark:text-white truncate">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-[#9e9e9e] dark:text-[#888] mt-0.5">
                                Creado {formatDateShort(p.createdAt, false)}
                              </p>
                            </div>
                            {p.status ? (
                              <span
                                className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}
                              >
                                {p.status}
                              </span>
                            ) : null}
                          </div>
                          {p.description ? (
                            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-2 line-clamp-2">
                              {p.description}
                            </p>
                          ) : null}
                          <div className="mt-3 flex justify-end">
                            <Link
                              href={Routes.panelProject(p.id)}
                              onClick={onClose}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                            >
                              Ver detalle
                              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="shrink-0 border-t border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-5 py-3">
                <button
                  type="button"
                  disabled={!canCreateProject}
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] disabled:pointer-events-none disabled:opacity-50 transition-colors"
                >
                  <HugeiconsIcon icon={Add01Icon} size={18} />
                  Crear proyecto
                </button>
              </div>
            </div>
          </motion.div>

          <CreateProjectModal
            proposalId={null}
            leadId={leadId}
            userId={userId}
            isOpen={isCreateProjectOpen}
            onClose={() => setIsCreateProjectOpen(false)}
            onSuccess={() => {
              onProjectCreated?.();
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
