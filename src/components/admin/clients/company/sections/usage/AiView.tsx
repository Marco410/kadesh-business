"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { ShareBars } from "kadesh/components/panel/dashboard";
import { TRACK_EVENT, trackActivity } from "kadesh/utils/activity";
import { formatDateShort } from "kadesh/utils/format-date";
import { ADMIN_PAGE_SIZE, AI_FEATURE_LABELS } from "../../../../constants";
import {
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminPagination,
  AdminSectionCard,
  AdminStatTile,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
  surfaceClass,
} from "../../../../ui";
import type { AdminCompanyInsights } from "../../../clients-queries";
import {
  ADMIN_AI_CALL_CONVERSATION_QUERY,
  ADMIN_AI_CALL_LOGS_QUERY,
  type AdminAiCallConversationResponse,
  type AdminAiCallLogsResponse,
} from "../../../usage-queries";

const BILLING_LABELS: Record<string, string> = {
  managed: "Créditos Kadesh",
  byok: "Su propia llave",
};

/**
 * Prompt y respuesta de una llamada. Se piden solo al abrirla: pueden traer datos del
 * negocio del cliente. Cada apertura queda registrada (`admin.viewed_ai_prompt`).
 */
function ConversationDrawer({
  callId,
  companyId,
  onClose,
}: {
  callId: string | null;
  companyId: string;
  onClose: () => void;
}) {
  const { data, loading, error } = useQuery<AdminAiCallConversationResponse>(
    ADMIN_AI_CALL_CONVERSATION_QUERY,
    { variables: { id: callId ?? "" }, skip: !callId, fetchPolicy: "network-only" },
  );

  useEffect(() => {
    if (!callId) return;
    trackActivity(TRACK_EVENT.ADMIN_VIEWED_AI_PROMPT, {
      companyId,
      entityType: "TechAiCallLog",
      entityId: callId,
    });
  }, [callId, companyId]);

  const call = data?.techAiCallLog;
  const blocks = [
    { label: "Instrucción de la función", value: call?.featurePrompt },
    { label: "Sistema", value: call?.systemPrompt },
    { label: "Mensaje enviado", value: call?.userPrompt },
    { label: "Respuesta", value: call?.response },
  ];
  return (
    <AdminDrawer
      open={Boolean(callId)}
      onClose={onClose}
      ariaLabel="Conversación con la IA"
      title="Conversación con la IA"
      subtitle="Lo que se envió al modelo y lo que respondió."
    >
      {error ? (
        <AdminErrorState message="No se pudo cargar la conversación." />
      ) : loading && !call ? (
        <AdminLoadingRows rows={4} />
      ) : (
        <div className="flex flex-col gap-4">
          {blocks.map((block) => (
            <section key={block.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9e9e9e]">
                {block.label}
              </h4>
              <pre className="mt-1.5 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-[#fafafa] p-3 font-sans text-sm text-[#212121] dark:bg-[#252525] dark:text-white">
                {block.value?.trim() || "—"}
              </pre>
            </section>
          ))}
        </div>
      )}
    </AdminDrawer>
  );
}

export default function AiView({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const [page, setPage] = useState(1);
  const [openCallId, setOpenCallId] = useState<string | null>(null);
  const variables = useMemo(
    () => ({
      where: { company: { id: { equals: companyId } } },
      take: ADMIN_PAGE_SIZE,
      skip: (page - 1) * ADMIN_PAGE_SIZE,
    }),
    [companyId, page],
  );
  const { data, loading, error } = useQuery<AdminAiCallLogsResponse>(ADMIN_AI_CALL_LOGS_QUERY, {
    variables,
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.techAiCallLogs ?? [];
  const total = data?.techAiCallLogsCount ?? 0;
  const byFeature = (insights?.ai.byFeature ?? []).map((f) => ({
    key: f.feature,
    label: `${AI_FEATURE_LABELS[f.feature] ?? f.feature} · ${formatCredits(f.credits)} créditos`,
    count: f.calls,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid grid-cols-3 gap-2 self-start lg:grid-cols-1">
          <AdminStatTile
            label={`Llamadas en ${insights?.days ?? 30} días`}
            value={formatCredits(insights?.ai.calls ?? 0)}
          />
          <AdminStatTile label="Créditos" value={formatCredits(insights?.ai.credits ?? 0)} />
          <AdminStatTile
            label="Con error"
            value={formatCredits(insights?.ai.failed ?? 0)}
            tone={insights?.ai.failed ? "warning" : "default"}
          />
        </div>
        <AdminSectionCard title="Por función" description="Llamadas a la IA por función.">
          <ShareBars items={byFeature} emptyLabel="Todavía no usan la IA." />
        </AdminSectionCard>
      </div>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && rows.length === 0 ? (
        <AdminLoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin llamadas a la IA"
          description="Cada brief, resumen diario o análisis de mercado queda registrado aquí."
        />
      ) : (
        <>
          <div className={`${surfaceClass} relative overflow-x-auto`}>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide text-[#616161] dark:border-[#333] dark:text-[#b0b0b0]">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Función</th>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Tokens</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Conversación</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                      {formatDateShort(row.createdAt, true)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#212121] dark:text-white">
                      {AI_FEATURE_LABELS[row.feature ?? ""] ?? row.feature ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                      {row.user ? formatPersonName(row.user.name, row.user.lastName) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                      {row.model ?? "—"}
                      {row.billingMode ? (
                        <span className="block text-[#9e9e9e]">
                          {BILLING_LABELS[row.billingMode] ?? row.billingMode}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-[#616161] dark:text-[#b0b0b0]">
                      {formatCredits((row.inputTokens ?? 0) + (row.outputTokens ?? 0))}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#212121] dark:text-white">
                      {formatCredits(row.creditsCharged ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge
                        label={row.success ? "OK" : "Falló"}
                        className={
                          row.success
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-500/15 text-red-700 dark:text-red-300"
                        }
                      />
                      {!row.success && row.errorMessage ? (
                        <span className="mt-1 block max-w-[200px] truncate text-xs text-red-700 dark:text-red-300">
                          {row.errorMessage}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenCallId(row.id)}
                        className="h-9 whitespace-nowrap rounded-lg border border-[#e0e0e0] px-3 text-xs font-semibold text-[#212121] hover:border-orange-300 dark:border-[#3a3a3a] dark:text-white cursor-pointer"
                      >
                        Ver conversación
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            totalCount={total}
            pageSize={ADMIN_PAGE_SIZE}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}
      <ConversationDrawer
        callId={openCallId}
        companyId={companyId}
        onClose={() => setOpenCallId(null)}
      />
    </div>
  );
}
