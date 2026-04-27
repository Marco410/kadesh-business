"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Edit02Icon,
  FolderIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
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
  SAAS_WORKSPACES_QUERY,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
  type SaasWorkspacesResponse,
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
  const { currentWorkspaceId, isWorkspaceSwitching, setCurrentWorkspaceId } =
    useWorkspaceContext();
  const [membersOpen, setMembersOpen] = useState(false);
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);

  // URL → context: on first mount, if ?workspace=id is present, honour it
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const urlWorkspace = searchParams.get("workspace");
    if (urlWorkspace && urlWorkspace !== currentWorkspaceId) {
      setCurrentWorkspaceId(urlWorkspace);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Context → URL: keep ?workspace= in sync whenever selection changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentWorkspaceId) {
      params.set("workspace", currentWorkspaceId);
    } else {
      params.delete("workspace");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

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

  const { data: workspacesListData, loading: workspacesListLoading } =
    useQuery<SaasWorkspacesResponse>(SAAS_WORKSPACES_QUERY, {
      fetchPolicy: "cache-and-network",
      skip: !!currentWorkspaceId,
    });

  const workspacePickerList = [...(workspacesListData?.saasWorkspaces ?? [])].sort(
    (a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

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
          Organiza tareas, actividades, seguimientos y propuestas por equipo o cliente. El
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
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#404040] bg-[#fafafa] dark:bg-[#181818] p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-medium text-[#212121] dark:text-white">
              Vista general activa
            </p>
          </div>
          {workspacesListLoading && !workspacesListData ? (
            <p className="text-sm text-[#616161] dark:text-[#9e9e9e]">
              Cargando espacios…
            </p>
          ) : workspacePickerList.length === 0 ? (
            <p className="text-sm text-[#616161] dark:text-[#9e9e9e] max-w-xl">
              Aún no tienes espacios. Crea uno para organizar tareas, actividades, seguimientos y
              propuestas.
            </p>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label="Espacios de trabajo"
            >
              {workspacePickerList.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="listitem"
                  onClick={() => setCurrentWorkspaceId(w.id)}
                  className="group flex w-full flex-col gap-3 rounded-2xl border border-[#e0e0e0] dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] p-4 text-left shadow-sm transition-all duration-150 hover:border-orange-400/60 hover:shadow-md hover:shadow-orange-500/5 dark:hover:border-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-colors group-hover:bg-orange-500/15">
                      <HugeiconsIcon icon={FolderIcon} size={20} />
                    </span>
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#bdbdbd] dark:text-[#4a4a4a] transition-colors group-hover:text-orange-500">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                      {w.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9e9e9e] dark:text-[#616161] group-hover:text-orange-500/70">
                      Abrir espacio
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
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
