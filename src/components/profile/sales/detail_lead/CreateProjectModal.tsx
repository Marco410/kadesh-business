"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import {
  CREATE_SAAS_PROJECT_MUTATION,
  type CreateSaasProjectVariables,
  type CreateSaasProjectMutation,
} from "kadesh/components/profile/sales/proyecto/queries";
import { PROJECT_STATUS, PROJECT_STATUS_OPTIONS } from "kadesh/constants/constans";
import { sileo } from "sileo";
import { COMPANY_VENDEDORES_QUERY, CompanyVendedoresResponse, CompanyVendedoresVariables, USER_COMPANY_CATEGORIES_QUERY, UserCompanyCategoriesResponse, UserCompanyCategoriesVariables } from "../queries";

interface CreateProjectModalProps {
  proposalId: string | null;
  leadId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName = "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

export default function CreateProjectModal({
  proposalId,
  leadId,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedEndDate, setEstimatedEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [urlData, setUrlData] = useState("");
  const [status, setStatus] = useState<string>(PROJECT_STATUS.PENDIENTE);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !isOpen || !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen, userId]);

  const [createProject, { loading: creating }] = useMutation<
    CreateSaasProjectMutation,
    CreateSaasProjectVariables
  >(CREATE_SAAS_PROJECT_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Proyecto creado correctamente." });
      onSuccess?.();
      handleClose();
    },
    onError: (err) => {
      sileo.error({ title: err.message || "Error al crear el proyecto." });
    },
  });

  function handleClose() {
    setName("");
    setServiceType("");
    setStartDate("");
    setEstimatedEndDate("");
    setDescription("");
    setUrlData("");
    setStatus(PROJECT_STATUS.PENDIENTE);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      sileo.error({ title: "El nombre del proyecto es obligatorio." });
      return;
    }
    if (!companyId) {
      sileo.error({ title: "No se pudo obtener la empresa." });
      return;
    }

    createProject({
      variables: {
        data: {
          name: name.trim(),
          serviceType: serviceType.trim() || undefined,
          description: description.trim() || undefined,
          status: status || PROJECT_STATUS.PENDIENTE,
          startDate: startDate || undefined,
          estimatedEndDate: estimatedEndDate || undefined,
          urlData: urlData.trim() || undefined,
          company: { connect: { id: companyId } },
          businessLead: { connect: { id: leadId } },
          ...(proposalId && { proposal: { connect: { id: proposalId } } }),
          ...(userId && { responsible: { connect: { id: userId } } }),
        },
      },
    });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="create-project-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={handleClose}
      />
      <motion.div
        key="create-project-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            <h4 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
              Crear proyecto
            </h4>
            <button
              type="button"
              onClick={handleClose}
              className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
            <div>
              <label htmlFor="project-name" className={labelClassName}>
                Nombre del proyecto <span className="text-red-500">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sitio web cliente X"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="project-serviceType" className={labelClassName}>
                Tipo de servicio
              </label>
              <input
                id="project-serviceType"
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Ej. Desarrollo web, Remodelación, Campaña marketing"
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-startDate" className={labelClassName}>
                  Fecha de inicio
                </label>
                <input
                  id="project-startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="project-estimatedEndDate" className={labelClassName}>
                  Fecha estimada de fin
                </label>
                <input
                  id="project-estimatedEndDate"
                  type="date"
                  value={estimatedEndDate}
                  onChange={(e) => setEstimatedEndDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="project-description" className={labelClassName}>
                Descripción o alcance
              </label>
              <textarea
                id="project-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del proyecto o alcance"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="project-urlData" className={labelClassName}>
                Enlace a carpeta en la nube
              </label>
              <input
                id="project-urlData"
                type="url"
                value={urlData}
                onChange={(e) => setUrlData(e.target.value)}
                placeholder="Ej. https://drive.google.com/... o link a Dropbox, OneDrive, etc."
                className={inputClassName}
              />
              <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                Link donde guardas fotos, archivos e información del cliente.
              </p>
            </div>

            <div>
              <label htmlFor="project-status" className={labelClassName}>
                Estado del proyecto
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClassName}
              >
                {PROJECT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                {creating ? "Creando…" : "Crear proyecto"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
