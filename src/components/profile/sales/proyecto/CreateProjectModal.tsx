"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  CREATE_SAAS_PROJECT_MUTATION,
  type CreateSaasProjectVariables,
  type CreateSaasProjectMutation,
} from "kadesh/components/profile/sales/proyecto/queries";
import { PROJECT_STATUS } from "kadesh/constants/constans";
import { sileo } from "sileo";
import ClientLeadAutocomplete from "kadesh/components/shared/ClientLeadAutocomplete";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "../queries";
import ProjectCreateForm, {
  type ProjectCreateFormValues,
} from "./ProjectCreateForm";

interface CreateProjectModalProps {
  proposalId: string | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyValues = (): ProjectCreateFormValues => ({
  name: "",
  serviceType: "",
  startDate: "",
  estimatedEndDate: "",
  description: "",
  urlData: "",
  status: PROJECT_STATUS.PENDIENTE,
});

const motionEase = [0.2, 0, 0, 1] as const;

export default function CreateProjectModal({
  proposalId,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [values, setValues] = useState<ProjectCreateFormValues>(emptyValues);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !isOpen || !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const [createProject, { loading: creating }] = useMutation<
    CreateSaasProjectMutation,
    CreateSaasProjectVariables
  >(CREATE_SAAS_PROJECT_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Proyecto creado" });
      onSuccess?.();
      handleClose();
    },
    onError: (err) => {
      sileo.error({ title: err.message || "No se pudo crear el proyecto" });
    },
  });

  function handleClose() {
    setValues(emptyValues());
    setSelectedLeadId(null);
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    setSelectedLeadId(null);
    const t = window.setTimeout(() => nameInputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !creating) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, creating]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      sileo.error({ title: "El nombre del proyecto es obligatorio" });
      return;
    }
    if (!companyId) {
      sileo.error({ title: "No se pudo obtener la empresa" });
      return;
    }
    if (!selectedLeadId) {
      sileo.error({ title: "Selecciona un cliente" });
      return;
    }

    createProject({
      variables: {
        data: {
          name: values.name.trim(),
          serviceType: values.serviceType.trim() || undefined,
          description: values.description.trim() || undefined,
          status: values.status || PROJECT_STATUS.PENDIENTE,
          startDate: values.startDate || undefined,
          estimatedEndDate: values.estimatedEndDate || undefined,
          urlData: values.urlData.trim() || undefined,
          company: { connect: { id: companyId } },
          businessLead: { connect: { id: selectedLeadId } },
          ...(proposalId && { proposal: { connect: { id: proposalId } } }),
          ...(userId && { responsible: { connect: { id: userId } } }),
        },
      },
    });
  }

  const patch = (next: Partial<ProjectCreateFormValues>) =>
    setValues((prev) => ({ ...prev, ...next }));

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="create-project-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: motionEase }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={handleClose}
          />
          <motion.div
            key="create-project-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: motionEase }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-project-title"
              className="pointer-events-auto flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#e0e0e0] bg-[#f5f5f5] px-5 py-4 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
                <div className="min-w-0">
                  <h2
                    id="create-project-title"
                    className="text-lg font-bold text-[#212121] dark:text-white"
                  >
                    Nuevo proyecto
                  </h2>
                  <p className="mt-0.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Nombre y cliente bastan. Lo demás es opcional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#e5e5e5] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-[#333] dark:hover:text-white"
                  aria-label="Cerrar"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>

              <ProjectCreateForm
                values={values}
                onChange={patch}
                nameInputRef={nameInputRef}
                creating={creating}
                canSubmit={Boolean(values.name.trim() && selectedLeadId)}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                extraAfterName={
                  <ClientLeadAutocomplete
                    id="project-client"
                    userId={userId}
                    enabled={isOpen}
                    selectedLeadId={selectedLeadId}
                    onSelectedLeadIdChange={setSelectedLeadId}
                    placeholder="Buscar por nombre"
                    required
                  />
                }
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
