"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  DashboardSquare01Icon,
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
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#404040] bg-[#fafafa] dark:bg-[#181818] p-5 sm:p-7">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <HugeiconsIcon icon={DashboardSquare01Icon} size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#212121] dark:text-white">
                  Vista general activa
                </p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#616161] dark:text-[#9e9e9e]">
                  Estás viendo todos los registros sin filtrar por espacio. Elige uno para enfocar
                  tareas, actividades, seguimientos y propuestas.
                </p>
              </div>
            </div>
            {workspacePickerList.length > 0 && (
              <span className="inline-flex shrink-0 self-start rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-xs font-medium text-[#616161] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#9e9e9e]">
                {workspacePickerList.length}{" "}
                {workspacePickerList.length === 1 ? "espacio" : "espacios"}
              </span>
            )}
          </div>

          {workspacesListLoading && !workspacesListData ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando espacios">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-3 rounded-xl border border-[#e0e0e0] bg-white p-4 dark:border-[#2e2e2e] dark:bg-[#1a1a1a]"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#e0e0e0] dark:bg-[#2e2e2e]" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-[#e0e0e0] dark:bg-[#2e2e2e]" />
                    <div className="h-3 w-20 rounded bg-[#e0e0e0] dark:bg-[#2e2e2e]" />
                  </div>
                </div>
              ))}
            </div>
          ) : workspacePickerList.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-[#e0e0e0] bg-white px-6 py-10 text-center dark:border-[#2e2e2e] dark:bg-[#1a1a1a]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <HugeiconsIcon icon={FolderIcon} size={24} />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#212121] dark:text-white">
                Aún no tienes espacios de trabajo
              </p>
              <p className="mt-1 max-w-sm text-sm text-[#616161] dark:text-[#9e9e9e]">
                Crea uno para organizar tareas, actividades, seguimientos y propuestas por equipo o
                cliente.
              </p>
              {onRequestCreateWorkspace && (
                <button
                  type="button"
                  onClick={onRequestCreateWorkspace}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                >
                  <HugeiconsIcon icon={Add01Icon} size={18} />
                  Crear espacio de trabajo
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2" role="list" aria-label="Espacios de trabajo">
              {workspacePickerList.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="listitem"
                  onClick={() => setCurrentWorkspaceId(w.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[#e0e0e0] bg-white p-3.5 text-left shadow-sm transition-all duration-150 hover:border-orange-400/60 hover:bg-orange-500/[0.02] hover:shadow-md hover:shadow-orange-500/5 dark:border-[#2e2e2e] dark:bg-[#1a1a1a] dark:hover:border-orange-500/40 dark:hover:bg-orange-500/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 sm:gap-4 sm:p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-colors group-hover:bg-orange-500/15 dark:text-orange-400">
                    <HugeiconsIcon icon={FolderIcon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                      {w.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9e9e9e] transition-colors group-hover:text-orange-600/80 dark:text-[#757575] dark:group-hover:text-orange-400/80">
                      Abrir espacio de trabajo
                    </p>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8e8e8] bg-[#fafafa] text-[#9e9e9e] transition-all duration-150 group-hover:translate-x-0.5 group-hover:border-orange-400/40 group-hover:bg-orange-500/10 group-hover:text-orange-600 dark:border-[#333] dark:bg-[#222] dark:text-[#9e9e9e] dark:group-hover:border-orange-500/30 dark:group-hover:bg-orange-500/10 dark:group-hover:text-orange-400">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </span>
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
          canReassignAssignee={isAdminCompany}
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
