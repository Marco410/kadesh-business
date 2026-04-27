"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import type { InternalRefetchQueriesInclude } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  TECH_FOLLOW_UP_TASKS_QUERY,
  TECH_PROPOSALS_QUERY,
  TECH_SALES_ACTIVITIES_QUERY,
  TECH_TASKS_QUERY,
  UPDATE_TECH_FOLLOW_UP_TASK_MUTATION,
  UPDATE_TECH_PROPOSAL_MUTATION,
  UPDATE_TECH_SALES_ACTIVITY_MUTATION,
  UPDATE_TECH_TASK_MUTATION,
  type TechFollowUpTasksResponse,
  type TechFollowUpTasksVariables,
  type TechProposalsResponse,
  type TechProposalsVariables,
  type TechSalesActivitiesResponse,
  type TechSalesActivitiesVariables,
  type TechTasksResponse,
  type TechTasksVariables,
  type UpdateTechFollowUpTaskMutation,
  type UpdateTechFollowUpTaskVariables,
  type UpdateTechProposalMutation,
  type UpdateTechProposalVariables,
  type UpdateTechSalesActivityMutation,
  type UpdateTechSalesActivityVariables,
  type UpdateTechTaskMutation,
  type UpdateTechTaskVariables,
} from "kadesh/components/profile/sales/queries";
import type { SaasWorkspaceCrmStatus } from "kadesh/components/profile/sales/workspaces/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import { readWorkspaceCrmDragPayload } from "kadesh/components/profile/sales/workspaces/workspace-crm-drag";
import WorkspaceCrmStatusColumn, {
  type WorkspaceCrmBoardViewTab,
  type WorkspaceCrmEntityTab,
} from "kadesh/components/profile/sales/workspaces/tabs/WorkspaceCrmStatusColumn";
import CreateWorkspaceActivityModal from "kadesh/components/profile/sales/workspaces/tabs/modals/CreateWorkspaceActivityModal";
import CreateWorkspaceFollowUpModal from "kadesh/components/profile/sales/workspaces/tabs/modals/CreateWorkspaceFollowUpModal";
import CreateWorkspaceProposalModal from "kadesh/components/profile/sales/workspaces/tabs/modals/CreateWorkspaceProposalModal";
import CreateWorkspaceTechTaskModal from "kadesh/components/profile/sales/workspaces/tabs/modals/CreateWorkspaceTechTaskModal";
import EditWorkspaceActivityModal from "kadesh/components/profile/sales/workspaces/tabs/modals/EditWorkspaceActivityModal";
import EditWorkspaceFollowUpModal from "kadesh/components/profile/sales/workspaces/tabs/modals/EditWorkspaceFollowUpModal";
import EditWorkspaceProposalModal from "kadesh/components/profile/sales/workspaces/tabs/modals/EditWorkspaceProposalModal";
import EditWorkspaceTechTaskModal from "kadesh/components/profile/sales/workspaces/tabs/modals/EditWorkspaceTechTaskModal";

type ActivityRow = TechSalesActivitiesResponse["techSalesActivities"][number];
type TaskRow = TechFollowUpTasksResponse["techFollowUpTasks"][number];
type ProposalRow = TechProposalsResponse["techProposals"][number];
type TechTaskRow = TechTasksResponse["techTasks"][number];

export interface WorkspaceCrmBoardProps {
  workspaceId: string;
  userId: string;
  showSkeleton?: boolean;
  crmStatuses: SaasWorkspaceCrmStatus[];
  defaultCrmStatusId: string | null;
  showTasks: boolean;
  showActivities: boolean;
  showFollowUpTasks: boolean;
  showProposals: boolean;
}

export default function WorkspaceCrmBoard({
  workspaceId,
  userId,
  showSkeleton,
  crmStatuses,
  defaultCrmStatusId,
  showTasks,
  showActivities,
  showFollowUpTasks,
  showProposals,
}: WorkspaceCrmBoardProps) {
  const mainEntityTabOptions = useMemo((): { key: WorkspaceCrmEntityTab; title: string }[] => {
    const o: { key: WorkspaceCrmEntityTab; title: string }[] = [];
    if (showTasks) o.push({ key: "tech", title: "Tareas" });
    if (showActivities) o.push({ key: "act", title: "Actividades" });
    if (showFollowUpTasks) o.push({ key: "tasks", title: "Seguimientos" });
    if (showProposals) o.push({ key: "props", title: "Propuestas" });
    return o;
  }, [showTasks, showActivities, showFollowUpTasks, showProposals]);

  const validBoardTabKeys = useMemo((): WorkspaceCrmBoardViewTab[] => {
    const keys: WorkspaceCrmBoardViewTab[] = mainEntityTabOptions.map((e) => e.key);
    if (keys.length > 0) keys.push("hidden");
    return keys;
  }, [mainEntityTabOptions]);

  const [boardViewTab, setBoardViewTab] = useState<WorkspaceCrmBoardViewTab>(() => {
    if (showTasks) return "tech";
    if (showActivities) return "act";
    if (showFollowUpTasks) return "tasks";
    return "props";
  });

  useEffect(() => {
    if (validBoardTabKeys.length === 0) return;
    if (!validBoardTabKeys.includes(boardViewTab)) {
      setBoardViewTab(validBoardTabKeys[0]!);
    }
  }, [workspaceId, validBoardTabKeys, boardViewTab]);

  const [openTechTask, setOpenTechTask] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openFollowUp, setOpenFollowUp] = useState(false);
  const [openProposal, setOpenProposal] = useState(false);

  const [editTechTask, setEditTechTask] = useState<TechTaskRow | null>(null);
  const [editActivity, setEditActivity] = useState<ActivityRow | null>(null);
  const [editTask, setEditTask] = useState<TaskRow | null>(null);
  const [editProposal, setEditProposal] = useState<ProposalRow | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);

  const activitiesWhere: TechSalesActivitiesVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );
  const tasksWhere: TechFollowUpTasksVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );
  const proposalsWhere: TechProposalsVariables["where"] = mergeWorkspaceFilter(
    {},
    workspaceId
  );
  const techTasksWhere: TechTasksVariables["where"] = mergeWorkspaceFilter({}, workspaceId);

  const techQ = useQuery<TechTasksResponse, TechTasksVariables>(TECH_TASKS_QUERY, {
    variables: { where: techTasksWhere },
    skip: !workspaceId || !showTasks,
    fetchPolicy: "cache-and-network",
  });

  const actQ = useQuery<TechSalesActivitiesResponse, TechSalesActivitiesVariables>(
    TECH_SALES_ACTIVITIES_QUERY,
    {
      variables: { where: activitiesWhere },
      skip: !workspaceId || !showActivities,
      fetchPolicy: "cache-and-network",
    }
  );

  const taskQ = useQuery<TechFollowUpTasksResponse, TechFollowUpTasksVariables>(
    TECH_FOLLOW_UP_TASKS_QUERY,
    {
      variables: { where: tasksWhere },
      skip: !workspaceId || !showFollowUpTasks,
      fetchPolicy: "cache-and-network",
    }
  );

  const propQ = useQuery<TechProposalsResponse, TechProposalsVariables>(
    TECH_PROPOSALS_QUERY,
    {
      variables: { where: proposalsWhere },
      skip: !workspaceId || !showProposals,
      fetchPolicy: "cache-and-network",
    }
  );

  const { registerWorkspaceBoardRefetch } = useWorkspaceContext();

  const boardQueriesRef = useRef({
    showTasks,
    showActivities,
    showFollowUpTasks,
    showProposals,
    techQ,
    actQ,
    taskQ,
    propQ,
  });
  boardQueriesRef.current = {
    showTasks,
    showActivities,
    showFollowUpTasks,
    showProposals,
    techQ,
    actQ,
    taskQ,
    propQ,
  };

  useEffect(() => {
    const run = async () => {
      const q = boardQueriesRef.current;
      await Promise.all([
        q.showTasks ? q.techQ.refetch() : Promise.resolve(),
        q.showActivities ? q.actQ.refetch() : Promise.resolve(),
        q.showFollowUpTasks ? q.taskQ.refetch() : Promise.resolve(),
        q.showProposals ? q.propQ.refetch() : Promise.resolve(),
      ]);
    };
    registerWorkspaceBoardRefetch(run);
    return () => {
      registerWorkspaceBoardRefetch(null);
    };
  }, [registerWorkspaceBoardRefetch]);

  const techTasks = techQ.data?.techTasks ?? [];
  const activities = actQ.data?.techSalesActivities ?? [];
  const tasks = taskQ.data?.techFollowUpTasks ?? [];
  const proposals = propQ.data?.techProposals ?? [];

  const boardRefetches = useMemo((): InternalRefetchQueriesInclude => {
    const q: InternalRefetchQueriesInclude = [];
    if (showTasks) {
      q.push({
        query: TECH_TASKS_QUERY,
        variables: { where: mergeWorkspaceFilter({}, workspaceId) },
      });
    }
    if (showActivities) {
      q.push({
        query: TECH_SALES_ACTIVITIES_QUERY,
        variables: { where: mergeWorkspaceFilter({}, workspaceId) },
      });
    }
    if (showFollowUpTasks) {
      q.push({
        query: TECH_FOLLOW_UP_TASKS_QUERY,
        variables: { where: mergeWorkspaceFilter({}, workspaceId) },
      });
    }
    if (showProposals) {
      q.push({
        query: TECH_PROPOSALS_QUERY,
        variables: { where: mergeWorkspaceFilter({}, workspaceId) },
      });
    }
    return q;
  }, [workspaceId, showTasks, showActivities, showFollowUpTasks, showProposals]);

  const [updateActivity] = useMutation<
    UpdateTechSalesActivityMutation,
    UpdateTechSalesActivityVariables
  >(UPDATE_TECH_SALES_ACTIVITY_MUTATION, {
    refetchQueries: boardRefetches,
    awaitRefetchQueries: true,
  });

  const [updateTask] = useMutation<
    UpdateTechFollowUpTaskMutation,
    UpdateTechFollowUpTaskVariables
  >(UPDATE_TECH_FOLLOW_UP_TASK_MUTATION, {
    refetchQueries: boardRefetches,
    awaitRefetchQueries: true,
  });

  const [updateProposal] = useMutation<
    UpdateTechProposalMutation,
    UpdateTechProposalVariables
  >(UPDATE_TECH_PROPOSAL_MUTATION, {
    refetchQueries: boardRefetches,
    awaitRefetchQueries: true,
  });

  const [updateTechTask] = useMutation<UpdateTechTaskMutation, UpdateTechTaskVariables>(
    UPDATE_TECH_TASK_MUTATION,
    {
      refetchQueries: boardRefetches,
      awaitRefetchQueries: true,
    }
  );

  const handleDropToColumn = useCallback(
    async (columnStatusId: string, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDropTargetColumnId(null);
      const payload = readWorkspaceCrmDragPayload(e.dataTransfer);
      if (!payload) return;
      if (boardViewTab !== "hidden") {
        if (payload.entity !== boardViewTab) return;
      } else {
        if (
          (payload.entity === "tech" && !showTasks) ||
          (payload.entity === "act" && !showActivities) ||
          (payload.entity === "tasks" && !showFollowUpTasks) ||
          (payload.entity === "props" && !showProposals)
        ) {
          return;
        }
      }

      const item =
        payload.entity === "tech"
          ? techTasks.find((x) => x.id === payload.id)
          : payload.entity === "act"
            ? activities.find((x) => x.id === payload.id)
            : payload.entity === "tasks"
              ? tasks.find((x) => x.id === payload.id)
              : proposals.find((x) => x.id === payload.id);
      if (!item) return;

      const effectiveStatusId =
        "statusCrm" in item && item.statusCrm?.id
          ? item.statusCrm.id
          : defaultCrmStatusId ?? null;
      if (effectiveStatusId === columnStatusId) return;

      const data = { statusCrm: { connect: { id: columnStatusId } } };
      try {
        if (payload.entity === "tech") {
          await updateTechTask({ variables: { where: { id: item.id }, data } });
        } else if (payload.entity === "act") {
          await updateActivity({ variables: { where: { id: item.id }, data } });
        } else if (payload.entity === "tasks") {
          await updateTask({ variables: { where: { id: item.id }, data } });
        } else {
          await updateProposal({ variables: { where: { id: item.id }, data } });
        }
      } catch (err) {
        sileo.error({
          title:
            err instanceof Error ? err.message : "No se pudo actualizar el estado CRM",
        });
      }
    },
    [
      boardViewTab,
      showTasks,
      showActivities,
      showFollowUpTasks,
      showProposals,
      techTasks,
      activities,
      tasks,
      proposals,
      defaultCrmStatusId,
      updateTechTask,
      updateActivity,
      updateTask,
      updateProposal,
    ]
  );

  const loadingTechTasks = showSkeleton || (showTasks && techQ.loading && !techQ.data);
  const loadingActivities =
    showSkeleton || (showActivities && actQ.loading && !actQ.data);
  const loadingTasks =
    showSkeleton || (showFollowUpTasks && taskQ.loading && !taskQ.data);
  const loadingProposals =
    showSkeleton || (showProposals && propQ.loading && !propQ.data);
  const columnLoading =
    boardViewTab === "hidden"
      ? showSkeleton ||
        (showTasks && techQ.loading && !techQ.data) ||
        (showActivities && actQ.loading && !actQ.data) ||
        (showFollowUpTasks && taskQ.loading && !taskQ.data) ||
        (showProposals && propQ.loading && !propQ.data)
      : boardViewTab === "tech"
        ? loadingTechTasks
        : boardViewTab === "act"
          ? loadingActivities
          : boardViewTab === "tasks"
            ? loadingTasks
            : loadingProposals;

  const addBtnClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-orange-600 shadow-sm hover:border-orange-300 hover:bg-orange-50/80 dark:border-[#333] dark:bg-[#1e1e1e] dark:text-orange-400 dark:shadow-none dark:hover:bg-orange-500/5";

  const tabGroupShellClass =
    "rounded-xl border border-neutral-300/90 bg-neutral-200/90 p-1.5 shadow-sm dark:border-transparent dark:bg-[#252525] dark:shadow-none";

  const tabButtonSelectedClass =
    "border border-neutral-200/80 bg-white font-semibold text-neutral-900 shadow-sm dark:border-transparent dark:bg-[#1e1e1e] dark:text-white dark:shadow-sm";
  const tabButtonIdleClass =
    "border border-transparent font-medium text-neutral-600 dark:text-neutral-400";

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {mainEntityTabOptions.length > 0 ? (
            <div className="flex min-w-0 flex-wrap items-stretch gap-3 sm:gap-4">
              <div
                role="tablist"
                aria-label="Qué ver en el tablero"
                className={`flex min-w-0 max-w-xl flex-1 gap-1 ${tabGroupShellClass}`}
              >
                {mainEntityTabOptions.map((opt) => {
                  const selected = boardViewTab === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setBoardViewTab(opt.key)}
                      className={`inline-flex min-w-0 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1a1a] ${
                        selected ? tabButtonSelectedClass : tabButtonIdleClass
                      }`}
                    >
                      {opt.title}
                    </button>
                  );
                })}
              </div>
              <div
                role="tablist"
                aria-label="Registros ocultos en el workspace"
                className="flex shrink-0 self-center border-l border-neutral-300/80 pl-3 dark:border-neutral-600 sm:pl-4"
              >
                <div className={`inline-flex ${tabGroupShellClass}`}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={boardViewTab === "hidden"}
                    onClick={() => setBoardViewTab("hidden")}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1a1a] ${
                      boardViewTab === "hidden"
                        ? tabButtonSelectedClass
                        : tabButtonIdleClass
                    }`}
                  >
                    Ocultos
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {boardViewTab !== "hidden" && boardViewTab === "tech" && showTasks && (
            <button type="button" onClick={() => setOpenTechTask(true)} className={addBtnClass}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Agregar tarea
            </button>
          )}
          {boardViewTab !== "hidden" && boardViewTab === "act" && showActivities && (
            <button type="button" onClick={() => setOpenActivity(true)} className={addBtnClass}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Agregar actividad
            </button>
          )}
          {boardViewTab !== "hidden" && boardViewTab === "tasks" && showFollowUpTasks && (
            <button type="button" onClick={() => setOpenFollowUp(true)} className={addBtnClass}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Agregar seguimiento
            </button>
          )}
          {boardViewTab !== "hidden" && boardViewTab === "props" && showProposals && (
            <button type="button" onClick={() => setOpenProposal(true)} className={addBtnClass}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Agregar propuesta
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-neutral-100 to-neutral-50/90 p-3 pb-3 shadow-inner scroll-smooth [scrollbar-gutter:stable] dark:border-transparent dark:bg-transparent dark:p-0 dark:from-transparent dark:to-transparent dark:shadow-none sm:gap-4">
        {crmStatuses.map((status) => (
          <WorkspaceCrmStatusColumn
            key={status.id}
            status={status}
            defaultStatusColumnId={defaultCrmStatusId}
            entityTab={boardViewTab === "hidden" ? "act" : boardViewTab}
            showHiddenOnly={boardViewTab === "hidden"}
            techTasks={techTasks}
            activities={activities}
            tasks={tasks}
            proposals={proposals}
            loading={columnLoading}
            dropHighlight={dropTargetColumnId === status.id}
            onColumnDragEnter={() => setDropTargetColumnId(status.id)}
            onColumnDragLeave={(ev) => {
              const rel = ev.relatedTarget as Node | null;
              if (rel && ev.currentTarget.contains(rel)) return;
              setDropTargetColumnId((cur) => (cur === status.id ? null : cur));
            }}
            onColumnDrop={(ev) => {
              void handleDropToColumn(status.id, ev);
            }}
            onBoardDragEnd={() => setDropTargetColumnId(null)}
            onEditTechTask={setEditTechTask}
            onEditActivity={setEditActivity}
            onEditTask={setEditTask}
            onEditProposal={setEditProposal}
          />
        ))}
      </div>

      {showTasks && (
        <CreateWorkspaceTechTaskModal
          isOpen={openTechTask}
          onClose={() => setOpenTechTask(false)}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatusCrmId={defaultCrmStatusId}
        />
      )}
      {showActivities && (
        <CreateWorkspaceActivityModal
          isOpen={openActivity}
          onClose={() => setOpenActivity(false)}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatusCrmId={defaultCrmStatusId}
        />
      )}
      {showFollowUpTasks && (
        <CreateWorkspaceFollowUpModal
          isOpen={openFollowUp}
          onClose={() => setOpenFollowUp(false)}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatusCrmId={defaultCrmStatusId}
        />
      )}
      {showProposals && (
        <CreateWorkspaceProposalModal
          isOpen={openProposal}
          onClose={() => setOpenProposal(false)}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatusCrmId={defaultCrmStatusId}
        />
      )}

      {showTasks && (
        <EditWorkspaceTechTaskModal
          isOpen={editTechTask != null}
          onClose={() => setEditTechTask(null)}
          workspaceId={workspaceId}
          task={editTechTask}
          crmStatuses={crmStatuses}
          defaultCrmStatusId={defaultCrmStatusId}
        />
      )}
      {showActivities && (
        <EditWorkspaceActivityModal
          isOpen={editActivity != null}
          onClose={() => setEditActivity(null)}
          workspaceId={workspaceId}
          activity={editActivity}
          crmStatuses={crmStatuses}
          defaultCrmStatusId={defaultCrmStatusId}
        />
      )}
      {showFollowUpTasks && (
        <EditWorkspaceFollowUpModal
          isOpen={editTask != null}
          onClose={() => setEditTask(null)}
          workspaceId={workspaceId}
          task={editTask}
          crmStatuses={crmStatuses}
          defaultCrmStatusId={defaultCrmStatusId}
        />
      )}
      {showProposals && (
        <EditWorkspaceProposalModal
          isOpen={editProposal != null}
          onClose={() => setEditProposal(null)}
          workspaceId={workspaceId}
          proposal={editProposal}
          crmStatuses={crmStatuses}
          defaultCrmStatusId={defaultCrmStatusId}
        />
      )}
    </>
  );
}
