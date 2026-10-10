"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { formatDate, formatDateShort } from "kadesh/utils/format-date";
import {
  AdminDefinitionList,
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  AdminStatusBadge,
  formatCredits,
  formatPersonName,
} from "../../../ui";
import {
  ADMIN_COMPANY_INTEGRATIONS_QUERY,
  companyIntegrationsVariables,
  type AdminCompanyInsights,
  type AdminCompanyIntegrationsResponse,
} from "../../clients-queries";

const TEMPLATE_STATUS: Record<string, string> = {
  none: "Sin plantilla",
  pending: "En revisión de Meta",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const AI_BILLING: Record<string, string> = {
  byok: "Su propia llave (BYOK)",
  managed: "Administrada por Kadesh (gasta créditos)",
};

const OPERATION_LABELS: Record<string, string> = {
  create: "Crear evento",
  update: "Actualizar evento",
  delete: "Borrar evento",
  list_events: "Leer eventos",
  token_refresh: "Renovar acceso",
  list_calendars: "Leer calendarios",
};

function ConnectedBadge({ on }: { on: boolean }) {
  return (
    <AdminStatusBadge
      label={on ? "Conectado" : "Sin conectar"}
      className={
        on
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]"
      }
    />
  );
}

/** WhatsApp, IA y Google Calendar: si están conectados, cuánto se usan y su último error. */
export default function CompanyIntegrations({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const variables = useMemo(() => companyIntegrationsVariables(companyId), [companyId]);
  const { data, loading, error } = useQuery<AdminCompanyIntegrationsResponse>(
    ADMIN_COMPANY_INTEGRATIONS_QUERY,
    { variables, fetchPolicy: "cache-and-network" },
  );

  if (error) return <AdminErrorState message={error.message} />;
  if (loading && !data) return <AdminLoadingRows rows={4} />;
  const company = data?.saasCompany;
  if (!company) return null;
  const accounts = data?.googleCalendarAccounts ?? [];
  const logs = data?.techGoogleCalendarSyncLogs ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AdminSectionCard
        title="WhatsApp"
        action={<ConnectedBadge on={Boolean(company.whatsappConnectedAt)} />}
      >
        <AdminDefinitionList
          columns={2}
          items={[
            { label: "Número", value: company.whatsappDisplayPhoneNumber || "—" },
            {
              label: "Conectado desde",
              value: company.whatsappConnectedAt
                ? formatDateShort(company.whatsappConnectedAt, false)
                : "—",
            },
            {
              label: "Webhook",
              value: company.whatsappWebhookConfiguredAt ? "Configurado" : "Sin configurar",
            },
            {
              label: "Último mensaje recibido de Meta",
              value: company.whatsappLastWebhookAt ? formatDate(company.whatsappLastWebhookAt) : "—",
            },
            {
              label: "Plantilla",
              value: company.whatsappTemplateName
                ? `${company.whatsappTemplateName} · ${TEMPLATE_STATUS[company.whatsappTemplateStatus ?? "none"] ?? company.whatsappTemplateStatus}`
                : TEMPLATE_STATUS[company.whatsappTemplateStatus ?? "none"] ?? "—",
            },
            {
              label: `Mensajes (${insights?.days ?? 30} días)`,
              value: insights
                ? `${formatCredits(insights.whatsapp.outbound)} enviados · ${formatCredits(insights.whatsapp.inbound)} recibidos${insights.whatsapp.failed ? ` · ${insights.whatsapp.failed} fallidos` : ""}`
                : "—",
            },
          ]}
        />
      </AdminSectionCard>

      <AdminSectionCard title="IA" action={<ConnectedBadge on={Boolean(company.aiProvider)} />}>
        <AdminDefinitionList
          columns={2}
          items={[
            {
              label: "Cómo se cobra",
              value: AI_BILLING[company.aiBillingMode ?? ""] ?? company.aiBillingMode ?? "—",
            },
            { label: "Proveedor", value: company.aiProvider || "—" },
            { label: "Modelo", value: company.aiModel || "Default" },
            {
              label: "Llave actualizada",
              value: company.aiKeyUpdatedAt ? formatDateShort(company.aiKeyUpdatedAt, false) : "—",
            },
          ]}
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Google Calendar"
        className="xl:col-span-2"
        action={<ConnectedBadge on={accounts.some((a) => a.isActive)} />}
      >
        {accounts.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">Ninguna cuenta conectada.</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
            {accounts.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#212121] dark:text-white">
                    {a.googleAccountEmail || "Cuenta de Google"}
                    <span className="ml-2 text-xs font-normal text-[#9e9e9e]">
                      {a.scopeType === "company" ? "Compartida" : "Personal"}
                    </span>
                  </p>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {a.user ? formatPersonName(a.user.name, a.user.lastName) : null}
                    {a.connectedByUser
                      ? ` · conectó ${formatPersonName(a.connectedByUser.name, a.connectedByUser.lastName)}`
                      : ""}
                    {a.lastSyncedAt ? ` · último sync ${formatDate(a.lastSyncedAt)}` : " · nunca sincronizó"}
                  </p>
                  {a.lastSyncError ? (
                    <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{a.lastSyncError}</p>
                  ) : null}
                </div>
                <AdminStatusBadge
                  label={a.isActive ? "Activa" : "Apagada"}
                  className={
                    a.isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-black/5 text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]"
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {logs.length ? (
          <div className="mt-4">
            <p className="text-xs text-[#9e9e9e]">Últimas sincronizaciones</p>
            <ul className="mt-1.5 divide-y divide-[#f0f0f0] dark:divide-[#2a2a2a]">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                  <span className="text-[#212121] dark:text-white">
                    {OPERATION_LABELS[log.operation ?? ""] ?? log.operation}
                    {log.errorMessage ? (
                      <span className="ml-1 text-red-700 dark:text-red-300">· {log.errorMessage}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-[#9e9e9e]">
                    {log.success ? "OK" : "Falló"} · {formatDateShort(log.createdAt, true)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}
