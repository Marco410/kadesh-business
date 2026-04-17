"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { Role } from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";
import { HoverTooltip } from "kadesh/components/shared";
import WorkspaceSwitcher from "kadesh/components/profile/sales/workspaces/WorkspaceSwitcher";
import WorkspaceDashboard from "kadesh/components/profile/sales/workspaces/WorkspaceDashboard";
import WorkspaceMembersModal from "kadesh/components/profile/sales/workspaces/members/WorkspaceMembersModal";
import EditWorkspaceSettingsModal from "kadesh/components/profile/sales/workspaces/EditWorkspaceSettingsModal";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import AssigneeAvatar from "kadesh/components/profile/sales/workspaces/AssigneeAvatar";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
} from "kadesh/components/profile/sales/workspaces/queries";

function memberDisplayName(member: {
  name: string;
  lastName: string | null;
  email: string | null;
}) {
  const full = [member.name, member.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (member.email) return member.email;
  return "Miembro";
}

export interface WorkspacesTabProps {
  userId: string;
  onRequestCreateWorkspace?: () => void;
}

export default function WorkspacesTab({
  userId,
  onRequestCreateWorkspace,
}: WorkspacesTabProps) {
  const { user } = useUser();
  const { currentWorkspaceId, isWorkspaceSwitching } = useWorkspaceContext();
  const [membersOpen, setMembersOpen] = useState(false);
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const { data: workspaceDetailData } = useQuery<
    SaasWorkspaceDetailResponse,
    SaasWorkspaceDetailVariables
  >(SAAS_WORKSPACE_DETAIL_QUERY, {
    variables: { where: { id: currentWorkspaceId ?? "" } },
    skip: !currentWorkspaceId,
    fetchPolicy: "cache-and-network",
  });

  const workspaceMembers =
    workspaceDetailData?.saasWorkspace?.members ?? [];

  const companyId = userData?.user?.company?.id ?? null;
  const isAdminCompany =
    user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
          Espacios de trabajo
        </h2>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-2xl">
          Organiza tareas, seguimientos y propuestas por equipo o cliente. El
          selector también aplica en Ventas y Calendario cuando un espacio está
          activo.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <WorkspaceSwitcher
            enabled
            onRequestCreate={onRequestCreateWorkspace}
          />
          {currentWorkspaceId && workspaceMembers.length > 0 && (
            <div
              className="flex items-center pl-1"
              aria-label="Miembros del espacio"
            >
              <div className="flex -space-x-2">
                {workspaceMembers.map((member) => (
                  <HoverTooltip
                    key={member.id}
                    label={memberDisplayName(member)}
                    className="first:z-0 hover:z-20 focus-within:z-20"
                  >
                    <AssigneeAvatar
                      name={member.name}
                      lastName={member.lastName}
                      size={32}
                      showNativeTitle={false}
                      imageUrl={member.profileImage?.url}
                    />
                  </HoverTooltip>
                ))}
              </div>
            </div>
          )}
        </div>
        {currentWorkspaceId && isAdminCompany && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditWorkspaceOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-2.5 text-sm font-medium text-[#212121] dark:text-white shadow-sm hover:border-orange-500/40 transition-colors"
            >
              <HugeiconsIcon icon={Edit02Icon} size={18} />
              Editar espacio de trabajo
            </button>
            <button
              type="button"
              onClick={() => setMembersOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 py-2.5 text-sm font-medium text-[#212121] dark:text-white shadow-sm hover:border-orange-500/40 transition-colors"
            >
              <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
              Gestionar miembros
            </button>
          </div>
        )}
      </div>

      {!currentWorkspaceId ? (
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#404040] bg-[#fafafa] dark:bg-[#181818] px-8 py-16 text-center">
          <p className="text-sm font-medium text-[#212121] dark:text-white">
            Vista general activa
          </p>
          <p className="mt-2 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-md mx-auto">
            Elige un espacio arriba para ver su tablero, o crea uno nuevo. En
            &quot;General&quot; verás todos los registros a los que tienes acceso,
            incluidos los sin espacio asignado.
          </p>
        </div>
      ) : (
        <WorkspaceDashboard
          key={currentWorkspaceId}
          workspaceId={currentWorkspaceId}
          userId={userId}
          showSkeleton={isWorkspaceSwitching}
        />
      )}

      <WorkspaceMembersModal
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        workspaceId={currentWorkspaceId}
        companyId={companyId}
      />

      <EditWorkspaceSettingsModal
        isOpen={editWorkspaceOpen}
        onClose={() => setEditWorkspaceOpen(false)}
        workspaceId={currentWorkspaceId}
      />
    </div>
  );
}
