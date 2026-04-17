import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  SAAS_WORKSPACE_DETAIL_QUERY,
  type SaasWorkspaceCrmStatus,
  type SaasWorkspaceDetailResponse,
  type SaasWorkspaceDetailVariables,
} from "kadesh/components/profile/sales/workspaces/queries";

export type WorkspaceDashboardTabKey = "act" | "tasks" | "props";

export function useWorkspaceTabsConfig(workspaceId: string) {
  const wsQ = useQuery<SaasWorkspaceDetailResponse, SaasWorkspaceDetailVariables>(
    SAAS_WORKSPACE_DETAIL_QUERY,
    {
      variables: { where: { id: workspaceId } },
      skip: !workspaceId,
      fetchPolicy: "cache-and-network",
    }
  );

  const showActivities = wsQ.data?.saasWorkspace?.showActivities ?? true;
  const showProposals = wsQ.data?.saasWorkspace?.showProposals ?? true;
  const showFollowUpTasks = wsQ.data?.saasWorkspace?.showFollowUpTasks ?? true;

  const enabledTabs = [
    showActivities ? ("act" as const) : null,
    showFollowUpTasks ? ("tasks" as const) : null,
    showProposals ? ("props" as const) : null,
  ].filter(Boolean) as WorkspaceDashboardTabKey[];

  const crmStatuses: SaasWorkspaceCrmStatus[] = useMemo(() => {
    const raw = wsQ.data?.saasWorkspace?.crmStatuses ?? [];
    return [...raw]
      .filter((s) => !s.isArchived)
      .sort((a, b) => a.order - b.order);
  }, [wsQ.data?.saasWorkspace?.crmStatuses]);

  const defaultCrmStatusId =
    crmStatuses.find((s) => s.isDefault)?.id ?? crmStatuses[0]?.id ?? null;

  return {
    wsQ,
    showActivities,
    showProposals,
    showFollowUpTasks,
    enabledTabs,
    crmStatuses,
    defaultCrmStatusId,
    isLoadingConfig: wsQ.loading && !wsQ.data,
  };
}

