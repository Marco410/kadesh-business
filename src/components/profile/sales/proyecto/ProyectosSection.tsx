"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  SAAS_PROJECTS_LIST_QUERY,
  type SaasProjectsListResponse,
  type SaasProjectsListVariables,
} from "kadesh/components/profile/sales/proyecto/queries";
import {
  PROJECT_STATUS_CLASSES,
} from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon, FolderIcon } from "@hugeicons/core-free-icons";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import CreateProjectModal from "./CreateProjectModal";

interface ProyectosSectionProps {
  userId: string;
}

export default function ProyectosSection({ userId }: ProyectosSectionProps) {
  const { user } = useUser();
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const whereClause =
    companyId == null
      ? {}
      : isAdminCompany
        ? { company: { id: { equals: companyId } } }
        : {
            company: { id: { equals: companyId } },
            responsible: { id: { equals: userId } },
          };

  const { data: projectsData, loading, refetch: refetchProjects } = useQuery<
    SaasProjectsListResponse,
    SaasProjectsListVariables
  >(SAAS_PROJECTS_LIST_QUERY, {
    variables: { where: whereClause },
    skip: !companyId,
  });

  const projects = projectsData?.saasProjects ?? [];

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <p className="text-[#616161] dark:text-[#b0b0b0]">
          No se pudo cargar la empresa. Los proyectos se listan por empresa.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-8 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cargando proyectos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#212121] dark:text-white">
            Proyectos
          </h3>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
            {isAdminCompany
              ? "Todos los proyectos de la empresa."
              : "Proyectos."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium">
          {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
        </span>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateProjectOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Crear proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#444] bg-white dark:bg-[#1e1e1e] p-8 sm:p-12 shadow-sm text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 mb-4">
            <HugeiconsIcon icon={FolderIcon} size={28} />
          </span>
          <p className="font-semibold text-[#212121] dark:text-white mb-1">
            Sin proyectos
          </p>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] max-w-sm mx-auto">
            {isAdminCompany
              ? 'Crea un proyecto desde una propuesta con estado "Comprada" en la ficha de un lead.'
              : "Aún no tienes proyectos creados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {projects.map((p) => {
            const statusClass =
              PROJECT_STATUS_CLASSES[p.status ?? ""] ??
              "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]";
            return (
              <Link
                key={p.id}
                href={Routes.panelProject(p.id)}
                className="group rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-5 shadow-sm hover:border-orange-500/40 dark:hover:border-orange-500/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400">
                      <HugeiconsIcon icon={FolderIcon} size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#212121] dark:text-white truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                        {p.name}
                      </p>
                      {p.businessLead?.businessName && (
                        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] truncate mt-0.5">
                          {p.businessLead.businessName}
                        </p>
                      )}
                    </div>
                  </div>
                  {p.status && (
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusClass}`}
                    >
                      {p.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[#9e9e9e] dark:text-[#666]">
                  <div className="flex items-center gap-3">
                    {p.serviceType && (
                      <span className="truncate max-w-[140px]">
                        {p.serviceType}
                      </span>
                    )}
                    {p.startDate && (
                      <span>
                        {formatDateShort(p.startDate, false)}
                      </span>
                    )}
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="text-[#b0b0b0] dark:text-[#666] group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors shrink-0"
                  />
                </div>

                {p.responsible?.name && (
                  <p className="mt-2 pt-2 border-t border-[#f0f0f0] dark:border-[#333] text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Creado por: <span className="font-medium text-[#212121] dark:text-white">{p.responsible.name}</span>
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        proposalId={null}
        userId={userId}
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={async () => {
          await refetchProjects();
          setIsCreateProjectOpen(false);
        }}
      />
    </div>
  );
}
