"use client";

import Link from "next/link";
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
import { PROJECT_STATUS_CLASSES } from "kadesh/components/profile/sales/constants";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";

interface ProyectosSectionProps {
  userId: string;
}

export default function ProyectosSection({ userId }: ProyectosSectionProps) {
  const { user } = useUser();
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

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

  const { data: projectsData, loading } = useQuery<
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
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <div className="flex justify-center py-12">
          <span className="animate-spin size-10 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-[#212121] dark:text-white mb-4">
          Proyectos
        </h3>
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-6">
          Proyectos creados a partir de propuestas compradas.
        </p>

        {projects.length === 0 ? (
          <p className="text-[#616161] dark:text-[#b0b0b0] py-6">
            {isAdminCompany
              ? 'Aún no hay proyectos. Crea uno desde una propuesta con estado "Comprada" en la ficha de un lead.'
              : "No tienes proyectos asignados como responsable."}
          </p>
        ) : (
          <ul className="divide-y divide-[#e0e0e0] dark:divide-[#3a3a3a]">
            {projects.map((p) => {
              const statusClass =
                PROJECT_STATUS_CLASSES[p.status ?? ""] ??
                "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]";
              return (
                <li key={p.id}>
                  <Link
                    href={Routes.panelProject(p.id)}
                    className="flex flex-wrap items-center gap-3 py-4 hover:bg-[#fafafa] dark:hover:bg-[#252525] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#212121] dark:text-[#ffffff]">
                        {p.name}
                      </p>
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-0.5">
                        {p.businessLead?.businessName ?? "—"}
                        {p.serviceType && ` · ${p.serviceType}`}
                        {p.startDate &&
                          ` · ${formatDateShort(p.startDate, false)}`}
                      </p>
                    </div>
                    {p.status && (
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusClass}`}
                      >
                        {p.status}
                      </span>
                    )}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      className="text-[#616161] dark:text-[#b0b0b0] shrink-0"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
