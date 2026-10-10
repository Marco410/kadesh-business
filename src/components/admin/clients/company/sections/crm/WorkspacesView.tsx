"use client";

import { useQuery } from "@apollo/client";
import {
  AdminAvatar,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  formatPersonName,
  surfaceClass,
} from "../../../../ui";
import {
  ADMIN_COMPANY_WORKSPACES_QUERY,
  type AdminCompanyWorkspacesResponse,
} from "../../../crm-queries";

/** Espacios de trabajo de la empresa: quién está en cada uno, sus columnas y cuánto tienen. */
export default function WorkspacesView({ companyId }: { companyId: string }) {
  const { data, loading, error } = useQuery<AdminCompanyWorkspacesResponse>(
    ADMIN_COMPANY_WORKSPACES_QUERY,
    {
      variables: { where: { company: { id: { equals: companyId } } } },
      fetchPolicy: "cache-and-network",
    },
  );
  const workspaces = data?.saasWorkspaces ?? [];

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !data) return <AdminLoadingRows rows={3} />;
  if (workspaces.length === 0) {
    return (
      <AdminEmptyState
        title="Sin espacios de trabajo"
        description="Cada empresa nace con el espacio “Ventas”; si no aparece, se borró."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {workspaces.map((ws) => {
        const columns = ws.crmStatuses.filter((s) => !s.isArchived);
        return (
          <li key={ws.id} className={`${surfaceClass} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-[#212121] dark:text-white">{ws.name}</h3>
              <p className="text-xs text-[#9e9e9e]">
                {ws.members.length} miembro{ws.members.length === 1 ? "" : "s"}
              </p>
            </div>
            {ws.members.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {ws.members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-1.5 rounded-full bg-black/5 py-0.5 pl-0.5 pr-2.5 text-xs text-[#424242] dark:bg-white/10 dark:text-[#e0e0e0]"
                  >
                    <AdminAvatar name={m.name} lastName={m.lastName} size={22} />
                    {formatPersonName(m.name, m.lastName)}
                  </li>
                ))}
              </ul>
            ) : null}
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                { label: "Actividades", value: ws.salesActivitiesCount, on: ws.showActivities },
                { label: "Seguimientos", value: ws.followUpTasksCount, on: ws.showFollowUpTasks },
                { label: "Propuestas", value: ws.proposalsCount, on: ws.showProposals },
                { label: "Tareas", value: ws.tasksCount, on: ws.showTasks },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-[#9e9e9e]">
                    {item.label}
                    {item.on === false ? " (oculto)" : ""}
                  </dt>
                  <dd className="font-semibold tabular-nums text-[#212121] dark:text-white">
                    {item.value ?? 0}
                  </dd>
                </div>
              ))}
            </dl>
            {columns.length ? (
              <div className="mt-4">
                <p className="text-xs text-[#9e9e9e]">Columnas del tablero</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {columns.map((col) => (
                    <li
                      key={col.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e8] px-2.5 py-0.5 text-xs text-[#424242] dark:border-[#333] dark:text-[#e0e0e0]"
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: col.color || "#9e9e9e" }}
                      />
                      {col.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
