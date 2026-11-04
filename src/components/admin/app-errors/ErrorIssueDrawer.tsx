"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import { describeUserAgent } from "kadesh/utils/user-agent";
import ActivityTimeline from "../activity/ActivityTimeline";
import { AppChip } from "../activity/ActivityContext";
import { useActivityFeed } from "../activity/useActivityFeed";
import { ACTIVITY_APP_LABELS, pageLabel } from "../constants";
import { adminErrorText } from "../errors";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import {
  AdminButton,
  AdminDefinitionList,
  AdminDrawer,
  AdminStatusBadge,
  adminLabelClass,
  adminTextareaClass,
  formatPersonName,
} from "../ui";
import {
  ADMIN_SET_ERROR_ISSUE_STATUS_MUTATION,
  ERROR_ISSUE_STATUS_LABELS,
  errorOriginLabel,
  type AdminErrorIssue,
  type ErrorIssueStatus,
} from "./app-errors-queries";

type StatusResult = { adminSetErrorIssueStatus: { success: boolean; message: string } };

/** Sistema y navegador más comunes del error (de los user agents agrupados). */
function deviceBreakdown(userAgents: AdminErrorIssue["userAgents"]) {
  const totals = new Map<string, number>();
  for (const ua of userAgents) {
    const info = describeUserAgent(ua.key);
    const label = [info.os, info.browser].filter(Boolean).join(" · ") || "Desconocido";
    totals.set(label, (totals.get(label) ?? 0) + ua.count);
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

function Occurrences({ fingerprint }: { fingerprint: string }) {
  const { openPerson, openCompany } = useAdminNavigation();
  const input = useMemo(() => ({ fingerprint, types: ["errors" as const], take: 15 }), [fingerprint]);
  const feed = useActivityFeed(input);
  return (
    <ActivityTimeline
      items={feed.items}
      loading={feed.loading}
      error={feed.error}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
      onLoadMore={feed.loadMore}
      onOpenPerson={(userId, companyId) => openPerson(userId, companyId)}
      onOpenCompany={(companyId) => openCompany(companyId)}
      emptyTitle="Sin ocurrencias en el periodo"
      emptyDescription="Las ocurrencias de este error aparecen aquí."
      bare
    />
  );
}

/** Detalle de un error agrupado: qué es, a quién le pasó, desde dónde y qué se decidió. */
export default function ErrorIssueDrawer({
  issue,
  onClose,
  onChanged,
}: {
  issue: AdminErrorIssue | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [setStatus, { loading }] = useMutation<StatusResult>(ADMIN_SET_ERROR_ISSUE_STATUS_MUTATION);

  const change = async (status: ErrorIssueStatus) => {
    if (!issue) return;
    try {
      const { data } = await setStatus({
        variables: {
          fingerprint: issue.fingerprint,
          status,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      });
      const outcome = data?.adminSetErrorIssueStatus;
      if (!outcome?.success) {
        sileo.error({ title: outcome?.message ?? "No se pudo cambiar el estado" });
        return;
      }
      sileo.success({ title: `Error ${ERROR_ISSUE_STATUS_LABELS[status].toLowerCase()}` });
      setNote("");
      onChanged();
    } catch (err) {
      sileo.error({ title: adminErrorText(err, "No se pudo cambiar el estado") });
    }
  };

  const devices = issue ? deviceBreakdown(issue.userAgents) : [];

  return (
    <AdminDrawer
      open={Boolean(issue)}
      onClose={onClose}
      ariaLabel="Detalle del error"
      title={issue?.title ?? "Error"}
      subtitle={issue?.message ?? undefined}
    >
      {issue ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge
              label={issue.reopened ? "Reabierto" : ERROR_ISSUE_STATUS_LABELS[issue.status]}
              className={
                issue.status === "open"
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : issue.status === "resolved"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-dash-surface-2 text-dash-soft"
              }
            />
            {issue.apps.map((app) => (
              <AppChip key={app} app={app} />
            ))}
          </div>

          <AdminDefinitionList
            columns={2}
            items={[
              { label: "Origen", value: errorOriginLabel(issue) },
              {
                label: "Operación",
                value: issue.operation
                  ? `${issue.operation}${issue.opType ? ` (${issue.opType === "mutation" ? "cambio" : "consulta"})` : ""}`
                  : "—",
              },
              { label: "Veces", value: issue.count.toLocaleString("es-MX") },
              {
                label: "Personas",
                value: `${issue.people.toLocaleString("es-MX")}${
                  issue.anonymous ? ` · ${issue.anonymous.toLocaleString("es-MX")} sin sesión` : ""
                }`,
              },
              { label: "Primera vez", value: formatDateShort(issue.firstSeen, true) },
              { label: "Última vez", value: formatDateShort(issue.lastSeen, true) },
              {
                label: "Pantalla (última)",
                value: issue.page ? `${pageLabel(issue.page) ?? issue.page}` : "—",
              },
              { label: "Código", value: issue.code ?? "—" },
              {
                label: "Apps",
                value: issue.apps.length
                  ? issue.apps.map((app) => ACTIVITY_APP_LABELS[app] ?? app).join(", ")
                  : "—",
              },
              ...(issue.resolvedAt
                ? [
                    {
                      label: issue.status === "ignored" ? "Ignorado" : "Resuelto",
                      value: `${formatDateShort(issue.resolvedAt, true)}${
                        issue.resolvedBy
                          ? ` · ${formatPersonName(issue.resolvedBy.name, issue.resolvedBy.lastName)}`
                          : ""
                      }`,
                    },
                  ]
                : []),
            ]}
          />

          {devices.length ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-dash-ink">Sistemas y navegadores</h3>
              <ul className="flex flex-col gap-1 text-sm">
                {devices.map(([label, count]) => (
                  <li key={label} className="flex justify-between gap-3">
                    <span className="text-dash-soft">{label}</span>
                    <span className="tabular-nums text-dash-muted">{count.toLocaleString("es-MX")}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {issue.note ? (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-dash-ink">Nota</h3>
              <p className="whitespace-pre-wrap text-sm text-dash-soft">{issue.note}</p>
            </section>
          ) : null}

          <section className="flex flex-col gap-3 rounded-2xl border border-dash-line p-4">
            <label htmlFor="error-issue-note" className={adminLabelClass}>
              Nota (opcional)
            </label>
            <textarea
              id="error-issue-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Qué se corrigió, o por qué no es un error real"
              className={adminTextareaClass}
              maxLength={2000}
            />
            <div className="flex flex-wrap gap-2">
              {issue.status !== "resolved" || issue.reopened ? (
                <AdminButton size="sm" disabled={loading} onClick={() => change("resolved")}>
                  Marcar resuelto
                </AdminButton>
              ) : null}
              {issue.status !== "ignored" ? (
                <AdminButton size="sm" variant="outline" disabled={loading} onClick={() => change("ignored")}>
                  Ignorar
                </AdminButton>
              ) : null}
              {issue.status !== "open" ? (
                <AdminButton size="sm" variant="ghost" disabled={loading} onClick={() => change("open")}>
                  Reabrir
                </AdminButton>
              ) : null}
            </div>
            <p className="text-xs text-dash-faint">
              Si un error resuelto vuelve a pasar, regresa a Abiertos como reabierto.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-dash-ink">Últimas veces</h3>
            <Occurrences fingerprint={issue.fingerprint} />
          </section>
        </div>
      ) : null}
    </AdminDrawer>
  );
}
