"use client";

import { useWorkspaceTabsConfig } from "kadesh/components/profile/sales/workspaces/hooks/useWorkspaceTabsConfig";
import WorkspaceCrmBoard from "kadesh/components/profile/sales/workspaces/WorkspaceCrmBoard";

export interface WorkspaceDashboardProps {
  workspaceId: string;
  userId: string;
  showSkeleton?: boolean;
}

export default function WorkspaceDashboard({
  workspaceId,
  userId,
  showSkeleton,
}: WorkspaceDashboardProps) {
  const {
    enabledTabs,
    showActivities,
    showFollowUpTasks,
    showProposals,
    crmStatuses,
    defaultCrmStatusId,
    isLoadingConfig,
  } = useWorkspaceTabsConfig(workspaceId);

  return (
    <div className="w-full">
      {enabledTabs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#404040] bg-[#fafafa] dark:bg-[#181818] px-8 py-16 text-center">
          <p className="text-sm font-medium text-[#212121] dark:text-white">
            Este workspace no tiene tabs habilitadas
          </p>
          <p className="mt-2 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-md mx-auto">
            Al crear el espacio se desactivaron Actividades, Seguimientos y Propuestas.
          </p>
        </div>
      ) : isLoadingConfig ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[min(60vh,520px)] min-h-[420px] w-[min(100%,300px)] shrink-0 animate-pulse rounded-2xl bg-[#f0f0f0] dark:bg-[#252525]"
            />
          ))}
        </div>
      ) : crmStatuses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d0d0d0] dark:border-[#404040] bg-[#fafafa] dark:bg-[#181818] px-8 py-16 text-center">
          <p className="text-sm font-medium text-[#212121] dark:text-white">
            No hay estados CRM en este espacio
          </p>
          <p className="mt-2 text-sm text-[#616161] dark:text-[#9e9e9e] max-w-md mx-auto">
            El tablero se organiza por estados del espacio (por ejemplo Por hacer, En progreso).
            Los espacios nuevos los crea el sistema automáticamente; si no ves columnas, recarga o
            contacta a soporte.
          </p>
        </div>
      ) : (
        <WorkspaceCrmBoard
          workspaceId={workspaceId}
          userId={userId}
          showSkeleton={showSkeleton}
          crmStatuses={crmStatuses}
          defaultCrmStatusId={defaultCrmStatusId}
          showActivities={showActivities}
          showFollowUpTasks={showFollowUpTasks}
          showProposals={showProposals}
        />
      )}
    </div>
  );
}
